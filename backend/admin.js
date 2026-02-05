/*
  ARQUIVO: backend/admin.js
  DESCRIÇÃO: Rotas de administração backend-only (Dev)
  
  Este arquivo provê:
  - Autenticação do Dev via credenciais fortes (variáveis de ambiente)
  - Consulta de usuários e pedidos
  - Atualização segura de senha (reset), sem exposição de senhas atuais
  - Leitura/Atualização de conteúdo de páginas (CMS) via backend
*/

const express = require('express');
const router = express.Router();
const { db } = require('../database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// ============================================
// CONFIGURAÇÕES DO ADMIN (Hardcoded conforme pedido)
// ============================================

// Credenciais do Dev (usar variáveis de ambiente para segurança)
const ADMIN_USER = process.env.ADMIN_USER || 'dev_admin_user';
const ADMIN_PASS = process.env.ADMIN_PASS || 'CH4ve$uperF0rte!2026';

// ============================================
// ROTAS DE AUTENTICAÇÃO
// ============================================

/*
  POST /api/dev/login
  Verifica credenciais do dev
*/
router.post('/login', (req, res) => {
  const { usuario, senha } = req.body;

  // Verificar credenciais exatas
  if (usuario === ADMIN_USER && senha === ADMIN_PASS) {
    // Em um sistema real, usaríamos JWT aqui também
    // Mas para simplificar, vamos retornar um token "fake" que o frontend vai salvar
    // e enviar nos headers das próximas requisições
    
    // Gerar token simples (base64 do usuario + timestamp)
    const token = Buffer.from(`${usuario}:${Date.now()}`).toString('base64');
    
    res.json({
      sucesso: true,
      mensagem: 'Login de Dev realizado com sucesso!',
      token: token
    });
  } else {
    res.status(401).json({
      sucesso: false,
      erro: 'Credenciais inválidas. Acesso negado.'
    });
  }
});

// ============================================
// MIDDLEWARE DE PROTEÇÃO (Verificar se é admin)
// ============================================
const verificarAdmin = (req, res, next) => {
  const token = req.headers['x-dev-token'] || req.headers['x-admin-token'];
  if (!token) {
    // Camuflar rota protegida
    return res.status(404).json({ erro: 'Recurso não encontrado' });
  }

  // Decodificar token e verificar usuario
  try {
    const decoded = Buffer.from(token, 'base64').toString('ascii');
    if (decoded.startsWith(ADMIN_USER)) {
      next(); // Pode passar
    } else {
      throw new Error('Usuário inválido');
    }
  } catch (e) {
    // Camuflar rota protegida
    res.status(404).json({ erro: 'Recurso não encontrado' });
  }
};

// ============================================
// DEV: USUÁRIOS E PEDIDOS (somente backend)
// ============================================

// GET /api/dev/usuarios
router.get('/usuarios', verificarAdmin, (req, res) => {
  const sql = `
    SELECT u.id, u.email, u.nome, u.is_verified, u.created_at, u.avatar_url,
           COUNT(p.id) as total_pedidos,
           COALESCE(SUM(p.valor_total), 0) as valor_total
    FROM usuarios u
    LEFT JOIN pedidos p ON p.usuario_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ usuarios: rows });
  });
});

// GET /api/dev/usuarios/:id
router.get('/usuarios/:id', verificarAdmin, (req, res) => {
  const { id } = req.params;
  const sqlUser = `SELECT id, email, nome, is_verified, created_at, avatar_url FROM usuarios WHERE id = ?`;
  const sqlOrders = `
    SELECT id, valor_total, status, stripe_payment_id, criado_em, atualizado_em
    FROM pedidos WHERE usuario_id = ? ORDER BY criado_em DESC
  `;
  db.get(sqlUser, [id], (err, user) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado' });
    db.all(sqlOrders, [id], (err2, pedidos) => {
      if (err2) return res.status(500).json({ erro: err2.message });
      res.json({ usuario: user, pedidos });
    });
  });
});

// POST /api/dev/usuarios/:id/password (resetar/definir nova senha)
router.post('/usuarios/:id/password', verificarAdmin, async (req, res) => {
  const { id } = req.params;
  const { nova_senha } = req.body;
  if (!nova_senha || nova_senha.length < 8) {
    return res.status(400).json({ erro: 'Senha inválida (mínimo 8 caracteres)' });
  }
  try {
    const hash = await bcrypt.hash(nova_senha, 10);
    db.run(`UPDATE usuarios SET senha = ? WHERE id = ?`, [hash, id], function(err) {
      if (err) return res.status(500).json({ erro: err.message });
      res.json({ sucesso: true, mensagem: 'Senha atualizada com sucesso' });
    });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// GET /api/dev/pedidos
router.get('/pedidos', verificarAdmin, (req, res) => {
  const sql = `
    SELECT p.id, p.usuario_id, u.email, u.nome, p.valor_total, p.status, p.criado_em
    FROM pedidos p INNER JOIN usuarios u ON u.id = p.usuario_id
    ORDER BY p.criado_em DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ pedidos: rows });
  });
});

// ============================================
// CMS DE PÁGINAS (Leitura pública / Escrita Dev)
// ============================================

// ============================================
// GERENCIAMENTO DE CONTEÚDO (CMS)
// ============================================

// GET /api/dev/paginas/:slug (Ler conteúdo)
router.get('/paginas/:slug', (req, res) => {
  const { slug } = req.params;
  db.get('SELECT conteudo FROM conteudo_paginas WHERE slug = ?', [slug], (err, row) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ conteudo: row ? row.conteudo : '' });
  });
});

// POST /api/dev/paginas (Atualizar conteúdo)
router.post('/paginas', verificarAdmin, (req, res) => {
  const { slug, conteudo } = req.body;
  
  // Upsert: Atualiza se existe, insere se não existe
  const sql = `
    INSERT INTO conteudo_paginas (slug, conteudo, atualizado_em)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(slug) DO UPDATE SET
    conteudo = excluded.conteudo,
    atualizado_em = CURRENT_TIMESTAMP
  `;
  
  db.run(sql, [slug, conteudo], function(err) {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ sucesso: true, mensagem: 'Página atualizada com sucesso!' });
  });
});

module.exports = router;
