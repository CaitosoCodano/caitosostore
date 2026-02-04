# 📚 Documentação da API GameStore

## 🎯 Visão Geral

API RESTful para a GameStore - Loja de Jogos Online.

**Base URL:** `http://localhost:3000`

---

## 🔐 Autenticação

Todas as rotas protegidas exigem um JWT (JSON Web Token) no header:

```
Authorization: Bearer SEU_TOKEN_AQUI
```

**Como obter um token:**

1. Registrar novo usuário em `POST /api/auth/registro`
2. Fazer login em `POST /api/auth/login`
3. Token retorna na resposta
4. Guardar no `localStorage` (frontend)

---

## 📍 Rotas Disponíveis

### 1. AUTENTICAÇÃO

#### Registrar novo usuário

```
POST /api/auth/registro
Content-Type: application/json

Body:
{
  "email": "joao@gmail.com",
  "nome": "João Silva",
  "senha": "SenhaForte123!"
}

Response:
{
  "mensagem": "✅ Registro realizado com sucesso!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "email": "joao@gmail.com",
    "nome": "João Silva"
  }
}
```

**Validações:**
- Email deve ser de domínio permitido (gmail.com, hotmail.com, etc)
- Senha mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo
- Nome mínimo 3 caracteres

---

#### Fazer Login

```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "joao@gmail.com",
  "senha": "SenhaForte123!"
}

Response:
{
  "mensagem": "✅ Login realizado com sucesso!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "email": "joao@gmail.com",
    "nome": "João Silva"
  }
}
```

---

### 2. PRODUTOS

#### Listar todos os jogos

```
GET /api/jogos

Parâmetros (opcional):
  ?genero=RPG
  ?preco_max=200
  ?genero=RPG&preco_max=200

Response:
{
  "total": 10,
  "jogos": [
    {
      "id": 1,
      "nome": "Cyberpunk 2077",
      "descricao": "RPG futurista em Night City...",
      "preco": 149.90,
      "imagem_url": "https://...",
      "genero": "RPG",
      "plataforma": "PC, PlayStation 5, Xbox Series X",
      "classificacao": "18",
      "estoque": 999,
      "criado_em": "2024-02-04..."
    },
    ...
  ]
}
```

---

#### Obter detalhes de um jogo

```
GET /api/jogos/:id

Exemplo:
GET /api/jogos/1

Response:
{
  "id": 1,
  "nome": "Cyberpunk 2077",
  "descricao": "RPG futurista em Night City...",
  "preco": 149.90,
  "imagem_url": "https://...",
  "genero": "RPG",
  "plataforma": "PC, PlayStation 5, Xbox Series X",
  "classificacao": "18",
  "estoque": 999,
  "criado_em": "2024-02-04..."
}
```

---

### 3. CARRINHO (Futuro)

#### Adicionar ao carrinho

```
POST /api/carrinho
Authorization: Bearer TOKEN
Content-Type: application/json

Body:
{
  "jogo_id": 1,
  "quantidade": 1
}

Response:
{
  "id": 1,
  "usuario_id": 1,
  "jogo_id": 1,
  "quantidade": 1,
  "adicionado_em": "2024-02-04..."
}
```

---

#### Listar carrinho

```
GET /api/carrinho
Authorization: Bearer TOKEN

Response:
[
  {
    "id": 1,
    "usuario_id": 1,
    "jogo_id": 1,
    "quantidade": 1,
    "adicionado_em": "2024-02-04..."
  },
  ...
]
```

---

#### Atualizar quantidade

```
PUT /api/carrinho/:id
Authorization: Bearer TOKEN
Content-Type: application/json

Body:
{
  "quantidade": 2
}

Response:
{
  "id": 1,
  "usuario_id": 1,
  "jogo_id": 1,
  "quantidade": 2,
  "adicionado_em": "2024-02-04..."
}
```

---

#### Remover do carrinho

```
DELETE /api/carrinho/:id
Authorization: Bearer TOKEN

Response:
{
  "mensagem": "Item removido do carrinho"
}
```

---

### 4. FAVORITOS (Futuro)

#### Adicionar aos favoritos

```
POST /api/favoritos
Authorization: Bearer TOKEN
Content-Type: application/json

Body:
{
  "jogo_id": 1
}

Response:
{
  "id": 1,
  "usuario_id": 1,
  "jogo_id": 1,
  "adicionado_em": "2024-02-04..."
}
```

---

#### Listar favoritos

```
GET /api/favoritos
Authorization: Bearer TOKEN

Response:
[
  {
    "id": 1,
    "usuario_id": 1,
    "jogo_id": 1,
    "adicionado_em": "2024-02-04..."
  },
  ...
]
```

---

#### Remover dos favoritos

```
DELETE /api/favoritos/:id
Authorization: Bearer TOKEN

Response:
{
  "mensagem": "Removido dos favoritos"
}
```

---

### 5. PEDIDOS (Futuro)

#### Criar pedido

```
POST /api/pedidos
Authorization: Bearer TOKEN
Content-Type: application/json

Body:
{
  "itens": [
    {
      "jogo_id": 1,
      "quantidade": 1
    }
  ],
  "endereco_envio": "Rua X, 123, São Paulo, SP"
}

Response:
{
  "id": 1,
  "usuario_id": 1,
  "valor_total": 149.90,
  "status": "pendente",
  "stripe_payment_id": null,
  "criado_em": "2024-02-04..."
}
```

---

#### Listar pedidos

```
GET /api/pedidos
Authorization: Bearer TOKEN

Response:
[
  {
    "id": 1,
    "usuario_id": 1,
    "valor_total": 149.90,
    "status": "pago",
    "stripe_payment_id": "pi_1234567890",
    "criado_em": "2024-02-04...",
    "atualizado_em": "2024-02-04..."
  },
  ...
]
```

---

#### Obter pedido específico

```
GET /api/pedidos/:id
Authorization: Bearer TOKEN

Response:
{
  "id": 1,
  "usuario_id": 1,
  "valor_total": 149.90,
  "status": "pago",
  "stripe_payment_id": "pi_1234567890",
  "itens": [
    {
      "jogo_id": 1,
      "quantidade": 1,
      "preco_unitario": 149.90
    }
  ],
  "criado_em": "2024-02-04...",
  "atualizado_em": "2024-02-04..."
}
```

---

## 🛡️ Códigos de Erro

| Código | Mensagem | Significado |
|--------|----------|-------------|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 400 | Bad Request | Dados inválidos |
| 401 | Unauthorized | Sem autenticação |
| 403 | Forbidden | Acesso negado |
| 404 | Not Found | Recurso não encontrado |
| 429 | Too Many Requests | Muitas requisições (rate limit) |
| 500 | Server Error | Erro no servidor |

---

## 📝 Exemplos de Uso (JavaScript/Fetch)

### Registrar novo usuário

```javascript
const resposta = await fetch('http://localhost:3000/api/auth/registro', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'joao@gmail.com',
    nome: 'João Silva',
    senha: 'SenhaForte123!'
  })
});

const dados = await resposta.json();

if (resposta.ok) {
  // Guardar token
  localStorage.setItem('token', dados.token);
  console.log('✅ Usuário registrado!');
} else {
  console.error('❌ Erro:', dados.erro);
}
```

---

### Fazer login

```javascript
const resposta = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'joao@gmail.com',
    senha: 'SenhaForte123!'
  })
});

const dados = await resposta.json();

if (resposta.ok) {
  localStorage.setItem('token', dados.token);
  console.log('✅ Login realizado!');
}
```

---

### Listar jogos

```javascript
const resposta = await fetch('http://localhost:3000/api/jogos');
const dados = await resposta.json();

console.log(`📦 ${dados.total} jogos disponíveis`);
dados.jogos.forEach(jogo => {
  console.log(`- ${jogo.nome}: R$ ${jogo.preco}`);
});
```

---

### Listar jogos com filtro

```javascript
const resposta = await fetch('http://localhost:3000/api/jogos?genero=RPG&preco_max=200');
const dados = await resposta.json();

console.log(`🎮 ${dados.total} RPGs até R$ 200`);
```

---

### Adicionar ao carrinho (protegido)

```javascript
const token = localStorage.getItem('token');

const resposta = await fetch('http://localhost:3000/api/carrinho', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // Token obrigatório
  },
  body: JSON.stringify({
    jogo_id: 1,
    quantidade: 1
  })
});

const dados = await resposta.json();

if (resposta.ok) {
  console.log('✅ Adicionado ao carrinho');
} else if (resposta.status === 401) {
  console.log('❌ Você precisa estar logado');
  window.location.href = '/frontend/login.html';
}
```

---

## 🚀 Testes com cURL

### Registrar

```bash
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@gmail.com",
    "nome": "João Silva",
    "senha": "SenhaForte123!"
  }'
```

### Listar jogos

```bash
curl http://localhost:3000/api/jogos
```

### Listar jogos com filtro

```bash
curl "http://localhost:3000/api/jogos?genero=RPG&preco_max=200"
```

---

## 📊 Limites

- Rate limit: 100 requisições por 15 minutos
- Máximo de caracteres em mensagem: 1000
- Máximo de quantidade por item: 99
- Máximo de senha: 100 caracteres

---

**Versão da API:** 2.0.0  
**Última atualização:** 04/02/2026  
**Status:** 🟠 Em desenvolvimento
