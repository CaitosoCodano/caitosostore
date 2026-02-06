/*
  ARQUIVO: database.js
  DESCRIÇÃO: Configuração e criação do banco de dados SQLite
  
  O SQLite é um banco de dados simples, sem servidor separado.
  Ótimo para aprender e para pequenos/médios projetos.
  
  Aqui criamos as tabelas quando o servidor inicia pela primeira vez.
*/

// Importar módulo SQLite
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do arquivo do banco de dados
// __dirname pega a pasta onde este arquivo está
const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.db');

// Criar conexão com o banco de dados
// Se o arquivo não existir, SQLite cria automaticamente
const db = new sqlite3.Database(dbPath, (erro) => {
  if (erro) {
    console.error('❌ Erro ao conectar ao banco de dados:', erro.message);
    process.exit(1); // Para o servidor se não conseguir conectar
  }
  console.log('✅ Conectado ao banco de dados SQLite');
});

// Ativar chave estrangeira (relacionamentos entre tabelas)
// Por padrão, SQLite não ativa isso. Precisamos ativar manualmente.
db.run('PRAGMA foreign_keys = ON');

/*
  ============================================
  FUNÇÃO: criarTabelas()
  DESCRIÇÃO: Cria todas as tabelas do banco na primeira vez
  ============================================
*/
function criarTabelas() {
  // Tabela 1: USUÁRIOS (para login e autenticação)
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      -- ID único (PRIMARY KEY = identificador principal)
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      
      -- Email (UNIQUE = não pode repetir)
      email TEXT UNIQUE NOT NULL,
      
      -- Nome do usuário
      nome TEXT NOT NULL,
      
      -- Senha com hash (nunca armazenar senha em texto plano!)
      senha TEXT NOT NULL,
      
      -- Data de criação da conta
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      -- Última atualização
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      -- Status de verificação do email (0 = não, 1 = sim)
      is_verified INTEGER DEFAULT 0,

      -- Código de verificação (OTP)
      verification_code TEXT,

      -- Flag de desenvolvedor (permissões elevadas)
      is_dev INTEGER DEFAULT 0
    )
  `, (erro) => {
    if (erro) {
      console.error('❌ Erro ao criar tabela usuarios:', erro.message);
    } else {
      console.log('✅ Tabela usuarios criada/verificada');
    }
  });
  
  // Adicionar coluna avatar_url se não existir
  db.all(`PRAGMA table_info(usuarios)`, [], (err, cols) => {
    if (!err) {
      const existeAvatar = cols.some(c => c.name === 'avatar_url');
      if (!existeAvatar) {
        db.run(`ALTER TABLE usuarios ADD COLUMN avatar_url TEXT`, (e2) => {
          if (e2) console.error('⚠️ Falha ao adicionar avatar_url:', e2.message);
          else console.log('✅ Coluna avatar_url adicionada');
        });
      }
      const existeIsVerified = cols.some(c => c.name === 'is_verified');
      if (!existeIsVerified) {
        db.run(`ALTER TABLE usuarios ADD COLUMN is_verified INTEGER DEFAULT 0`, (e2b) => {
          if (e2b) console.error('⚠️ Falha ao adicionar is_verified:', e2b.message);
          else console.log('✅ Coluna is_verified adicionada');
        });
      }
      const existeVerificationCode = cols.some(c => c.name === 'verification_code');
      if (!existeVerificationCode) {
        db.run(`ALTER TABLE usuarios ADD COLUMN verification_code TEXT`, (e2c) => {
          if (e2c) console.error('⚠️ Falha ao adicionar verification_code:', e2c.message);
          else console.log('✅ Coluna verification_code adicionada');
        });
      }
      const existeIsDev = cols.some(c => c.name === 'is_dev');
      if (!existeIsDev) {
        db.run(`ALTER TABLE usuarios ADD COLUMN is_dev INTEGER DEFAULT 0`, (e3) => {
          if (e3) console.error('⚠️ Falha ao adicionar is_dev:', e3.message);
          else console.log('✅ Coluna is_dev adicionada');
        });
      }
    }
  });

  // Tabela 2: JOGOS (catálogo de produtos)
  db.run(`
    CREATE TABLE IF NOT EXISTS jogos (
      -- ID único do jogo
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      
      -- Nome do jogo
      nome TEXT NOT NULL,
      
      -- Descrição detalhada
      descricao TEXT,
      
      -- Preço em reais (armazenar como número decimal)
      preco REAL NOT NULL,
      
      -- URL da imagem (link para foto real)
      imagem_url TEXT,
      
      -- Gênero (RPG, FPS, Estratégia, Ação, etc)
      genero TEXT,
      
      -- Plataforma (PC, PlayStation 5, Xbox Series X, Nintendo Switch)
      plataforma TEXT,
      
      -- Classificação etária (L, 10, 12, 14, 16, 18)
      classificacao TEXT,
      
      -- Quantos itens em estoque (0 = fora de estoque)
      estoque INTEGER DEFAULT 999,
      
      -- Data de adição ao catálogo
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (erro) => {
    if (erro) {
      console.error('❌ Erro ao criar tabela jogos:', erro.message);
    } else {
      console.log('✅ Tabela jogos criada/verificada');
    }
  });

  // Tabela 3: CARRINHO (itens que usuário quer comprar)
  db.run(`
    CREATE TABLE IF NOT EXISTS carrinho (
      -- ID único do item no carrinho
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      
      -- ID do usuário que está comprando (FOREIGN KEY = relaciona com tabela usuarios)
      usuario_id INTEGER NOT NULL,
      
      -- ID do jogo que quer comprar (FOREIGN KEY = relaciona com tabela jogos)
      jogo_id INTEGER NOT NULL,
      
      -- Quantos desse jogo quer comprar (normalmente 1, mas deixamos flexível)
      quantidade INTEGER DEFAULT 1,
      
      -- Quando foi adicionado ao carrinho
      adicionado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      -- Chaves estrangeiras (relacionamentos)
      -- ON DELETE CASCADE = se usuário ou jogo for deletado, remove do carrinho também
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (jogo_id) REFERENCES jogos(id) ON DELETE CASCADE
    )
  `, (erro) => {
    if (erro) {
      console.error('❌ Erro ao criar tabela carrinho:', erro.message);
    } else {
      console.log('✅ Tabela carrinho criada/verificada');
    }
  });

  // Tabela 4: FAVORITOS (wishlist - jogos que quer comprar depois)
  db.run(`
    CREATE TABLE IF NOT EXISTS favoritos (
      -- ID único
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      
      -- Usuário que marcou como favorito
      usuario_id INTEGER NOT NULL,
      
      -- Jogo marcado como favorito
      jogo_id INTEGER NOT NULL,
      
      -- Quando foi marcado
      adicionado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      -- Cada usuário pode marcar cada jogo como favorito apenas uma vez
      UNIQUE(usuario_id, jogo_id),
      
      -- Relacionamentos
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (jogo_id) REFERENCES jogos(id) ON DELETE CASCADE
    )
  `, (erro) => {
    if (erro) {
      console.error('❌ Erro ao criar tabela favoritos:', erro.message);
    } else {
      console.log('✅ Tabela favoritos criada/verificada');
    }
  });

  // Tabela 5: PEDIDOS (histórico de compras realizadas)
  db.run(`
    CREATE TABLE IF NOT EXISTS pedidos (
      -- ID único do pedido
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      
      -- Usuário que fez o pedido
      usuario_id INTEGER NOT NULL,
      
      -- Valor total do pedido em reais
      valor_total REAL NOT NULL,
      
      -- Status do pedido (pendente, pago, enviado, entregue, cancelado)
      status TEXT DEFAULT 'pendente',
      
      -- ID da transação no Stripe (para rastrear pagamento)
      stripe_payment_id TEXT UNIQUE,
      
      -- Data do pedido
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      -- Última atualização (quando foi pago, enviado, etc)
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      -- Relacionamento
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `, (erro) => {
    if (erro) {
      console.error('❌ Erro ao criar tabela pedidos:', erro.message);
    } else {
      console.log('✅ Tabela pedidos criada/verificada');
    }
  });

  // Tabela 6: ITENS_PEDIDO (detalhes de cada item que foi comprado)
  db.run(`
    CREATE TABLE IF NOT EXISTS itens_pedido (
      -- ID único
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      
      -- Qual pedido este item pertence
      pedido_id INTEGER NOT NULL,
      
      -- Qual jogo foi comprado
      jogo_id INTEGER NOT NULL,
      
      -- Quantidade comprada
      quantidade INTEGER NOT NULL,
      
      -- Preço unitário (armazenar para manter histórico, mesmo se preço mudar)
      preco_unitario REAL NOT NULL,
      
      -- Relacionamentos
      FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
      FOREIGN KEY (jogo_id) REFERENCES jogos(id)
    )
  `, (erro) => {
    if (erro) {
      console.error('❌ Erro ao criar tabela itens_pedido:', erro.message);
    } else {
      console.log('✅ Tabela itens_pedido criada/verificada');
    }
  });

  // Tabela 7: PAGAMENTOS_PIX (registros de pagamentos PIX)
  db.run(`
    CREATE TABLE IF NOT EXISTS pagamentos_pix (
      -- ID único
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      
      -- ID do pedido relacionado (pode ser null se ainda não tem pedido)
      pedido_id INTEGER,
      
      -- ID do usuário (opcional, pode ser anônimo)
      usuario_id INTEGER,
      
      -- ID do pagamento gerado pelo servidor (chave única)
      pix_payment_id TEXT UNIQUE NOT NULL,
      
      -- Valor do pagamento em reais
      valor REAL NOT NULL,
      
      -- Status do pagamento (pendente, confirmado, cancelado)
      status TEXT DEFAULT 'pendente',
      
      -- Chave PIX usada (apenas para referência, será criptografada em produção)
      chave_pix_hash TEXT,
      
      -- QR Code em base64
      qr_code TEXT,
      
      -- Descrição do pagamento
      descricao TEXT,
      
      -- Quando foi criado
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      -- Quando foi confirmado
      confirmado_em DATETIME,
      
      -- Relacionamentos
      FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `, (erro) => {
    if (erro) {
      console.error('❌ Erro ao criar tabela pagamentos_pix:', erro.message);
    } else {
      console.log('✅ Tabela pagamentos_pix criada/verificada');
    }
  });

  // Tabela 9: MENSAGENS DE CONTATO
  db.run(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      nome TEXT NOT NULL,
      email TEXT NOT NULL,
      mensagem TEXT NOT NULL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'novo',
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
    )
  `, (erro) => {
    if (erro) console.error('❌ Erro ao criar tabela contact_messages:', erro.message);
    else console.log('✅ Tabela contact_messages criada/verificada');
  });

  // Tabela 10: SESSÕES DE USUÁRIO (monitorar online)
  db.run(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `, (erro) => {
    if (erro) console.error('❌ Erro ao criar tabela user_sessions:', erro.message);
    else console.log('✅ Tabela user_sessions criada/verificada');
  });

  // Tabela 8: CONTEUDO_PAGINAS (Para o CMS do Admin)
  db.run(`
    CREATE TABLE IF NOT EXISTS conteudo_paginas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL, -- ex: 'sobre', 'contato', 'inicio_titulo'
      conteudo TEXT,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (erro) => {
    if (erro) console.error('❌ Erro ao criar tabela conteudo_paginas:', erro.message);
    else {
      console.log('✅ Tabela conteudo_paginas criada/verificada');
      // Inserir dados padrão se vazio
      db.get('SELECT COUNT(*) as total FROM conteudo_paginas', (err, row) => {
        if (!err && row.total === 0) {
          db.run(`INSERT INTO conteudo_paginas (slug, conteudo) VALUES 
            ('sobre', '<h1>Sobre Nós</h1><p>Somos a melhor loja de jogos do Brasil. Nascemos da paixão por games.</p>'),
            ('contato', '<h1>Fale Conosco</h1><p>Email: contato@gamestore.com<br>Tel: (11) 99999-9999</p>')
          `);
        }
      });
    }
  });

  console.log('✅ Todas as tabelas foram criadas/verificadas com sucesso!');
}

/*
  ============================================
  FUNÇÃO: popularComDados()
  DESCRIÇÃO: Adiciona jogos reais no banco pela primeira vez
  (Apenas se a tabela estiver vazia)
  ============================================
*/
function popularComDados() {
  // A pedido do usuário, removemos a criação automática de jogos "fakes" ou de exemplo.
  // O banco começará vazio ou apenas com o que o admin adicionar.
  console.log('ℹ️ Banco de dados pronto. Nenhum jogo adicionado automaticamente (Modo Produção).');
}

/*
  ============================================
  INICIALIZAR BANCO DE DADOS
  ============================================
*/
// Ativar modo de inicialização
db.serialize(() => {
  // Criar tabelas
  criarTabelas();
  
  // Popular com dados iniciais
  setTimeout(() => {
    popularComDados();
    // Criar conta do desenvolvedor se não existir (email técnico)
    const devEmail = 'devvagnerofficial@dev.local';
    const devNome = 'Dev Vagner Official';
    const devHash = '$2a$10$d41NU14ne3.2wGTM3kEJeeE/uFfcUbfyTbXLZ2f3/Mnw8FdbbsyY2'; // hash bcrypt da senha fornecida
    db.get('SELECT id FROM usuarios WHERE email = ?', [devEmail], (e1, row) => {
      if (e1) {
        console.error('⚠️ Falha ao verificar dev user:', e1.message);
        return;
      }
      if (!row) {
        db.run(
          'INSERT INTO usuarios (email, nome, senha, is_verified, verification_code, avatar_url, is_dev) VALUES (?, ?, ?, 1, NULL, ?, 1)',
          [devEmail, devNome, devHash, 'https://api.dicebear.com/7.x/bottts/svg?seed=devvagner&backgroundType=gradient'],
          function(e2) {
            if (e2) console.error('⚠️ Falha ao criar dev user:', e2.message);
            else console.log('✅ Conta do desenvolvedor criada');
          }
        );
      } else {
        // Garantir flag is_dev ligada
        db.run('UPDATE usuarios SET is_dev = 1 WHERE email = ?', [devEmail]);
      }
    });
  }, 500);
});

/*
  ============================================
  EXPORTAR FUNÇÕES ÚTEIS
  ============================================
*/
module.exports = {
  db,
  
  // Função para executar queries (SELECT)
  todos: (sql, params = []) => {
    return new Promise((resolver, rejeitar) => {
      db.all(sql, params, (erro, rows) => {
        if (erro) rejeitar(erro);
        else resolver(rows);
      });
    });
  },

  // Função para buscar um resultado
  um: (sql, params = []) => {
    return new Promise((resolver, rejeitar) => {
      db.get(sql, params, (erro, row) => {
        if (erro) rejeitar(erro);
        else resolver(row);
      });
    });
  },

  // Função para inserir/atualizar/deletar
  executar: (sql, params = []) => {
    return new Promise((resolver, rejeitar) => {
      db.run(sql, params, function(erro) {
        if (erro) rejeitar(erro);
        else resolver({ id: this.lastID, mudancas: this.changes });
      });
    });
  }
};
