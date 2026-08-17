// ============================================================
// PCPR 2026 — Edital Verticalizado — lógica principal do app
// ============================================================

const REVISION_OFFSETS = { rev1: 1, rev2: 7, rev3: 30 }; // dias após "estudei"

let progressMap = {}; // item_id -> row do supabase
let saveQueue = {};    // debounce de gravações

// ---------- Utilidades de data ----------
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function addDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function formatDateBR(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}`;
}

// ============================================================
// AUTENTICAÇÃO
// ============================================================

const loginScreen = document.getElementById("login-screen");
const appScreen = document.getElementById("app-screen");
const loginError = document.getElementById("login-error");
const loginForm = document.getElementById("login-form");
const loginSubmitBtn = document.getElementById("login-submit");
const authModeLabel = document.getElementById("auth-mode-label");
const authToggleBtn = document.getElementById("auth-toggle-btn");

let authMode = "signin"; // ou "signup"

authToggleBtn.addEventListener("click", () => {
  authMode = authMode === "signin" ? "signup" : "signin";
  if (authMode === "signup") {
    authModeLabel.textContent = "Já tem conta?";
    authToggleBtn.textContent = "Entrar";
    loginSubmitBtn.textContent = "Criar conta";
  } else {
    authModeLabel.textContent = "Ainda não tem conta?";
    authToggleBtn.textContent = "Criar conta";
    loginSubmitBtn.textContent = "Entrar";
  }
  hideError();
});

function showError(msg) {
  loginError.textContent = msg;
  loginError.style.display = "block";
}
function hideError() {
  loginError.style.display = "none";
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  loginSubmitBtn.disabled = true;
  try {
    let result;
    if (authMode === "signup") {
      result = await supabaseClient.auth.signUp({ email, password });
    } else {
      result = await supabaseClient.auth.signInWithPassword({ email, password });
    }
    if (result.error) {
      showError(traduzErro(result.error.message));
    } else if (authMode === "signup" && !result.data.session) {
      showError("Conta criada! Verifique seu e-mail para confirmar antes de entrar.");
    }
    // se deu certo, o listener onAuthStateChange cuida da troca de tela
  } catch (err) {
    showError("Não foi possível conectar. Verifique sua internet.");
  } finally {
    loginSubmitBtn.disabled = false;
  }
});

document.getElementById("google-login").addEventListener("click", async () => {
  hideError();
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.href }
  });
  if (error) showError(traduzErro(error.message));
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
});

function traduzErro(msg) {
  if (msg.includes("Invalid login credentials")) return "E-mail ou senha inválidos.";
  if (msg.includes("User already registered")) return "Este e-mail já tem cadastro. Tente entrar.";
  if (msg.includes("Password should be at least")) return "A senha precisa ter pelo menos 6 caracteres.";
  return msg;
}

supabaseClient.auth.onAuthStateChange((_event, session) => {
  if (session && session.user) {
    showApp(session.user);
  } else {
    showLogin();
  }
});

function showLogin() {
  loginScreen.style.display = "flex";
  appScreen.style.display = "none";
}

async function showApp(user) {
  loginScreen.style.display = "none";
  appScreen.style.display = "block";
  const name = user.user_metadata?.full_name || user.email.split("@")[0];
  document.getElementById("user-name").innerHTML = `Olá, <strong>${escapeHtml(name)}</strong>`;
  await loadHeroSettings();
  await loadProgress(user.id);
  renderSyllabus();
  updateCountdown();
}

// Carrega o título (H1) e o brasão da instituição, definidos no painel admin
async function loadHeroSettings() {
  try {
    const { data, error } = await supabaseClient
      .from("app_settings")
      .select("hero_title, hero_image_url")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return;

    if (data.hero_title) {
      document.getElementById("hero-title").textContent = data.hero_title;
    }
    const img = document.getElementById("hero-crest-img");
    if (data.hero_image_url && img) {
      img.src = data.hero_image_url;
      img.style.display = "block";
    }
  } catch (err) {
    // configurações são opcionais — se falhar, mantém os valores padrão do HTML
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ============================================================
// CARREGAMENTO / GRAVAÇÃO DE PROGRESSO (Supabase)
// ============================================================

async function loadProgress(userId) {
  window.currentUserId = userId;
  const { data, error } = await supabaseClient
    .from("progress")
    .select("*")
    .eq("user_id", userId);

  progressMap = {};
  if (!error && data) {
    data.forEach(row => { progressMap[row.item_id] = row; });
  }
}

function getItemState(itemId) {
  return progressMap[itemId] || {
    item_id: itemId,
    estudei: false,
    estudei_date: null,
    rev1_done: false,
    rev1_date: null,
    rev2_done: false,
    rev2_date: null,
    rev3_done: false,
    rev3_date: null,
    questoes_total: 0,
    incidencia: ""
  };
}

async function saveItemState(itemId) {
  const state = progressMap[itemId];
  const payload = { ...state, user_id: window.currentUserId, item_id: itemId };
  delete payload.id;
  delete payload.updated_at;
  const { data, error } = await supabaseClient
    .from("progress")
    .upsert(payload, { onConflict: "user_id,item_id" })
    .select()
    .single();
  if (!error && data) {
    progressMap[itemId] = data;
  }
}

// ============================================================
// RENDERIZAÇÃO
// ============================================================

const contentEl = document.getElementById("content");
const INCIDENCIA_CYCLE = ["", "alta", "media", "baixa"];
const INCIDENCIA_LABEL = { "": "", baixa: "Baixa", media: "Média", alta: "Alta" };

function renderSyllabus() {
  contentEl.innerHTML = "";

  const heading = document.createElement("div");
  heading.className = "group-heading";
  heading.innerHTML = `<h2>Edital Verticalizado</h2><div class="line"></div>`;
  contentEl.appendChild(heading);

  SYLLABUS.forEach(group => {
    group.topics.forEach(topic => {
      contentEl.appendChild(renderTopic(topic));
    });
  });
  updateGlobalStats();
}

function renderTopic(topic) {
  const wrap = document.createElement("div");
  wrap.className = "topic";
  wrap.id = `topic-${topic.id}`;

  const topicState = getItemState(topic.id);

  const header = document.createElement("div");
  header.className = "topic-header";
  header.innerHTML = `
    <svg class="topic-chevron" width="10" height="10" viewBox="0 0 10 10"><path d="M1 0L9 5L1 10Z" fill="currentColor"/></svg>
    <div class="topic-name">${escapeHtml(topic.name)}</div>
    <div class="topic-q-add" id="topic-q-add-${topic.id}">
      <span class="q-label">Questões</span>
      <input type="number" inputmode="numeric" enterkeyhint="done" min="0" title="Digite a quantidade e confirme" id="topic-qinput-${topic.id}">
    </div>
    <div class="topic-meta" id="meta-${topic.id}"></div>
    <div class="topic-progress-ring" id="ring-${topic.id}"></div>
  `;
  header.addEventListener("click", (e) => {
    if (e.target.closest(".topic-q-add")) return;
    wrap.classList.toggle("open");
  });
  wrap.appendChild(header);

  const topicInput = header.querySelector(`#topic-qinput-${topic.id}`);
  topicInput.addEventListener("click", e => e.stopPropagation());

  async function commitTopicQuestions() {
    const val = parseInt(topicInput.value, 10);
    topicInput.value = "";
    if (!val || val <= 0) return;
    const s = getItemState(topic.id);
    s.questoes_total = (s.questoes_total || 0) + val;
    progressMap[topic.id] = s;
    await saveItemState(topic.id);
    refreshTopicHeader(topic);
    updateGlobalStats();
  }

  topicInput.addEventListener("keydown", (e) => {
    e.stopPropagation();
    if (e.key === "Enter") { e.preventDefault(); topicInput.blur(); }
  });
  topicInput.addEventListener("blur", commitTopicQuestions);

  const body = document.createElement("div");
  body.className = "topic-body";
  body.appendChild(renderItemHeaderRow());
  topic.items.forEach(item => body.appendChild(renderItemRow(topic, item)));
  wrap.appendChild(body);

  refreshTopicHeader(topic, header);
  return wrap;
}

function renderItemHeaderRow() {
  const row = document.createElement("div");
  row.className = "item-row item-row-header";
  row.innerHTML = `
    <div class="estudei-header"></div>
    <div class="incidencia-header">Incid.</div>
    <div class="item-text-header">Item</div>
    <div class="checks-header">
      <div class="check-head">1ª Rev.</div>
      <div class="check-head">2ª Rev.</div>
      <div class="check-head">3ª Rev.</div>
    </div>
    <div class="questions-header">Questões</div>
  `;
  return row;
}

function renderItemRow(topic, item) {
  const state = getItemState(item.id);
  const row = document.createElement("div");
  row.className = "item-row" + (state.estudei ? " studied" : "");
  row.id = `row-${item.id}`;

  row.appendChild(makeEstudeiToggle(topic, item, row));
  row.appendChild(makeIncidenciaBadge(topic, item));

  const textDiv = document.createElement("div");
  textDiv.className = "item-text";
  textDiv.id = `text-${item.id}`;
  textDiv.innerHTML = `<span class="item-code">${item.code}</span>${escapeHtml(item.text)}`;
  row.appendChild(textDiv);

  const checks = document.createElement("div");
  checks.className = "checks";
  checks.appendChild(makeCheckUnit(topic, item, "rev1_done", "rev1_date"));
  checks.appendChild(makeCheckUnit(topic, item, "rev2_done", "rev2_date"));
  checks.appendChild(makeCheckUnit(topic, item, "rev3_done", "rev3_date"));
  row.appendChild(checks);

  const qUnit = document.createElement("div");
  qUnit.className = "questions-unit";
  qUnit.innerHTML = `
    <input type="number" inputmode="numeric" enterkeyhint="done" min="0" title="Digite a quantidade e confirme" id="qinput-${item.id}">
    <div class="q-total" id="qtotal-${item.id}">${state.questoes_total || 0}</div>
  `;
  row.appendChild(qUnit);

  const qInput = qUnit.querySelector(`#qinput-${item.id}`);

  async function commitItemQuestions() {
    const val = parseInt(qInput.value, 10);
    qInput.value = "";
    if (!val || val <= 0) return;
    const s = getItemState(item.id);
    s.questoes_total = (s.questoes_total || 0) + val;
    progressMap[item.id] = s;
    qUnit.querySelector(`#qtotal-${item.id}`).textContent = s.questoes_total;
    await saveItemState(item.id);
    refreshTopicHeader(topic);
    updateGlobalStats();
  }

  qInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); qInput.blur(); }
  });
  qInput.addEventListener("blur", commitItemQuestions);

  return row;
}

// ---------- Toggle "Estudei" (à esquerda do item) ----------
function makeEstudeiToggle(topic, item, row) {
  const wrap = document.createElement("div");
  wrap.className = "estudei-unit";

  const state = getItemState(item.id);
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = !!state.estudei;
  checkbox.title = "Estudei";
  wrap.appendChild(checkbox);

  checkbox.addEventListener("change", async () => {
    const s = getItemState(item.id);
    s.estudei = checkbox.checked;

    if (checkbox.checked) {
      const base = s.estudei_date || todayISO();
      s.estudei_date = base;
      s.rev1_date = addDays(base, REVISION_OFFSETS.rev1);
      s.rev2_date = addDays(base, REVISION_OFFSETS.rev2);
      s.rev3_date = addDays(base, REVISION_OFFSETS.rev3);
    } else {
      s.estudei_date = null;
    }

    progressMap[item.id] = s;
    row.classList.toggle("studied", checkbox.checked);

    await saveItemState(item.id);
    refreshTopicHeader(topic);
    updateGlobalStats();
  });

  return wrap;
}

// ---------- Badge de Incidência (clique para alternar) ----------
function makeIncidenciaBadge(topic, item) {
  const state = getItemState(item.id);
  const current = state.incidencia || "";
  const badge = document.createElement("button");
  badge.type = "button";
  badge.className = `incidencia-badge inc-${current || "empty"}`;
  badge.textContent = INCIDENCIA_LABEL[current];
  badge.title = "Clique para definir a incidência";

  badge.addEventListener("click", async () => {
    const s = getItemState(item.id);
    const curr = s.incidencia || "";
    const nextIdx = (INCIDENCIA_CYCLE.indexOf(curr) + 1) % INCIDENCIA_CYCLE.length;
    const next = INCIDENCIA_CYCLE[nextIdx];
    s.incidencia = next;
    progressMap[item.id] = s;
    badge.className = `incidencia-badge inc-${next || "empty"}`;
    badge.textContent = INCIDENCIA_LABEL[next];
    await saveItemState(item.id);
  });

  return badge;
}

function makeCheckUnit(topic, item, field, dateField) {
  const state = getItemState(item.id);
  const unit = document.createElement("div");
  unit.className = "check-unit" + (state[field] ? " done" : "");
  unit.id = `unit-${item.id}-${field}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = !!state[field];

  unit.appendChild(checkbox);

  checkbox.addEventListener("change", async () => {
    const s = getItemState(item.id);
    s[field] = checkbox.checked;

    progressMap[item.id] = s;
    unit.classList.toggle("done", checkbox.checked);

    await saveItemState(item.id);
    refreshTopicHeader(topic);
    updateGlobalStats();
  });

  return unit;
}


// ---------- Cálculo de progresso por tema ----------
function computeTopicStats(topic) {
  let questoes = 0, itemsEstudados = 0;
  topic.items.forEach(item => {
    const s = getItemState(item.id);
    if (s.estudei) itemsEstudados++;
    questoes += s.questoes_total || 0;
  });
  questoes += getItemState(topic.id).questoes_total || 0;
  const totalItems = topic.items.length;
  return {
    pct: totalItems ? Math.round((itemsEstudados / totalItems) * 100) : 0,
    itemsEstudados,
    totalItems,
    questoes
  };
}

function refreshTopicHeader(topic, headerEl) {
  const stats = computeTopicStats(topic);
  const meta = headerEl ? headerEl.querySelector(".topic-meta") : document.getElementById(`meta-${topic.id}`);
  if (meta) meta.textContent = `${stats.questoes} Questões`;
  const ring = headerEl ? headerEl.querySelector(".topic-progress-ring") : document.getElementById(`ring-${topic.id}`);
  if (ring) ring.innerHTML = ringSVG(stats.pct);
}

function ringSVG(pct) {
  const r = 19, c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return `
    <svg width="42" height="42" viewBox="0 0 42 42">
      <circle cx="21" cy="21" r="${r}" fill="none" stroke="#2b2b2b" stroke-width="3"/>
      <circle cx="21" cy="21" r="${r}" fill="none" stroke="#d0d0d0" stroke-width="3"
        stroke-dasharray="${c}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
    </svg>
    <div class="pct">${pct}%</div>
  `;
}

// Anel pequeno usado nos indicadores da dashboard do topo
function dashRingSVG(pct) {
  const r = 22, c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return `
    <svg width="100%" height="100%" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r="${r}" fill="none" stroke="#2b2b2b" stroke-width="4"/>
      <circle cx="26" cy="26" r="${r}" fill="none" stroke="#f5f5f4" stroke-width="4"
        stroke-dasharray="${c}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
    </svg>
    <div class="ring-pct">${pct}%</div>
  `;
}

// ---------- Estatísticas globais ----------
function updateGlobalStats() {
  let totalItems = 0, estudados = 0, revisados = 0, questoesTotais = 0;
  SYLLABUS.forEach(group => {
    group.topics.forEach(topic => {
      // questões lançadas no nível do tópico (não amarradas a um item específico)
      questoesTotais += getItemState(topic.id).questoes_total || 0;
      topic.items.forEach(item => {
        const s = getItemState(item.id);
        totalItems++;
        if (s.estudei) estudados++;
        if (s.rev1_done || s.rev2_done || s.rev3_done) revisados++;
        questoesTotais += s.questoes_total || 0;
      });
    });
  });

  const pctEstudo = totalItems ? Math.round((estudados / totalItems) * 100) : 0;
  const pctRevisados = totalItems ? Math.round((revisados / totalItems) * 100) : 0;

  document.getElementById("ring-progresso").innerHTML = dashRingSVG(pctEstudo);
  document.getElementById("stat-progresso-foot").textContent = `${estudados}/${totalItems}`;

  document.getElementById("ring-revisados").innerHTML = dashRingSVG(pctRevisados);
  document.getElementById("stat-revisados-label").textContent = `${revisados} Conteúdos Revisados`;

  document.getElementById("stat-questoes-value").textContent = questoesTotais;
}

// ---------- Contagem regressiva para a prova ----------
function updateCountdown() {
  function tick() {
    const now = new Date();
    const exam = new Date(EXAM_DATE);
    const diffMs = exam - now;
    const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const el = document.getElementById("countdown-value");
    if (el) el.textContent = `${days}`;
    const footEl = document.getElementById("countdown-foot");
    if (footEl) {
      const dd = String(exam.getDate()).padStart(2, "0");
      const mm = String(exam.getMonth() + 1).padStart(2, "0");
      footEl.textContent = `até ${dd}/${mm}/${exam.getFullYear()}`;
    }
  }
  tick();
  setInterval(tick, 60 * 60 * 1000);
}
