# 📚 Índice de Arquivos - GameStore v2.0

## 🎯 Comece Aqui

1. **[README.md](README.md)** ← ⭐ COMECE AQUI!
   - Visão geral do projeto
   - Tecnologias utilizadas
   - Ideias futuras
   - Como usar

2. **[docs/GUIA_INSTALACAO.md](docs/GUIA_INSTALACAO.md)** ← Próximo passo
   - Pré-requisitos
   - Instalação passo a passo
   - Como rodar localmente
   - Solução de problemas

---

## 📁 Estrutura de Arquivos

### 🖥️ SERVIDOR (Backend)

```
server.js
├── PORTA: 3000
├── FRAMEWORK: Express.js
├── FUNÇÃO: API REST
├── ROTAS:
│   ├── GET / (raiz)
│   ├── POST /api/auth/registro
│   ├── POST /api/auth/login
│   ├── GET /api/jogos
│   ├── GET /api/jogos/:id
│   └── GET /api/status
└── COMENTÁRIOS: ✅ Português
```

**Como ler:** Este é o arquivo principal. Começa com imports, depois configuração do Express, depois as rotas.

---

### 🗄️ BANCO DE DADOS

```
database.js
├── TIPO: SQLite
├── ARQUIVO: database.db
├── TABELAS: 6
│   ├── usuarios (login)
│   ├── jogos (catálogo)
│   ├── carrinho (items)
│   ├── favoritos (wishlist)
│   ├── pedidos (histórico)
│   └── itens_pedido (detalhes)
└── COMENTÁRIOS: ✅ Português
```

**Como ler:** Veja a função `criarTabelas()` para entender o schema. Veja `popularComDados()` para entender como dados iniciais são inseridos.

---

### 🔐 VALIDAÇÕES

```
backend/validacoes.js
├── validarEmail()
├── validarSenha()
├── validarNome()
├── validarCartao()
├── validarQuantidade()
└── validarMensagem()
```

**Como ler:** Cada função valida um tipo de dado. Use estas como referência para sua própria validação.

---

### 🌐 PÁGINA PRINCIPAL

```
frontend/index.html
├── SEÇÕES:
│   ├── Header (menu)
│   ├── Hero (boas-vindas)
│   ├── Filtros
│   ├── Grid de Jogos
│   ├── Sobre
│   ├── Contato
│   └── Footer
├── RESPONSIVO: ✅ Sim
└── COMENTÁRIOS: ✅ Português
```

**Como usar:** Abra em `http://localhost:3000/frontend/index.html` (ou apenas `http://localhost:3000`)

---

### 🔐 PÁGINA DE LOGIN

```
frontend/login.html
├── FUNCIONALIDADES:
│   ├── Aba 1: Login
│   ├── Aba 2: Registro
│   ├── Validação em tempo real
│   ├── Indicador de força de senha
│   └── Armazenamento de token
└── COMENTÁRIOS: ✅ Português
```

**Como usar:** Clique em "Registrar" ou "Login" na página inicial

---

### 🛒 PÁGINA DO CARRINHO

```
frontend/carrinho.html
├── FUNCIONALIDADES:
│   ├── Listar itens
│   ├── Aumentar/diminuir quantidade
│   ├── Remover itens
│   ├── Cálculo de total
│   ├── Botão ir para checkout
│   └── Persistência (localStorage)
└── COMENTÁRIOS: ✅ Português
```

**Como usar:** Adicione itens na página inicial, depois acesse o carrinho

---

### 💳 PÁGINA DE CHECKOUT

```
frontend/checkout.html
├── FUNCIONALIDADES:
│   ├── Formulário de envio
│   ├── Formulário de cartão
│   ├── Validações
│   ├── Cálculo de frete
│   ├── Simulação de pagamento
│   └── Confirmação de pedido
└── COMENTÁRIOS: ✅ Português
```

**Dados de teste:**
- Cartão: 4242 4242 4242 4242
- Validade: 12/25
- CVV: 123

---

### ❤️ PÁGINA DE FAVORITOS

```
frontend/favoritos.html
├── FUNCIONALIDADES:
│   ├── Listar favoritos
│   ├── Remover dos favoritos
│   ├── Adicionar ao carrinho direto
│   └── Persistência (localStorage)
└── COMENTÁRIOS: ✅ Português
```

**Como usar:** Clique no ❤️ em qualquer jogo para adicionar aos favoritos

---

### 🎨 ESTILOS

```
frontend/style.css
├── SEÇÕES:
│   ├── Reset e básicos
│   ├── Container
│   ├── Header
│   ├── Menu
│   ├── Hero
│   ├── Filtros
│   ├── Grid de jogos
│   ├── Cards
│   ├── Sobre
│   ├── Contato
│   ├── Footer
│   ├── Responsividade
│   └── Mensagens
├── RESPONSIVO: ✅ Sim (mobile/tablet/desktop)
└── COMENTÁRIOS: ✅ Português
```

**Como ler:** Use buscar (Ctrl+F) para encontrar seções específicas

---

### 📜 SCRIPT PRINCIPAL

```
frontend/script.js
├── FUNÇÕES:
│   ├── comprarJogo()
│   ├── enviarContato()
│   ├── rolarParaSecao()
│   └── ... (de v1.0, agora em index.html)
└── NOTA: Moved to index.html for better organization
```

---

### 🧪 PÁGINA DE TESTES

```
frontend/teste.html
├── PERMITE TESTAR:
│   ├── POST /api/auth/registro
│   ├── POST /api/auth/login
│   ├── GET /api/jogos
│   ├── GET /api/jogos/:id
│   ├── GET /api/jogos?genero=RPG
│   └── GET /api/status
└── COMENTÁRIOS: ✅ Português
```

**Como usar:** Abra em `http://localhost:3000/frontend/teste.html`

---

## 📚 DOCUMENTAÇÃO

### [README.md](README.md)
- O que é o projeto
- Tecnologias
- Ideias futuras
- Fluxos de autenticação e compra

### [docs/API.md](docs/API.md)
- Documentação de rotas
- Exemplos de requisições
- Códigos de erro
- Testes com cURL

### [docs/BANCO_DE_DADOS.md](docs/BANCO_DE_DADOS.md)
- Diagrama das tabelas
- Descrição de cada tabela
- Relacionamentos
- Queries úteis

### [docs/GUIA_INSTALACAO.md](docs/GUIA_INSTALACAO.md)
- Pré-requisitos
- Instalação passo a passo
- Configuração
- Solução de problemas

### [docs/ALTERACOES.md](docs/ALTERACOES.md)
- Comparação v1.0 vs v2.0
- Principais mudanças
- Stack tecnológico
- Próximas melhorias

---

## ⚙️ ARQUIVOS DE CONFIGURAÇÃO

```
package.json
├── DEPENDÊNCIAS: 11 principais
├── SCRIPTS: start, dev
└── INFORMAÇÕES: nome, versão, autor

.env.example
├── TEMPLATE de .env
├── VARIÁVEIS: PORT, JWT_SECRET, EMAIL, STRIPE
└── INSTRUÇÕES: Em que preencher

database.db
├── ARQUIVO: SQLite (criado automaticamente)
├── TABELAS: 6 (usuarios, jogos, carrinho, favoritos, pedidos, itens_pedido)
└── DADOS: 10 jogos reais + usuários de teste
```

---

## 🚀 COMEÇAR DO ZERO

### 1️⃣ Instalar
```bash
npm install
```

### 2️⃣ Configurar
```bash
cp .env.example .env
# Editar .env com suas configurações
```

### 3️⃣ Rodar
```bash
npm start
```

### 4️⃣ Acessar
```
http://localhost:3000
```

---

## 📱 PÁGINAS DISPONÍVEIS

| URL | Descrição | Status |
|-----|-----------|--------|
| `/` | Página principal | ✅ Pronta |
| `/frontend/index.html` | Página principal (explícito) | ✅ Pronta |
| `/frontend/login.html` | Login e registro | ✅ Pronta |
| `/frontend/carrinho.html` | Carrinho de compras | ✅ Pronta |
| `/frontend/checkout.html` | Pagamento | ✅ Pronta |
| `/frontend/favoritos.html` | Wishlist | ✅ Pronta |
| `/frontend/teste.html` | Teste de API | ✅ Pronta |

---

## 🔌 ROTAS DA API

| Método | Rota | Autenticação | Status |
|--------|------|--------------|--------|
| POST | /api/auth/registro | ❌ | ✅ Pronta |
| POST | /api/auth/login | ❌ | ✅ Pronta |
| GET | /api/jogos | ❌ | ✅ Pronta |
| GET | /api/jogos/:id | ❌ | ✅ Pronta |
| POST | /api/carrinho | ✅ | 🔄 Próxima |
| GET | /api/carrinho | ✅ | 🔄 Próxima |
| PUT | /api/carrinho/:id | ✅ | 🔄 Próxima |
| DELETE | /api/carrinho/:id | ✅ | 🔄 Próxima |
| GET | /api/status | ❌ | ✅ Pronta |

---

## 💡 DICAS

### Para Aprender
1. Leia o README.md
2. Leia os comentários no código (português)
3. Abra a página de testes (/frontend/teste.html)
4. Observe as requisições no console (F12)

### Para Estender
1. Adicione rotas em `server.js`
2. Adicione validações em `backend/validacoes.js`
3. Adicione testes em `frontend/teste.html`
4. Adicione estilos em `frontend/style.css`

### Para Publicar
1. Use Heroku, AWS, DigitalOcean ou similar
2. Configure variáveis de ambiente
3. Use HTTPS (certificado SSL)
4. Adicione mais validações
5. Configure CORS corretamente

---

## 🎓 COMO ESTUDAR ESTE PROJETO

**Se você é iniciante:**
1. Leia o README
2. Rode o projeto
3. Use a página de testes
4. Leia o código (todo comentado)

**Se você é intermediário:**
1. Estude as rotas em server.js
2. Entenda o fluxo de autenticação
3. Examine as validações
4. Faça pequenas alterações

**Se você é avançado:**
1. Implemente novas rotas
2. Integre com Stripe de verdade
3. Adicione novos recursos
4. Otimize o código

---

## ❓ PERGUNTAS FREQUENTES

**P: Por onde começo?**
R: Leia o README.md, depois siga o GUIA_INSTALACAO.md

**P: Como vejo os dados no banco?**
R: Use `sqlite3 database.db` no terminal, ou uma GUI como DB Browser for SQLite

**P: Como testo as rotas?**
R: Abra `/frontend/teste.html` no navegador

**P: Como mudo as imagens dos jogos?**
R: Edite `database.js` na função `popularComDados()`

**P: Como adiciono um novo jogo?**
R: Use SQL diretamente: `INSERT INTO jogos (...) VALUES (...)`

---

## 📞 SUPORTE

- **Documentação:** Veja os arquivos em `/docs`
- **Testes:** Use `/frontend/teste.html`
- **Console:** Pressione F12 no navegador
- **Terminal:** Veja os logs do `npm start`

---

**Pronto para começar? Execute `npm start` e acesse `http://localhost:3000`! 🎮**

---

Última atualização: 04/02/2026  
Status: 🟠 Em desenvolvimento ativo  
Versão: 2.0.0
