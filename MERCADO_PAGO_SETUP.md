# 💳 Integração Mercado Pago - Guia Completo

## 📋 Índice
1. [Como Obter Credenciais](#como-obter-credenciais)
2. [Configurar o .env](#configurar-o-env)
3. [Testar a Integração](#testar-a-integração)
4. [Rotas da API](#rotas-da-api)
5. [Fluxo de Pagamento](#fluxo-de-pagamento)
6. [Problemas Comuns](#problemas-comuns)

---

## 🔑 Como Obter Credenciais

### 1. Criar Conta Mercado Pago

**Acesso Sandbox (Testes - Recomendado):**
- Acessar: https://www.mercadopago.com.br/developers/pt-BR/tools/sandbox
- Fazer login com conta Google ou E-mail
- Uma conta de sandbox será criada automaticamente

**Acesso Produção (Real):**
- Acessar: https://www.mercadopago.com.br
- Criar conta normalmente
- Ativar modo de produção depois de validar testes

### 2. Obter Access Token

**Passo a passo:**
```
1. Acessar Mercado Pago Developers
   → https://www.mercadopago.com.br/developers/pt-BR/reference

2. Fazer Login com sua conta

3. Ir para "Credenciais"
   → Seu painel > Configurações > Credenciais

4. Selecionar ambiente:
   ☑️  SANDBOX (para testes) - Recomendado inicialmente
   ☑️  PRODUÇÃO (para transações reais)

5. Copiar "Access Token"
   → Começa com "TEST-" (sandbox) ou seu user ID (produção)

6. Colar no arquivo .env:
   MERCADO_PAGO_ACCESS_TOKEN=TEST-seu_token_aqui
```

### 3. Obter/Criar Chave PIX

**Opções:**
- ✅ Usar email (mais fácil): seu_email@gmail.com
- ✅ Usar CPF: 12345678901
- ✅ Usar CNPJ: 12345678901234
- ✅ Chave Aleatória: 123e4567-e89b-12d3-a456-426614174000

**No .env:**
```
PIX_KEY=seu_email@gmail.com
```

---

## ⚙️ Configurar o .env

### 1. Criar arquivo .env

```bash
# Copiar o template
cp .env.example .env
```

### 2. Preencher credenciais

```env
# =========================================
# MERCADO PAGO
# =========================================

# Token do Mercado Pago (Sandbox para testes)
MERCADO_PAGO_ACCESS_TOKEN=TEST-123456789abcdefghijk

# Sua chave PIX para receber transferências
PIX_KEY=seu_email@gmail.com

# =========================================
# OUTRAS CONFIGURAÇÕES
# =========================================

PORT=3000
NODE_ENV=development
DB_PATH=./database.db
JWT_SECRET=sua_chave_secreta_aleatoria
FRONTEND_URL=http://localhost:3000
```

### 3. Salvar e reiniciar servidor

```bash
npm start
```

---

## 🧪 Testar a Integração

### Opção 1: Rota de Teste (Recomendado)

**Esta rota NÃO depende do token do Mercado Pago**

#### 1. Criar pagamento de teste

```bash
# Terminal PowerShell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/pagamento/pix" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"valor": 49.90, "descricao": "Teste PIX", "usuarioId": 1}'

$response.Content | ConvertFrom-Json | Format-Table
```

**Resposta esperada:**
```json
{
  "sucesso": true,
  "mensagem": "✅ QR Code PIX gerado com sucesso",
  "pixPaymentId": "PRE-987654321", // ID da preferência
  "qrCode": "data:image/png;base64,...", // QR Code em base64
  "valor": 49.90,
  "instrucoes": {
    "passo1": "Escaneie o QR Code...",
    "passo2": "Confirme a transferência",
    "passo3": "..."
  }
}
```

⚠️ Se receber erro 403 (Unauthorized), o token Mercado Pago é inválido.

#### 2. Simular pagamento confirmado

```bash
# Usar o pixPaymentId da resposta anterior
$pixPaymentId = "PRE-987654321"

$simulacao = Invoke-WebRequest -Uri "http://localhost:3000/api/pagamento/pix/simular/$pixPaymentId" `
  -Method POST

$simulacao.Content | ConvertFrom-Json | Format-Table
```

**Resposta esperada:**
```json
{
  "sucesso": true,
  "mensagem": "✅ Pagamento simulado com sucesso",
  "pixPaymentId": "PRE-987654321",
  "status": "confirmado"
}
```

#### 3. Verificar status do pagamento

```bash
$status = Invoke-WebRequest -Uri "http://localhost:3000/api/pagamento/pix/$pixPaymentId"

$status.Content | ConvertFrom-Json | Format-Table
```

**Resposta esperada:**
```json
{
  "pixPaymentId": "PRE-987654321",
  "status": "confirmado",
  "statusFormatado": "✅ Pagamento confirmado",
  "valor": 49.90,
  "pago": true,
  "sucesso": true,
  "mensagem": "✅ Seu pagamento foi confirmado!"
}
```

### Opção 2: Usar Frontend Web

1. Abrir: http://localhost:3000
2. Ir para aba "Checkout"
3. Adicionar itens ao carrinho
4. Clicar em "Finalizar Compra"
5. Escanear QR Code com app bancário (teste)
6. Clicar em "Verificar Pagamento"

---

## 🔌 Rotas da API

### POST `/api/pagamento/pix`

**Criar uma intenção de pagamento PIX**

#### Request:
```json
{
  "valor": 149.90,
  "descricao": "Compra de 2 jogos",
  "usuarioId": 1
}
```

#### Response:
```json
{
  "sucesso": true,
  "pixPaymentId": "PRE-xxxxx",
  "linkCheckout": "https://www.mercadopago.com.br/...",
  "qrCode": "data:image/png;base64,...",
  "valor": 149.90,
  "instrucoes": {...}
}
```

#### Erros:
- **400**: Valor inválido
- **400**: Token Mercado Pago não configurado
- **403**: Token Mercado Pago inválido/expirado
- **500**: Erro ao chamar API

---

### GET `/api/pagamento/pix/:pixPaymentId`

**Verificar status de um pagamento**

#### Request:
```
GET http://localhost:3000/api/pagamento/pix/PRE-xxxxx
```

#### Response:
```json
{
  "pixPaymentId": "PRE-xxxxx",
  "status": "confirmado",
  "statusFormatado": "✅ Pagamento confirmado",
  "valor": 149.90,
  "pago": true,
  "sucesso": true,
  "mensagem": "✅ Seu pagamento foi confirmado!"
}
```

---

### POST `/api/pagamento/pix/simular/:pixPaymentId` ⚠️ TESTE APENAS

**Simular pagamento confirmado (para testes)**

#### Request:
```
POST http://localhost:3000/api/pagamento/pix/simular/PRE-xxxxx
```

#### Response:
```json
{
  "sucesso": true,
  "mensagem": "✅ Pagamento simulado com sucesso",
  "pixPaymentId": "PRE-xxxxx",
  "status": "confirmado"
}
```

⚠️ **IMPORTANTE:** Esta rota deve ser removida em produção!

---

## 🔄 Fluxo de Pagamento

```
┌─────────────────────────────────────────────────────────┐
│  CLIENTE CLICA EM "CHECKOUT"                             │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  POST /api/pagamento/pix                                │
│  - Envia: valor, descrição                              │
│  - Backend cria preferência no Mercado Pago             │
│  - Gera QR Code com chave PIX                           │
│  - Salva informações no banco de dados                  │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  RESPOSTA: pixPaymentId + QR Code                       │
│  Frontend exibe QR Code para usuário                    │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  CLIENTE ESCANEIA QR CODE                               │
│  - Abre app bancário                                    │
│  - Realiza transferência PIX                            │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  CLIENTE CLICA "VERIFICAR PAGAMENTO"                    │
│  GET /api/pagamento/pix/:pixPaymentId                   │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  BACKEND RETORNA STATUS:                                │
│  - status: "confirmado" ou "pendente"                   │
│  - pago: true/false                                     │
│  - mensagem: instruções ou confirmação                  │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  FRONTEND MOSTRA RESULTADO                              │
│  - Se pago: mostra "✅ Pagamento confirmado"            │
│  - Se pendente: mostra "⏳ Aguardando pagamento"        │
└─────────────────────────────────────────────────────────┘
```

---

## 🐛 Problemas Comuns

### ❌ Erro 403 - Unauthorized

**Problema:** Token Mercado Pago inválido

**Solução:**
1. Verificar se token está correto no .env
2. Copiar novo token do Mercado Pago Developers
3. Reiniciar servidor: `npm start`
4. Testar novamente

### ❌ Erro 400 - Bad Request

**Problema:** Dados enviados inválidos

**Solução:**
- Verificar `valor` (deve ser número positivo)
- Verificar `descricao` (string)
- Verificar `usuarioId` (número ou null)

### ❌ Rota 404 - Not Found

**Problema:** Rota não existe

**Solução:**
- Verificar se servidor está rodando: `npm start`
- Verificar URL: `/api/pagamento/pix` (com `/api`)
- Verificar método HTTP: POST ou GET

### ❌ QR Code não aparece

**Problema:** Geração falhou

**Solução:**
- Verificar PIX_KEY no .env
- Verificar permissão de escrita no diretório
- Reiniciar servidor

### ❌ "Mercado Pago não configurado"

**Problema:** Token não encontrado no .env

**Solução:**
1. Criar arquivo .env: `cp .env.example .env`
2. Adicionar: `MERCADO_PAGO_ACCESS_TOKEN=TEST-...`
3. Salvar e reiniciar: `npm start`

---

## 📱 Testar PIX de Verdade

### Com Conta Real Mercado Pago:

1. **Sandbox (Testes):**
   - ✅ Não cobra dinheiro real
   - ✅ Teste o fluxo completo
   - ✅ Recomendado fazer isto primeiro

2. **Produção (Real):**
   - ⚠️ Cobra dinheiro real
   - ⚠️ Fazer após validar tudo em sandbox
   - Trocar: `MERCADO_PAGO_ACCESS_TOKEN=seu_token_producao`

### Com App Bancário (Teste):

1. Criar pagamento: POST `/api/pagamento/pix`
2. Copiar QR Code ou usar link de checkout
3. Abrir app do banco (teste)
4. Transferir valor de teste
5. Verificar status: GET `/api/pagamento/pix/:id`

---

## 🔐 Segurança

### ✅ O que o backend faz:

- **NUNCA** expõe chave PIX para o frontend
- Gera QR Code com chave PIX apenas no servidor
- Envia apenas QR Code (imagem) para cliente
- Valida token Mercado Pago em cada requisição
- Salva apenas ID da preferência no banco

### ⚠️ Não faça:

- ❌ Colocar chave PIX no frontend
- ❌ Colocar token Mercado Pago no frontend
- ❌ Compartilhar .env com outras pessoas
- ❌ Usar mesmo token para teste e produção
- ❌ Fazer commit do .env no git

---

## 📞 Suporte Oficial

- **Mercado Pago Dev Center:** https://www.mercadopago.com.br/developers
- **Documentação API:** https://www.mercadopago.com.br/developers/pt-BR/reference
- **Status Page:** https://status.mercadopago.com/

---

## ✅ Checklist de Setup

- [ ] Criar conta Mercado Pago
- [ ] Obter Access Token (SANDBOX)
- [ ] Copiar token no .env
- [ ] Definir PIX_KEY
- [ ] Reiniciar servidor
- [ ] Testar POST /api/pagamento/pix
- [ ] Testar POST /api/pagamento/pix/simular
- [ ] Testar GET /api/pagamento/pix/:id
- [ ] Testar no frontend web
- [ ] Documentar token em local seguro

---

## 🎉 Próximos Passos

1. **Webhooks:** Implementar webhooks para confirmar pagamentos automaticamente
2. **Email:** Enviar confirmação de pagamento por email
3. **Admin:** Dashboard para gerenciar pagamentos
4. **Relatórios:** Gerar relatórios de vendas
5. **Produção:** Trocar para token de produção real

