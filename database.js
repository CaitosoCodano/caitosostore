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
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (erro) => {
    if (erro) {
      console.error('❌ Erro ao criar tabela usuarios:', erro.message);
    } else {
      console.log('✅ Tabela usuarios criada/verificada');
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
  // Verificar se já tem jogos no banco (se tiver, não adiciona de novo)
  db.get('SELECT COUNT(*) as total FROM jogos', (erro, resultado) => {
    if (erro) {
      console.error('❌ Erro ao verificar jogos:', erro.message);
      return;
    }

    // Se não tem jogos, adicionar alguns reais
    if (resultado.total === 0) {
      const jogos = [
        {
          nome: 'Cyberpunk 2077',
          descricao: 'RPG futurista em Night City. Customize seu personagem e explore um mundo aberto incível.',
          preco: 149.90,
          imagem_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co23d4.jpg',
          genero: 'RPG',
          plataforma: 'PC, PlayStation 5, Xbox Series X',
          classificacao: '18'
        },
        {
          nome: 'EA Sports FC 24',
          descricao: 'Jogo de futebol com todos os times e jogadores reais. Modo carreira, Ultimate Team e mais.',
          preco: 209.90,
          imagem_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co68ha.jpg',
          genero: 'Esportes',
          plataforma: 'PC, PlayStation 5, Xbox Series X, Nintendo Switch',
          classificacao: '3'
        },
        {
          nome: 'God of War: Ragnarok',
          descricao: 'Aventura épica de Kratos. Conclua a jornada nórdica em um cenário de destruição apocalíptica.',
          preco: 249.90,
          imagem_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co52ug.jpg',
          genero: 'Ação-Aventura',
          plataforma: 'PlayStation 5',
          classificacao: '18'
        },
        {
          nome: 'The Legend of Zelda: Tears of the Kingdom',
          descricao: 'A sequência esperada de Breath of the Wild. Explore Hyrule com novos poderes e mecanismos.',
          preco: 299.90,
          imagem_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5r7a.jpg',
          genero: 'Ação-Aventura',
          plataforma: 'Nintendo Switch',
          classificacao: '12'
        },
        {
          nome: 'Final Fantasy XVI',
          descricao: 'JRPG espetacular com gráficos de última geração. Siga Clive em sua jornada épica.',
          preco: 279.90,
          imagem_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5kho.jpg',
          genero: 'RPG',
          plataforma: 'PlayStation 5',
          classificacao: '16'
        },
        {
          nome: 'Hogwarts Legacy',
          descricao: 'Explore o mundo mágico de Harry Potter como um novo aluno. Estude magia e enfrente desafios.',
          preco: 199.90,
          imagem_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4uip.jpg',
          genero: 'RPG',
          plataforma: 'PC, PlayStation 5, Xbox Series X, Nintendo Switch',
          classificacao: '12'
        },
        {
          nome: 'Elden Ring',
          descricao: 'Action RPG desafiador do criador de Dark Souls. Explore as Terras Intermédias em um mundo aberto.',
          preco: 229.90,
          imagem_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5mzl.jpg',
          genero: 'RPG',
          plataforma: 'PC, PlayStation 5, Xbox Series X',
          classificacao: '16'
        },
        {
          nome: 'Baldur\'s Gate 3',
          descricao: 'RPG épico baseado em D&D. Milhares de escolhas que afetam sua história. Jogue solo ou em grupo.',
          preco: 239.90,
          imagem_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5na8.jpg',
          genero: 'RPG',
          plataforma: 'PC, PlayStation 5, Xbox Series X',
          classificacao: '18'
        },
        {
          nome: 'Call of Duty: Modern Warfare II',
          descricao: 'FPS tático com campanha épica e multiplayer intenso. Jogue online com amigos.',
          preco: 259.90,
          imagem_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5ozl.jpg',
          genero: 'FPS',
          plataforma: 'PC, PlayStation 5, Xbox Series X',
          classificacao: '18'
        },
        {
          nome: 'Starfield',
          descricao: 'Exploração espacial em primeira pessoa. Customize sua nave e explore centenas de planetas.',
          preco: 269.90,
          imagem_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5r1q.jpg',
          genero: 'RPG',
          plataforma: 'PC, Xbox Series X',
          classificacao: '16'
        }
      ];

      // Inserir cada jogo no banco
      const stmt = db.prepare(`
        INSERT INTO jogos (nome, descricao, preco, imagem_url, genero, plataforma, classificacao)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      jogos.forEach((jogo) => {
        stmt.run(
          jogo.nome,
          jogo.descricao,
          jogo.preco,
          jogo.imagem_url,
          jogo.genero,
          jogo.plataforma,
          jogo.classificacao,
          (erro) => {
            if (erro) {
              console.error(`❌ Erro ao adicionar ${jogo.nome}:`, erro.message);
            }
          }
        );
      });

      stmt.finalize(() => {
        console.log('✅ 10 jogos reais adicionados ao banco de dados!');
      });
    }
  });
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
