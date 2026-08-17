// ============================================================
// Painel Administrativo — lógica
// ============================================================

const TOTAL_ITEMS = SYLLABUS.reduce((sum, g) => sum + g.topics.reduce((s2, t) => s2 + t.items.length, 0), 0);

const loginScreen = document.getElementById("login-screen");
const deniedScreen = document.getElementById("admin-denied");
const loadingScreen = document.getElementById("admin-loading");
const adminScreen = document.getElementById("admin-screen");
const loginError = document.getElementById("login-error");
const loginForm = document.getElementById("login-form");
const loginSubmitBtn = document.getElementById("login-submit");

function showOnly(el) {
  [loginScreen, deniedScreen, loadingScreen, adminScreen].forEach(s => { s.style.display = "none"; });
  el.style.display = el === loginScreen ? "flex" : "block";
}

function showError(msg) { loginError.textContent = msg; loginError.style.display = "block"; }
function hideError() { loginError.style.display = "none"; }

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  loginSubmitBtn.disabled = true;
  try {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) showError(error.message.includes("Invalid login credentials") ? "E-mail ou senha inválidos." : error.message);
  } catch (err) {
    showError("Não foi possível conectar. Verifique sua internet.");
  } finally {
    loginSubmitBtn.disabled = false;
  }
});

document.getElementById("denied-logout").addEventListener("click", () => supabaseClient.auth.signOut());
document.getElementById("admin-logout-btn").addEventListener("click", () => supabaseClient.auth.signOut());

supabaseClient.auth.onAuthStateChange((_event, session) => {
  if (session && session.user) {
    checkAdminAndLoad(session.user);
  } else {
    showOnly(loginScreen);
  }
});

async function checkAdminAndLoad(user) {
  showOnly(loadingScreen);
  const { data: adminRow, error } = await supabaseClient
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !adminRow) {
    showOnly(deniedScreen);
    return;
  }

  const name = user.user_metadata?.full_name || user.email.split("@")[0];
  document.getElementById("admin-user-name").innerHTML = `Olá, <strong>${escapeHtml(name)}</strong>`;
  await loadSettings();
  await loadDashboard();
  showOnly(adminScreen);
}

// ---------- Configurações gerais (título H1 + brasão) ----------
async function loadSettings() {
  const { data } = await supabaseClient
    .from("app_settings")
    .select("hero_title, hero_image_url")
    .eq("id", 1)
    .maybeSingle();
  if (!data) return;
  if (data.hero_title) document.getElementById("settings-title").value = data.hero_title;
  if (data.hero_image_url) {
    const img = document.getElementById("crest-preview-img");
    img.src = data.hero_image_url;
    img.style.display = "block";
  }
}

document.getElementById("settings-crest-file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = document.getElementById("crest-preview-img");
    img.src = reader.result;
    img.style.display = "block";
  };
  reader.readAsDataURL(file);
});

document.getElementById("settings-save-btn").addEventListener("click", async () => {
  const errEl = document.getElementById("settings-error");
  const savedEl = document.getElementById("settings-saved");
  errEl.style.display = "none";
  savedEl.style.display = "none";

  const title = document.getElementById("settings-title").value.trim();
  const file = document.getElementById("settings-crest-file").files[0];
  const payload = { id: 1 };
  if (title) payload.hero_title = title;

  try {
    if (file) {
      const ext = file.name.split(".").pop();
      const path = `crest-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabaseClient.storage.from("brasoes").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: pub } = supabaseClient.storage.from("brasoes").getPublicUrl(path);
      payload.hero_image_url = pub.publicUrl;
    }
    const { error } = await supabaseClient.from("app_settings").update(payload).eq("id", 1);
    if (error) throw error;
    savedEl.style.display = "inline";
    setTimeout(() => { savedEl.style.display = "none"; }, 2500);
  } catch (err) {
    errEl.textContent = "Não foi possível salvar: " + err.message;
    errEl.style.display = "block";
  }
});

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

let allUsersData = [];

async function loadDashboard() {
  const [{ data: profiles, error: pErr }, { data: progress, error: prErr }] = await Promise.all([
    supabaseClient.from("profiles").select("*"),
    supabaseClient.from("progress").select("*")
  ]);

  const byUser = {};
  (progress || []).forEach(row => {
    if (!byUser[row.user_id]) byUser[row.user_id] = [];
    byUser[row.user_id].push(row);
  });

  allUsersData = (profiles || []).map(profile => {
    const rows = byUser[profile.id] || [];
    let estudados = 0, revsFeitas = 0, questoes = 0, lastActivity = null;
    rows.forEach(r => {
      if (r.estudei) estudados++;
      if (r.rev1_done) revsFeitas++;
      if (r.rev2_done) revsFeitas++;
      if (r.rev3_done) revsFeitas++;
      questoes += r.questoes_total || 0;
      if (r.updated_at && (!lastActivity || r.updated_at > lastActivity)) lastActivity = r.updated_at;
    });
    const pctProgresso = TOTAL_ITEMS ? Math.round((estudados / TOTAL_ITEMS) * 100) : 0;
    const pctRevisoes = TOTAL_ITEMS ? Math.round((revsFeitas / (TOTAL_ITEMS * 3)) * 100) : 0;
    return {
      id: profile.id,
      name: profile.full_name || profile.email?.split("@")[0] || "—",
      email: profile.email || "—",
      pctProgresso,
      pctRevisoes,
      questoes,
      lastActivity
    };
  });

  allUsersData.sort((a, b) => b.pctProgresso - a.pctProgresso);
  renderSummary();
  renderTable(allUsersData);
}

function renderSummary() {
  const total = allUsersData.length;
  document.getElementById("admin-total-users").textContent = total;
  const avgProgresso = total ? Math.round(allUsersData.reduce((s, u) => s + u.pctProgresso, 0) / total) : 0;
  const avgRevisoes = total ? Math.round(allUsersData.reduce((s, u) => s + u.pctRevisoes, 0) / total) : 0;
  const totalQuestoes = allUsersData.reduce((s, u) => s + u.questoes, 0);
  document.getElementById("admin-avg-progresso").textContent = `${avgProgresso}%`;
  document.getElementById("admin-avg-revisoes").textContent = `${avgRevisoes}%`;
  document.getElementById("admin-total-questoes").textContent = totalQuestoes;
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function renderTable(list) {
  const tbody = document.getElementById("admin-table-body");
  tbody.innerHTML = "";
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-2); padding:30px;">Nenhum candidato encontrado.</td></tr>`;
    return;
  }
  list.forEach(u => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="u-name">${escapeHtml(u.name)}</div>
        <div class="u-email">${escapeHtml(u.email)}</div>
      </td>
      <td class="cell-pct"><span class="mini-bar"><span class="mini-bar-fill" style="width:${u.pctProgresso}%"></span></span>${u.pctProgresso}%</td>
      <td class="cell-pct"><span class="mini-bar"><span class="mini-bar-fill" style="width:${u.pctRevisoes}%"></span></span>${u.pctRevisoes}%</td>
      <td class="cell-pct">${u.questoes}</td>
      <td class="cell-pct">${formatDate(u.lastActivity)}</td>
      <td><button class="reset-btn" data-user="${u.id}" data-name="${escapeHtml(u.name)}">Resetar</button></td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll(".reset-btn").forEach(btn => {
    btn.addEventListener("click", () => resetUser(btn.dataset.user, btn.dataset.name));
  });
}

async function resetUser(userId, name) {
  const ok = confirm(`Apagar todo o progresso de "${name}"? Essa ação não pode ser desfeita.`);
  if (!ok) return;
  const { error } = await supabaseClient.from("progress").delete().eq("user_id", userId);
  if (error) {
    alert("Não foi possível resetar: " + error.message);
    return;
  }
  await loadDashboard();
}

document.getElementById("admin-search-input").addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  if (!q) { renderTable(allUsersData); return; }
  const filtered = allUsersData.filter(u =>
    u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  );
  renderTable(filtered);
});
