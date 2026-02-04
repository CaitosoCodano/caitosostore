# Painel do Desenvolvedor (Backend-Only)

Este guia explica como usar o painel de administração do Desenvolvedor via API (sem interface frontend). Todo acesso é feito por requisições HTTP autenticadas. 

## Visão Geral
- Acesso restrito ao Dev por credenciais fortes (variáveis de ambiente).
- Gestão de usuários, pedidos e conteúdo de páginas (CMS).
- Sem exposição de senhas atuais dos usuários; apenas reset seguro.
- Avatares gerados automaticamente para novos usuários.

Arquivos relevantes:
- Rotas do Dev: [admin.js](file:///c:/Users/MM10BP/Desktop/SITE%20DA%20LOJA/backend/admin.js)
- Montagem das rotas: [server.js](file:///c:/Users/MM10BP/Desktop/SITE%20DA%20LOJA/server.js#L152-L155)
- Avatar automático no registro: [server.js](file:///c:/Users/MM10BP/Desktop/SITE%20DA%20LOJA/server.js#L214-L260)
- Migração da coluna avatar_url: [database.js](file:///c:/Users/MM10BP/Desktop/SITE%20DA%20LOJA/database.js#L101-L114)

## Preparação
1. Configure credenciais no ambiente de produção (Render):
   - ADMIN_USER
   - ADMIN_PASS
2. Base URL:
   - Produção: `https://caitosostore.onrender.com`
   - Local: `http://localhost:3000`

## Autenticação
Endpoint:
- POST `/api/dev/login`

Body:
```json
{ "usuario": "SEU_ADMIN_USER", "senha": "SEU_ADMIN_PASS" }
```

Resposta:
```json
{ "sucesso": true, "token": "BASE64..." }
```

Use o token nas próximas chamadas:
- Header: `x-dev-token: <token>`

Observação: O token é simples (base64), trate como segredo e rotacione credenciais periodicamente.

## Usuários
- Listar todos:
  - GET `/api/dev/usuarios`
  - Retorna id, email, nome, verificação, avatar_url, total de pedidos e soma de compras
- Detalhar um usuário:
  - GET `/api/dev/usuarios/:id`
  - Retorna dados do usuário e lista de pedidos
- Resetar senha (definir nova):
  - POST `/api/dev/usuarios/:id/password`
  - Body:
    ```json
    { "nova_senha": "UmaSenhaForte123!" }
    ```

## Pedidos
- Listar pedidos:
  - GET `/api/dev/pedidos`
  - Inclui dados do usuário (email, nome)

## CMS de Páginas
- Ler conteúdo:
  - GET `/api/dev/paginas/:slug`
  - Exemplos de slug: `inicio`, `sobre`, `contato`
- Atualizar conteúdo:
  - POST `/api/dev/paginas`
  - Body:
    ```json
    { "slug": "sobre", "conteudo": "<h1>Sobre Nós</h1><p>Texto...</p>" }
    ```
  - Header: `x-dev-token` obrigatório

Compatibilidade atual do frontend:
- O site lê conteúdo em `/api/admin/paginas/:slug`. Mantivemos leitura pública compatível.

## Avatares Automáticos
Novos usuários recebem um `avatar_url` gerado pelo DiceBear com base no email:
- Exemplo: `https://api.dicebear.com/7.x/bottts/svg?seed=<seed>&backgroundType=gradient`

## Exemplos (cURL)
Substitua `BASE_URL` e credenciais.

```bash
# Login
curl -s -X POST "$BASE_URL/api/dev/login" \
  -H "Content-Type: application/json" \
  -d '{"usuario":"SEU_ADMIN_USER","senha":"SEU_ADMIN_PASS"}'

# Guardar token em variável (PowerShell)
$resp = Invoke-RestMethod -Method Post -Uri "$BASE_URL/api/dev/login" -ContentType "application/json" -Body '{"usuario":"SEU_ADMIN_USER","senha":"SEU_ADMIN_PASS"}'
$token = $resp.token

# Listar usuários
curl -s "$BASE_URL/api/dev/usuarios" -H "x-dev-token: $token"

# Detalhar usuário 1
curl -s "$BASE_URL/api/dev/usuarios/1" -H "x-dev-token: $token"

# Resetar senha
curl -s -X POST "$BASE_URL/api/dev/usuarios/1/password" \
  -H "Content-Type: application/json" -H "x-dev-token: $token" \
  -d '{"nova_senha":"UmaSenhaForte123!"}'

# Atualizar página 'sobre'
curl -s -X POST "$BASE_URL/api/dev/paginas" \
  -H "Content-Type: application/json" -H "x-dev-token: $token" \
  -d '{"slug":"sobre","conteudo":"<h1>Sobre Nós</h1><p>Atualizado pela API.</p>"}'
```

## Segurança e Boas Práticas
- Configure `ADMIN_USER` e `ADMIN_PASS` apenas no ambiente (Render), nunca no repositório.
- Não compartilhe o token; revogue trocando as credenciais se necessário.
- O reset de senha sempre grava hash; senhas atuais não são expostas.
- Considere adicionar logs de auditoria para ações do Dev se desejar.

## Problemas Comuns
- 401 Unauthorized: verifique `x-dev-token` ou credenciais.
- 404 Not Found em páginas: garanta que `slug` existe ou envie via POST.
- Conteúdo não atualiza na home: limpe cache do navegador ou aguarde rebuild.

