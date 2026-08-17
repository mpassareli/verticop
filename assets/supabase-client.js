// ⚠️ CONFIGURAÇÃO DO SUPABASE
// Troque os dois valores abaixo pelos dados do SEU projeto Supabase.
// Onde encontrar: painel do Supabase > Project Settings > API
//   - Project URL           -> SUPABASE_URL
//   - anon public API key   -> SUPABASE_ANON_KEY
// Essas chaves são públicas por natureza (protegidas pelas regras de RLS), então
// não tem problema elas ficarem visíveis no código do site.

const SUPABASE_URL = "https://bxwzzlhwvegoxbxqzdzn.supabase.co/";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4d3p6bGh3dmVnb3hieHF6ZHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NTYxNDgsImV4cCI6MjEwMjMzMjE0OH0.6NXmtfgd3UjM2cS2IajGyGonFvJVCEx9BcoV71jNw-k";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
