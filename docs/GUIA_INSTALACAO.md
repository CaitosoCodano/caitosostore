# 🚀 Guia de Instalação e Execução

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 14+) - [Baixar aqui](https://nodejs.org/)
- **npm** (vem junto com Node.js)
- Um editor de código (VS Code recomendado)
- Um navegador moderno (Chrome, Firefox, Edge)

---

## 📥 Passo 1: Clonar ou Baixar o Projeto

```bash
# Se estiver usando Git
git clone https://github.com/seu-usuario/gamestore.git
cd gamestore

# Ou simplesmente navegue até a pasta do projeto
cd "c:\Users\MM10BP\Desktop\SITE DA LOJA"
```

---

## 📦 Passo 2: Instalar Dependências

```bash
# Instalar todas as dependências Node.js
npm install

# Isto vai instalar:
# - Express (servidor web)
# - SQLite (banco de dados)
# - bcryptjs (hash de senhas)
# - jsonwebtoken (autenticação)
# - dotenv (variáveis de ambiente)
# - nodemailer (envio de emails)
# - stripe (pagamentos)
# - cors (requisições cross-origin)
# - helmet (segurança)
# - express-rate-limit (proteção contra brute force)
```

---

## 🔐 Passo 3: Configurar Variáveis de Ambiente

1. **Copiar arquivo de exemplo:**
   ```bash
   # Copiar .env.example para .env
   cp .env.example .env
   
   # Ou no Windows (PowerShell)
   Copy-Item .env.example .env
   ```

2. **Editar o arquivo `.env`:**
   
   Abra o arquivo `.env` em um editor de texto e preencha:

   ```env
   # Porta (deixe como 3000 para testes locais)
   PORT=3000
   NODE_ENV=development

   # Banco de dados
   DB_PATH=./database.db

   # JWT (mude isto! Use uma string aleatória longa)
   JWT_SECRET=sua_chave_muito_secreta_e_aleatoria_escolha_uma_boa_12345
   JWT_EXPIRE=7d

   # Email (para notificações)
   # Se usar Gmail: ativar 2FA e gerar "Senha de App"
   EMAIL_USER=seu_email@gmail.com
   EMAIL_PASSWORD=sua_senha_app_google

   # Stripe (opcional, para pagamentos reais)
   STRIPE_PUBLIC_KEY=pk_test_sua_chave_publica
   STRIPE_SECRET_KEY=sk_test_sua_chave_secreta

   # URLs
   FRONTEND_URL=http://localhost:3000

   # Domínios permitidos
   ALLOWED_EMAIL_DOMAINS=gmail.com,hotmail.com,outlook.com,yahoo.com,uol.com.br

   # Rate limiting
   RATE_LIMIT_WINDOW=15
   RATE_LIMIT_MAX_REQUESTS=100
   ```

---

## ▶️ Passo 4: Iniciar o Servidor

```bash
# Iniciar em modo desenvolvimento (com auto-reload)
npm run dev

# Ou iniciar normalmente
npm start

# Você deve ver:
# ╔════════════════════════════════════════╗
# ║     🎮 GAMESTORE - SERVIDOR RODANDO   ║
# ╚════════════════════════════════════════╝
#
# 📍 Servidor: http://localhost:3000
# 🌐 Frontend: http://localhost:3000
# ⚙️  Ambiente: development
```

---

## 🌐 Passo 5: Acessar o Site

Abra seu navegador e acesse:

```
http://localhost:3000
```

Você verá:
- ✅ Página principal com catálogo de jogos
- ✅ Opção de login/registro
- ✅ Carrinho de compras
- ✅ Sistema de favoritos
- ✅ Checkout de pagamento

---

## 🧪 Passo 6: Testar Funcionalidades

### Criar conta (Registrar)

1. Clique em "Registrar"
2. Preencha:
   - **Nome:** João Silva
   - **Email:** seu_email@gmail.com (use email real ou teste)
   - **Senha:** SenhaForte123! (mínimo 8 caracteres com maiúscula, minúscula, número e símbolo)
3. Clique em "Criar Conta"
4. Você será redirecionado e estará logado

### Navegar pelo site

1. Veja os jogos na página inicial
2. Use os filtros para buscar por gênero ou preço
3. Clique em um jogo para ver mais detalhes

### Adicionar ao carrinho

1. Clique em "🛒 Comprar" em um jogo
2. Vá para "🛒 Carrinho" (número no topo)
3. Veja os itens, aumentar/diminuir quantidade
4. Clique em "Ir para Pagamento"

### Adicionar aos favoritos

1. Clique em "❤️" em um jogo
2. Vá para "❤️ Favoritos" (número no topo)
3. Veja sua wishlist

### Fazer um pagamento de teste

1. No checkout:
   - Preencha dados de envio
   - Use estes dados de teste:
     - **Número:** 4242 4242 4242 4242
     - **Validade:** 12/25
     - **CVV:** 123
2. Clique em "Confirmar Pagamento"
3. Você verá confirmação do pedido

---

## 📊 Verificar Banco de Dados

O arquivo `database.db` é criado automaticamente na primeira execução.

Para ver os dados armazenados, você pode:

### Opção 1: SQLite CLI

```bash
# Instalar SQLite (se não tiver)
# Windows: baixar do https://www.sqlite.org/download.html

# Abrir banco
sqlite3 database.db

# Ver tabelas
.tables

# Ver usuários registrados
SELECT * FROM usuarios;

# Ver jogos
SELECT * FROM jogos;

# Ver carrinho de um usuário
SELECT * FROM carrinho WHERE usuario_id = 1;

# Sair
.quit
```

### Opção 2: VS Code Extension

1. Instale a extensão "SQLite" no VS Code
2. Clique no arquivo `database.db`
3. Visualize as tabelas e dados

---

## 🐛 Solução de Problemas

### Erro: "EADDRINUSE" (Porta já em uso)

```bash
# A porta 3000 já está sendo usada
# Opção 1: Feche o processo usando a porta
# Opção 2: Use outra porta no .env
PORT=3001
npm start
```

### Erro: "Cannot find module 'express'"

```bash
# As dependências não foram instaladas
npm install

# Ou instale manualmente
npm install express sqlite3 bcryptjs jsonwebtoken dotenv
```

### Erro: "Database locked"

```bash
# Feche o banco em outros programas
# Reinicie o servidor
```

### Email/Senha não funciona no login

- Certifique-se de que o email foi registrado corretamente
- Verifique se a senha está correta (diferencia maiúscula/minúscula)
- Verifique se o domínio do email é permitido (gmail.com, hotmail.com, etc)

### Jogos não aparecem

1. Aguarde o servidor iniciar completamente
2. Verifique o console do navegador (F12 > Console)
3. Reinicie o servidor: `npm start`

---

## 📱 Testando em Outro Dispositivo

Se quiser acessar o servidor de outro computador:

1. Descubra seu IP local:
   ```bash
   # Windows (PowerShell)
   ipconfig
   
   # Linux/Mac
   ifconfig
   ```

2. Acesse de outro dispositivo:
   ```
   http://SEU_IP:3000
   ```

   Exemplo:
   ```
   http://192.168.1.100:3000
   ```

---

## 🚀 Modo Produção

Para publicar o site (Heroku, AWS, DigitalOcean):

1. **Instalar Heroku CLI** (https://devcenter.heroku.com/articles/heroku-cli)

2. **Fazer login no Heroku:**
   ```bash
   heroku login
   ```

3. **Criar app:**
   ```bash
   heroku create seu-app-name
   ```

4. **Definir variáveis de ambiente:**
   ```bash
   heroku config:set JWT_SECRET=sua_chave_secreta
   heroku config:set NODE_ENV=production
   ```

5. **Fazer deploy:**
   ```bash
   git push heroku main
   ```

---

## 📚 Arquivos Importantes

```
/
├── server.js           ← Arquivo principal do servidor
├── database.js         ← Configuração do banco de dados
├── package.json        ← Dependências
├── .env               ← Variáveis de ambiente (GUARDAR SEGURO!)
├── database.db        ← Banco de dados (criado automaticamente)
│
├── /frontend          ← Código HTML/CSS/JS do cliente
│   ├── index.html     ← Página principal
│   ├── login.html     ← Página de login/registro
│   ├── carrinho.html  ← Página do carrinho
│   ├── checkout.html  ← Página de pagamento
│   ├── favoritos.html ← Página de favoritos
│   └── style.css      ← Estilos
│
├── /backend           ← Código JavaScript do servidor
│   └── validacoes.js  ← Funções de validação
│
├── /docs              ← Documentação
│   ├── API.md         ← Documentação da API
│   └── ...
│
└── /public            ← Arquivos estáticos (imagens, etc)
    └── /images        ← Imagens dos jogos
```

---

## ❓ Dúvidas Frequentes

**P: Posso usar este projeto em produção?**
R: Não sem modificações. Você precisa:
- Usar HTTPS (certificado SSL)
- Configurar CORS corretamente
- Adicionar rate limiting
- Usar variáveis de ambiente seguras
- Validar TODAS as entradas

**P: Como adicionar mais jogos?**
R: Edite o arquivo `database.js` na função `popularComDados()` e adicione mais jogos ao array.

**P: Como integrar Stripe de verdade?**
R: 
1. Crie conta em stripe.com
2. Pegue as chaves API
3. Coloque no .env
4. Instale `npm install @stripe/stripe-js`
5. Implemente a integração seguindo docs do Stripe

**P: Posso mudar a porta?**
R: Sim! Edite `PORT=3000` no arquivo `.env` para `PORT=3001` (ou outra).

---

## 📞 Suporte

Se tiver problemas:

1. Leia o [README.md](../README.md)
2. Consulte [API.md](API.md)
3. Verifique o console do navegador (F12)
4. Verifique os logs do terminal
5. Abra uma issue no GitHub

---

**Pronto para começar?** 🎮

Execute `npm start` e acesse `http://localhost:3000`!
