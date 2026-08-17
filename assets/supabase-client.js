// ⚠️ CONFIGURAÇÃO DO SUPABASE
// Troque os dois valores abaixo pelos dados do SEU projeto Supabase.
// Onde encontrar: painel do Supabase > Project Settings > API
//   - Project URL           -> SUPABASE_URL
//   - anon public API key   -> SUPABASE_ANON_KEY
// Essas chaves são públicas por natureza (protegidas pelas regras de RLS), então
// não tem problema elas ficarem visíveis no código do site.

const SUPABASE_URL = "COLE_AQUI_A_SUA_PROJECT_URL";
const SUPABASE_ANON_KEY = "COLE_AQUI_A_SUA_ANON_KEY";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
