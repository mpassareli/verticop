# Edital Verticalizado — PCPR 2026

App de estudos para o cargo de Agente de Polícia Judiciária (PCPR 2026), com login, checklist do edital
por tema, revisão espaçada automática e contador de questões. Backend em Supabase, hospedagem estática
no GitHub Pages — o mesmo fluxo que você já usou no projeto do Investigador.

## O que tem nos arquivos

```
pcpr-edital/
├── index.html              (tela de login + painel do candidato)
├── admin.html              (painel administrativo)
├── supabase-schema.sql     (script para criar as tabelas no Supabase)
├── assets/
│   ├── style.css           (visual dark, tons de cinza/preto)
│   ├── data.js             (o edital verticalizado inteiro, já estruturado)
│   ├── supabase-client.js  (aqui você cola suas chaves do Supabase)
│   ├── main.js             (login, checkboxes, progresso, questões)
│   └── admin.js            (lógica do painel administrativo)
```

## Passo 1 — Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e entre na sua conta (ou crie uma, é grátis).
2. Clique em **New project**. Escolha um nome (ex: `pcpr-2026`) e uma senha de banco (guarde-a, mas não vai precisar dela no site).
3. Espere o projeto terminar de provisionar (1-2 minutos).

## Passo 2 — Criar a tabela de progresso

1. No menu lateral do Supabase, clique em **SQL Editor**.
2. Clique em **New query**.
3. Abra o arquivo `supabase-schema.sql` deste projeto, copie todo o conteúdo e cole no editor.
4. Clique em **Run**. Deve aparecer "Success. No rows returned".

## Passo 3 — Pegar suas chaves de API

1. No menu lateral, vá em **Project Settings** (ícone de engrenagem) → **API**.
2. Copie o valor de **Project URL**.
3. Copie o valor de **anon public** (na seção "Project API keys").
4. Abra o arquivo `assets/supabase-client.js` e substitua:
   - `COLE_AQUI_A_SUA_PROJECT_URL` pela Project URL
   - `COLE_AQUI_A_SUA_ANON_KEY` pela chave anon public

## Passo 4 — Ativar login por e-mail e por Google

**E-mail/senha** já vem ativado por padrão no Supabase — não precisa fazer nada.

Por padrão, o Supabase exige confirmação por e-mail antes do primeiro login. Se quiser testar mais rápido
sem confirmar e-mail: vá em **Authentication → Providers → Email** e desative "Confirm email" (você pode
reativar depois).

**Login com Google** (opcional):
1. Vá em **Authentication → Providers** e ative **Google**.
2. Você vai precisar criar um "OAuth Client ID" no [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   — o próprio Supabase mostra o passo a passo com o link exato e a "Redirect URL" que você precisa colar lá.
3. Cole o Client ID e o Client Secret do Google na tela do Supabase e salve.

Se você não quiser mexer com Google agora, pode ignorar esse passo — o login por e-mail/senha funciona sozinho.

## Passo 5 — Publicar no GitHub Pages

Isso é o que efetivamente coloca o site no ar, com um link público. Faça assim:

1. Acesse [github.com](https://github.com) e entre na sua conta (ou crie uma, é grátis).
2. No canto superior direito, clique no **+** → **New repository**.
3. Dê um nome (ex: `pcpr-edital`), deixe como **Public**, e clique em **Create repository**.
4. Na página do repositório recém-criado, clique em **uploading an existing file** (ou "Add file → Upload files").
5. Arraste **todos os arquivos e pastas** deste projeto para a área de upload — inclusive a pasta `assets`
   inteira. O GitHub mantém a estrutura de pastas automaticamente.
6. Role para baixo e clique em **Commit changes**.
7. Vá em **Settings** (aba do repositório) → **Pages** (menu lateral esquerdo).
8. Em "Build and deployment" → "Source", selecione **Deploy from a branch**.
9. Em "Branch", selecione `main` e a pasta `/ (root)`. Clique em **Save**.
10. Espere 1-2 minutos. Atualize a página e vai aparecer um link no topo, tipo:
    `https://seu-usuario.github.io/pcpr-edital/`.

Esse é o link que você vai usar (e compartilhar, se quiser) para acessar o app dali pra frente. Toda vez
que você editar algum arquivo e fizer upload de novo pelo GitHub, o site atualiza sozinho em 1-2 minutos.

## Passo 6 — Testar

1. Abra o link do GitHub Pages.
2. Clique em "Criar conta", coloque seu e-mail e uma senha.
3. Se a confirmação de e-mail estiver ativada, confirme pelo e-mail recebido e depois faça login.
4. Marque alguns itens como "Estudei" — as datas de 1ª, 2ª e 3ª revisão devem aparecer automaticamente
   (1, 7 e 30 dias depois). Adicione questões em algum item e veja o total subir no tema e no topo da página.

## Passo 7 — Virar administrador (acessar o painel admin)

O painel administrativo (`admin.html`) mostra o progresso de todos os candidatos cadastrados. Por padrão,
ninguém tem acesso — você precisa se autorizar manualmente pelo Supabase:

1. Primeiro, crie sua conta e faça login pelo menos uma vez no `index.html` (Passo 6), para seu usuário existir.
2. No Supabase, vá em **SQL Editor → New query** e rode (trocando pelo seu e-mail de cadastro):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'seu-email@exemplo.com'
   on conflict do nothing;
   ```
3. Pronto. Agora, ao abrir `admin.html` (ou clicar no botão "Admin" no topo do painel principal) e logar
   com essa conta, você vê a lista de candidatos.

Quem não estiver na tabela `admins` vê uma tela de "acesso restrito" ao tentar abrir `admin.html` — os dados
dos outros candidatos ficam protegidos por regras de segurança no próprio banco (RLS), não só escondidos na tela.

## Como funciona a revisão espaçada

Quando você marca **Estudei** num item pela primeira vez, o sistema grava a data de hoje e calcula
automaticamente:
- **1ª revisão**: 1 dia depois
- **2ª revisão**: 7 dias depois
- **3ª revisão**: 30 dias depois

Essas datas ficam mostradas ao lado de cada caixinha, e você só marca como concluída quando revisar de fato.
Se quiser mudar esses intervalos, é só editar a constante `REVISION_OFFSETS` no topo do arquivo `assets/main.js`.

## Personalizações rápidas

- **Data da prova**: está na última linha de `assets/data.js`, na constante `EXAM_DATE`.
- **Cores**: todas as cores estão centralizadas no topo de `assets/style.css`, nas variáveis `:root`.
- **Conteúdo do edital**: está todo em `assets/data.js`, organizado por grupo → tema → itens. Dá pra editar
  os textos ou adicionar itens novos direto ali, sem precisar mexer em mais nada.

## Painel administrativo — o que ele mostra

- **Configurações do edital**: título (H1) exibido no topo da plataforma e o brasão da instituição do
  concurso (upload de imagem). Isso é salvo no banco e aparece pra todo mundo que usar o app.
- Total de candidatos cadastrados, progresso médio, revisões médias e total geral de questões resolvidas.
- Uma tabela com cada candidato: nome/e-mail, % de progresso, % de revisões concluídas, questões resolvidas
  e a última vez que mexeu no app.
- Busca por nome ou e-mail.
- Botão **Resetar** por candidato, que apaga todo o progresso dele (pede confirmação antes).

Para tornar outra pessoa administradora depois, repita o SQL do Passo 7 trocando o e-mail.

⚠️ Se você já tinha rodado o `supabase-schema.sql` antes desta versão, rode o script de novo — ele cria a
tabela `app_settings` e o bucket de armazenamento `brasoes` (usado pelo upload do brasão) sem apagar nada
do que já existia, graças aos `if not exists`/`on conflict do nothing`.

## Dúvidas comuns

- **"Failed to fetch" ao tentar logar**: confira se colou certinho a URL e a chave no `supabase-client.js`
  (sem espaços extras, com aspas).
- **Meus dados não aparecem depois de recarregar a página**: confira se o script SQL rodou sem erro
  (Passo 2) e se as políticas de RLS foram criadas — eram para aparecer 4 policies na tabela `progress`
  em **Authentication → Policies**.
- **Quero resetar todo o progresso**: no Supabase, vá em **Table Editor → progress** e apague as linhas
  do seu usuário (ou a tabela inteira, se for só teste).

  ---
