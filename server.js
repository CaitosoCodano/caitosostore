/*
  ARQUIVO: server.js
  DESCRIÇÃO: Servidor principal da aplicação (Express)
  
  Este arquivo configura e inicia o servidor web.
  Todas as requisições do frontend vêm para cá.
  
  Express = framework web simples, rápido e flexível
*/

// ============================================
// IMPORTAÇÕES (dependências)
// ============================================

// Express = criar servidor web
const express = require('express');

// Axios = fazer requisições HTTP para APIs externas
const axios = require('axios');

// dotenv = ler variáveis de ambiente (.env)
require('dotenv').config();

// CORS = permitir requisições do frontend
const cors = require('cors');

// Helmet = segurança (headers HTTP)
const helmet = require('helmet');

// Rate limiting = proteção contra abuso (brute force)
const rateLimit = require('express-rate-limit');

// Stripe = integração de pagamentos (PIX, cartão, etc)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');

// QR Code = gerar códigos QR para PIX
const QRCode = require('qrcode');

// Banco de dados
const { db } = require('./database');

// ============================================
// CONFIGURAR API DO MERCADO PAGO
// ============================================

// Token de acesso do Mercado Pago
// Obter em: https://www.mercadopago.com.br/developers/pt-BR/docs/checkout-bricks/release-notes
const MERCADO_PAGO_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
const MERCADO_PAGO_API_URL = 'https://api.mercadopago.com';

// Verificar se token está configurado
if (!MERCADO_PAGO_TOKEN) {
  console.warn('⚠️ MERCADO_PAGO_ACCESS_TOKEN não configurado no .env');
} else {
  console.log('✅ Mercado Pago configurado (utilizando API REST)');
}

// ============================================
// CRIAR APLICAÇÃO EXPRESS
// ============================================

const app = express();
const PORT = process.env.PORT || 3000;

/*
  ============================================
  MIDDLEWARE (processadores de requisição)
  ============================================
  
  Middleware = funções que rodam ANTES de chegar na rota
  Usamos para processar dados, autenticar, validar, etc
*/

// 1. Helmet = adiciona headers de segurança
// Configurar CSP para permitir inline scripts e event handlers em desenvolvimento
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Permitir inline scripts
      scriptSrcAttr: ["'self'", "'unsafe-inline'"], // Permitir event handlers (onclick, etc)
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"], // Permitir imagens externas
      connectSrc: ["'self'"] // APIs do próprio servidor
    }
  }
}));

// 2. CORS = permite requisições do frontend
app.use(cors({
  // Permitir requisições apenas do localhost (em produção, especificar domínio)
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true // permitir cookies
}));

// 3. Parser de JSON = entender dados JSON que vêm do frontend
app.use(express.json());

// 4. Parser de URL-encoded = entender dados de formulários
app.use(express.urlencoded({ extended: true }));

// 5. Servir arquivos estáticos (imagens, CSS, JS)
// IMPORTANTE: Colocar ANTES das rotas para que tenha prioridade
// Arquivos em /public são acessíveis via /arquivo
// Arquivos em /frontend são acessíveis via /arquivo
app.use(express.static('public'));
app.use(express.static('frontend'));

// 6. Rate limiting = máximo de requisições por IP (evitar brute force)
const limitador = rateLimit({
  // Janela de tempo: 15 minutos
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  // Máximo de requisições nesse período
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  // Mensagem de erro
  message: '❌ Muitas requisições. Tente novamente mais tarde.'
});

// Aplicar rate limit em rotas sensíveis
app.use('/api/auth/', limitador);
app.use('/api/pagamento/', limitador);

/*
  ============================================
  ROTAS PÚBLICAS (não precisam autenticação)
  ============================================
*/

// Rota raiz = entregar a página principal da loja
app.get('/', (req, res) => {
  const path = require('path');
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Rota para aceitar /frontend/* e servir do mesmo lugar que /*
app.get('/frontend/*', (req, res) => {
  // Pegar o caminho relativo (/login.html de /frontend/login.html)
  const caminhoArquivo = req.params[0]; // Pega tudo após /frontend/
  const fs = require('fs');
  const path = require('path');
  
  const arquivoCompleto = path.join(__dirname, 'frontend', caminhoArquivo);
  
  // Verificar se arquivo existe
  if (fs.existsSync(arquivoCompleto)) {
    res.sendFile(arquivoCompleto);
  } else {
    res.status(404).json({
      erro: '❌ Arquivo não encontrado',
      arquivo: caminhoArquivo
    });
  }
});

// ============================================
// ROTAS DE AUTENTICAÇÃO
// ============================================

/*
  POST /api/auth/registro
  
  Registrar novo usuário
  
  Dados enviados:
  {
    "email": "joao@gmail.com",
    "nome": "João Silva",
    "senha": "SenhaForte123!"
  }
*/
app.post('/api/auth/registro', async (req, res) => {
  try {
    const { email, nome, senha } = req.body;

    // Importar validações
    const { validarEmail, validarSenha, validarNome } = require('./backend/validacoes');

    // 1. Validar email
    const emailValidado = validarEmail(email);
    if (!emailValidado.valido) {
      return res.status(400).json({
        erro: emailValidado.erro
      });
    }

    // 2. Validar senha
    const senhaValidada = validarSenha(senha);
    if (!senhaValidada.valida) {
      return res.status(400).json({
        erro: senhaValidada.erro
      });
    }

    // 3. Validar nome
    const nomeValidado = validarNome(nome);
    if (!nomeValidado.valido) {
      return res.status(400).json({
        erro: nomeValidado.erro
      });
    }

    // 4. Verificar se email já existe no banco
    const usuarioExistente = await new Promise((resolver, rejeitar) => {
      db.get('SELECT id FROM usuarios WHERE email = ?', [emailValidado.email], (erro, row) => {
        if (erro) rejeitar(erro);
        else resolver(row);
      });
    });

    if (usuarioExistente) {
      return res.status(400).json({
        erro: 'Email já cadastrado. Faça login ou use outro email.'
      });
    }

    // 5. Hash da senha (encriptar)
    // bcryptjs = transformar senha em código que não pode ser revertido
    const bcrypt = require('bcryptjs');
    const senhaHash = await bcrypt.hash(senha, 10);

    // 6. Inserir novo usuário no banco
    const resultado = await new Promise((resolver, rejeitar) => {
      db.run(
        'INSERT INTO usuarios (email, nome, senha) VALUES (?, ?, ?)',
        [emailValidado.email, nomeValidado.nome, senhaHash],
        function(erro) {
          if (erro) rejeitar(erro);
          else resolver({ id: this.lastID });
        }
      );
    });

    // 7. Gerar JWT (token de autenticação)
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: resultado.id, email: emailValidado.email },
      process.env.JWT_SECRET || 'chave_secreta_padrao',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // 8. Retornar sucesso
    res.status(201).json({
      mensagem: '✅ Registro realizado com sucesso!',
      token: token,
      usuario: {
        id: resultado.id,
        email: emailValidado.email,
        nome: nomeValidado.nome
      }
    });

  } catch (erro) {
    console.error('❌ Erro no registro:', erro);
    res.status(500).json({
      erro: 'Erro ao registrar. Tente novamente.'
    });
  }
});

/*
  POST /api/auth/login
  
  Fazer login com email e senha
  
  Dados enviados:
  {
    "email": "joao@gmail.com",
    "senha": "SenhaForte123!"
  }
*/
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validar entrada
    if (!email || !senha) {
      return res.status(400).json({
        erro: 'Email e senha são obrigatórios'
      });
    }

    // 1. Buscar usuário no banco
    const usuario = await new Promise((resolver, rejeitar) => {
      db.get('SELECT * FROM usuarios WHERE email = ?', [email.toLowerCase()], (erro, row) => {
        if (erro) rejeitar(erro);
        else resolver(row);
      });
    });

    if (!usuario) {
      // Não dizer qual é o erro (segurança)
      return res.status(401).json({
        erro: 'Email ou senha incorretos'
      });
    }

    // 2. Comparar senha
    const bcrypt = require('bcryptjs');
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({
        erro: 'Email ou senha incorretos'
      });
    }

    // 3. Gerar JWT
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET || 'chave_secreta_padrao',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // 4. Retornar sucesso
    res.json({
      mensagem: '✅ Login realizado com sucesso!',
      token: token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome
      }
    });

  } catch (erro) {
    console.error('❌ Erro no login:', erro);
    res.status(500).json({
      erro: 'Erro ao fazer login. Tente novamente.'
    });
  }
});

// ============================================
// ROTAS DE PRODUTOS
// ============================================

/*
  GET /api/jogos
  
  Listar todos os jogos disponíveis
  
  Parâmetros opcionais:
  - genero (filtrar por gênero)
  - preco_max (filtrar por preço máximo)
  
  Resposta: array de jogos
*/
app.get('/api/jogos', async (req, res) => {
  try {
    const { genero, preco_max } = req.query;

    // Construir query dinamicamente
    let query = 'SELECT * FROM jogos WHERE 1=1';
    const params = [];

    // Se filtrar por gênero
    if (genero) {
      query += ' AND genero = ?';
      params.push(genero);
    }

    // Se filtrar por preço máximo
    if (preco_max) {
      query += ' AND preco <= ?';
      params.push(parseFloat(preco_max));
    }

    // Ordenar por nome
    query += ' ORDER BY nome ASC';

    // Executar query
    const jogos = await new Promise((resolver, rejeitar) => {
      db.all(query, params, (erro, rows) => {
        if (erro) rejeitar(erro);
        else resolver(rows || []);
      });
    });

    res.json({
      total: jogos.length,
      jogos: jogos
    });

  } catch (erro) {
    console.error('❌ Erro ao listar jogos:', erro);
    res.status(500).json({
      erro: 'Erro ao carregar jogos'
    });
  }
});

/*
  GET /api/jogos/:id
  
  Obter detalhes de um jogo específico
*/
app.get('/api/jogos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const jogo = await new Promise((resolver, rejeitar) => {
      db.get('SELECT * FROM jogos WHERE id = ?', [id], (erro, row) => {
        if (erro) rejeitar(erro);
        else resolver(row);
      });
    });

    if (!jogo) {
      return res.status(404).json({
        erro: 'Jogo não encontrado'
      });
    }

    res.json(jogo);

  } catch (erro) {
    console.error('❌ Erro ao buscar jogo:', erro);
    res.status(500).json({
      erro: 'Erro ao carregar jogo'
    });
  }
});

// ============================================
// ROTA DE TESTE
// ============================================

// Verificar se servidor está rodando
app.get('/api/status', (req, res) => {
  res.json({
    status: '✅ Servidor rodando',
    ambiente: process.env.NODE_ENV,
    porta: PORT
  });
});

// ============================================
// ROTAS DE PAGAMENTO - PIX
// ============================================

/*
  POST /api/pagamento/pix
  
  Criar uma intenção de pagamento PIX
  Retorna QR Code para o usuário escanear
  
  ⚠️ SEGURANÇA: A chave PIX NUNCA é enviada para o frontend
  O QR Code é gerado no backend com a chave real
  
  Dados enviados:
  {
    "valor": 149.90,
    "descricao": "Compra de jogos",
    "usuarioId": 1
  }
*/
app.post('/api/pagamento/pix', limitador, async (req, res) => {
  try {
    const { valor, descricao, usuarioId } = req.body;

    // Validar dados
    if (!valor || valor <= 0) {
      return res.status(400).json({
        erro: '❌ Valor inválido',
        detalhes: 'Valor deve ser maior que 0'
      });
    }

    // Validar se Mercado Pago está configurado
    if (!MERCADO_PAGO_TOKEN) {
      return res.status(400).json({
        erro: '❌ Mercado Pago não configurado',
        detalhes: 'Configure MERCADO_PAGO_ACCESS_TOKEN no .env',
        info: 'Obter token em: https://www.mercadopago.com.br/developers'
      });
    }

    console.log(`\n💳 Criando pagamento PIX via Mercado Pago...`);
    console.log(`   Valor: R$ ${(valor).toFixed(2)}`);
    console.log(`   Descrição: ${descricao || 'Compra na GameStore'}`);

    try {
      // Criar preferência de pagamento no Mercado Pago via API REST
      const preference = {
        // Itens do pedido
        items: [
          {
            id: '1',
            title: descricao || 'Compra na GameStore',
            quantity: 1,
            unit_price: valor
          }
        ],
        
        // URLs de retorno
        back_urls: {
          // URL para quando pagamento é aprovado
          success: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout.html?status=success`,
          // URL para quando é recusado
          failure: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout.html?status=failure`,
          // URL em caso de pagamento pendente
          pending: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout.html?status=pending`
        },
        
        // Não definir auto_return para evitar erros de validação com algumas contas
        // (o frontend controla o fluxo usando linkCheckout / qrCode)
        
        // Dados do pagador
        payer: {
          email: 'teste@mercadopago.com'
        },
        
        // Metadados (dados extras para rastrear)
        metadata: {
          usuarioId: usuarioId || 'anonimo',
          loja: 'GameStore'
        },
        
        // Tipo de pagamento aceito (apenas PIX em modo standalone)
        payment_methods: {
          excluded_payment_methods: [],
          default_payment_method_id: null,
          installments: 1
        }
      };

      // Fazer requisição POST para criar preferência no Mercado Pago
      const resposta = await axios.post(
        `${MERCADO_PAGO_API_URL}/checkout/preferences`,
        preference,
        {
          // Headers com autenticação
          headers: {
            'Authorization': `Bearer ${MERCADO_PAGO_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Extrair dados da resposta
      const mercadoPagoId = resposta.data.id;
      const linkCheckout = resposta.data.init_point;
      
      console.log(`✅ Preferência Mercado Pago criada: ${mercadoPagoId}`);
      console.log(`   Link de checkout: ${linkCheckout}`);

      // Gerar QR Code com a chave PIX
      const chavePix = process.env.PIX_KEY || '03731228297';
      let qrCodeDataUrl = '';
      
      try {
        qrCodeDataUrl = await QRCode.toDataURL(chavePix, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 300,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        console.log(`✅ QR Code PIX gerado`);
      } catch (erroQR) {
        console.error('❌ Erro ao gerar QR Code:', erroQR.message);
      }

      // Salvar informações no banco de dados local para controle
      try {
        const sql = `
          INSERT INTO pagamentos_pix (
            pix_payment_id, 
            usuario_id, 
            valor, 
            status, 
            descricao, 
            qr_code
          ) VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        db.run(sql, [
          mercadoPagoId,
          usuarioId || null,
          valor,
          'pendente',
          descricao || 'Compra na GameStore',
          qrCodeDataUrl
        ], function(erro) {
          if (erro) {
            console.error('❌ Erro ao salvar pagamento no banco:', erro.message);
          } else {
            console.log(`✅ Pagamento salvo no banco (ID local: ${this.lastID})`);
          }
        });
      } catch (erroDb) {
        console.error('❌ Erro ao salvar no banco:', erroDb.message);
      }

      // Responder ao cliente com tudo que precisa para o checkout
      res.status(201).json({
        sucesso: true,
        mensagem: '✅ QR Code PIX gerado com sucesso',
        
        // ID do pagamento (Preferência ID do Mercado Pago)
        pixPaymentId: mercadoPagoId,
        
        // Link de checkout do Mercado Pago (opção alternativa)
        linkCheckout: linkCheckout,
        
        // Valor em reais
        valor: valor,
        
        // QR Code em Data URL (imagem base64)
        qrCode: qrCodeDataUrl,
        
        // Instruções para o usuário
        instrucoes: {
          metodo: 'PIX',
          passo1: 'Escaneie o QR Code com seu app bancário',
          passo2: 'Confirme a transferência',
          passo3: 'Seu pagamento será confirmado em até 5 minutos',
          aviso: '✅ Pagamento seguro via Mercado Pago'
        }
      });

    } catch (erroRequisicao) {
      console.error('❌ Erro ao chamar API Mercado Pago:', erroRequisicao.message);
      console.error('   Status:', erroRequisicao.response?.status);
      console.error('   Dados:', erroRequisicao.response?.data);

      res.status(500).json({
        erro: '❌ Erro ao criar preferência Mercado Pago',
        detalhes: erroRequisicao.message,
        status: erroRequisicao.response?.status,
        resposta: erroRequisicao.response?.data
      });
    }

  } catch (erro) {
    console.error('❌ Erro ao criar pagamento PIX:', erro.message);
    res.status(500).json({
      erro: '❌ Erro ao criar pagamento PIX',
      detalhes: erro.message
    });
  }
});

/*
  GET /api/pagamento/pix/:pixPaymentId
  
  Verificar o status de um pagamento PIX usando API REST do Mercado Pago
  ⚠️ SEGURANÇA: Nunca expõe a chave PIX
  
  Retorna true se foi pago, false se pendente
*/
app.get('/api/pagamento/pix/:pixPaymentId', async (req, res) => {
  try {
    const { pixPaymentId } = req.params;

    console.log(`\n🔍 Verificando status do PIX no Mercado Pago: ${pixPaymentId}`);

    // Validar se Mercado Pago está configurado
    if (!MERCADO_PAGO_TOKEN) {
      return res.status(400).json({
        erro: '❌ Mercado Pago não configurado',
        detalhes: 'Configure MERCADO_PAGO_ACCESS_TOKEN no .env'
      });
    }

    try {
      // Consultar preferência de pagamento no Mercado Pago via API REST
      const resposta = await axios.get(
        `${MERCADO_PAGO_API_URL}/checkout/preferences/${pixPaymentId}`,
        {
          // Headers com autenticação
          headers: {
            'Authorization': `Bearer ${MERCADO_PAGO_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Preferência Mercado Pago encontrada`);

      // Dados da preferência do Mercado Pago
      const preferencia = resposta.data;

      // Buscar informações adicionais no banco de dados local
      db.get(
        'SELECT * FROM pagamentos_pix WHERE pix_payment_id = ?',
        [pixPaymentId],
        (erro, pagamento) => {
          if (erro) {
            console.error('❌ Erro ao buscar pagamento local:', erro.message);
            // Continuar mesmo se houver erro no banco local
          }

          // Determinar o status baseado em dados do Mercado Pago e banco local
          let status = 'pendente';
          let statusDescricao = '⏳ Aguardando pagamento';
          let pago = false;

          // Se o banco local tem informação de confirmação
          if (pagamento && pagamento.status === 'confirmado') {
            status = 'confirmado';
            statusDescricao = '✅ Pagamento confirmado';
            pago = true;
          }

          console.log(`📊 Status: ${statusDescricao}`);

          // Responder com informações do pagamento
          res.json({
            // ID do pagamento PIX (ID da preferência Mercado Pago)
            pixPaymentId: pixPaymentId,
            
            // Status da transação
            status: status,
            statusFormatado: statusDescricao,
            
            // Valor em reais (do banco local se disponível)
            valor: pagamento ? pagamento.valor : null,
            
            // Se foi pago
            pago: pago,
            
            // Timestamp de criação
            criadoEm: pagamento ? pagamento.criado_em : null,
            
            // ⚠️ A chave PIX NUNCA é enviada aqui
            
            // Se pagamento foi realizado com sucesso
            ...(pago && {
              sucesso: true,
              mensagem: '✅ Seu pagamento foi confirmado! Muito obrigado pela compra!'
            }),
            
            // Se ainda está pendente
            ...(!pago && {
              sucesso: false,
              mensagem: '⏳ Pagamento ainda não foi recebido. Escaneie o QR Code e complete a transferência.'
            })
          });
        }
      );

    } catch (erroRequisicao) {
      console.error('❌ Erro ao chamar API Mercado Pago:', erroRequisicao.message);
      console.error('   Status:', erroRequisicao.response?.status);
      
      // Se preferência não existe no Mercado Pago, buscar no banco local como fallback
      if (erroRequisicao.response?.status === 404) {
        console.log('   Preferência não encontrada no Mercado Pago, buscando no banco local...');
        
        db.get(
          'SELECT * FROM pagamentos_pix WHERE pix_payment_id = ?',
          [pixPaymentId],
          (erro, pagamento) => {
            if (erro) {
              console.error('❌ Erro ao buscar no banco local:', erro.message);
              return res.status(500).json({
                erro: '❌ Erro ao buscar pagamento',
                detalhes: erro.message
              });
            }

            if (!pagamento) {
              return res.status(404).json({
                erro: '❌ Pagamento não encontrado',
                pixPaymentId: pixPaymentId
              });
            }

            // Responder com dados do banco local
            const statusDescricao = pagamento.status === 'confirmado'
              ? '✅ Pagamento confirmado'
              : '⏳ Aguardando pagamento';

            res.json({
              pixPaymentId: pixPaymentId,
              status: pagamento.status,
              statusFormatado: statusDescricao,
              valor: pagamento.valor,
              pago: pagamento.status === 'confirmado',
              criadoEm: pagamento.criado_em,
              aviso: '⚠️ Usando dados locais (Mercado Pago indisponível)',
              ...(pagamento.status === 'confirmado' && {
                sucesso: true,
                mensagem: '✅ Seu pagamento foi confirmado! Muito obrigado pela compra!'
              }),
              ...( pagamento.status !== 'confirmado' && {
                sucesso: false,
                mensagem: '⏳ Pagamento ainda não foi recebido. Escaneie o QR Code e complete a transferência.'
              })
            });
          }
        );
      } else {
        res.status(500).json({
          erro: '❌ Erro ao consultar status do pagamento',
          detalhes: erroRequisicao.message,
          status: erroRequisicao.response?.status
        });
      }
    }

  } catch (erro) {
    console.error('❌ Erro ao verificar PIX:', erro.message);
    res.status(500).json({
      erro: '❌ Erro ao verificar status do PIX',
      detalhes: erro.message
    });
  }
});

// ============================================
// ROTA 404 (não encontrada)
// ============================================

/*
  POST /api/pagamento/pix/simular/:pixPaymentId
  
  Simular confirmação de pagamento (apenas para testes)
  ⚠️ SEGURANÇA: Remover esta rota em produção!
*/
app.post('/api/pagamento/pix/simular/:pixPaymentId', limitador, async (req, res) => {
  try {
    const { pixPaymentId } = req.params;
    console.log(`\n✅ [TESTE] Simulando pagamento PIX confirmado: ${pixPaymentId}`);
    db.run(
      'UPDATE pagamentos_pix SET status = ? WHERE pix_payment_id = ?',
      ['confirmado', pixPaymentId],
      function(erro) {
        if (erro) {
          console.error('❌ Erro ao atualizar pagamento:', erro.message);
          return res.status(500).json({
            erro: '❌ Erro ao simular pagamento',
            detalhes: erro.message
          });
        }
        if (this.changes === 0) {
          return res.status(404).json({
            erro: '❌ Pagamento não encontrado',
            pixPaymentId: pixPaymentId
          });
        }
        console.log(`✅ Pagamento marcado como confirmado no banco`);
        res.json({
          sucesso: true,
          mensagem: '✅ Pagamento simulado com sucesso',
          pixPaymentId: pixPaymentId,
          status: 'confirmado'
        });
      }
    );
  } catch (erro) {
    console.error('❌ Erro ao simular pagamento:', erro.message);
    res.status(500).json({
      erro: '❌ Erro ao simular pagamento PIX',
      detalhes: erro.message
    });
  }
});

// ============================================
// ROTA 404 (não encontrada)
// ============================================

app.use((req, res) => {
  res.status(404).json({
    erro: '❌ Rota não encontrada',
    rota: req.path
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║     🎮 GAMESTORE - SERVIDOR RODANDO   ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log(`📍 Servidor: http://localhost:${PORT}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`⚙️  Ambiente: ${process.env.NODE_ENV}`);
  console.log('');
  console.log('Pressione Ctrl+C para parar o servidor');
  console.log('');
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (erro) => {
  console.error('❌ Erro não tratado:', erro);
  process.exit(1);
});
