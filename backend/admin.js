/*
  ARQUIVO: backend/admin.js
  DESCRIÇÃO: Rotas e lógica do Painel Administrativo (Dev/Admin)
  
  Este arquivo gerencia:
  - Login do desenvolvedor
  - CRUD de Jogos (Adicionar, Editar, Remover)
  - Edição de conteúdo do site (Sobre, Contato, etc)
*/

const express = require('express');
const router = express.Router();
const { db } = require('../database');
const bcrypt = require('bcryptjs');

// ============================================
// CONFIGURAÇÕES DO ADMIN (Hardcoded conforme pedido)
// ============================================

// Usuário e senha definidos pelo dono do site
const ADMIN_USER = 'devloginvagnerodev';
const ADMIN_PASS = '147258@devloginsenhaforte';

// ============================================
// ROTAS DE AUTENTICAÇÃO
// ============================================

/*
  POST /api/admin/login
  Verifica credenciais do admin
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
      mensagem: 'Login de Admin realizado com sucesso!',
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
  const token = req.headers['x-admin-token'];
  
  if (!token) {
    return res.status(403).json({ erro: 'Acesso negado. Token não fornecido.' });
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
    res.status(403).json({ erro: 'Token inválido.' });
  }
};

// ============================================
// GERENCIAMENTO DE JOGOS
// ============================================

// POST /api/admin/jogos (Adicionar novo jogo)
router.post('/jogos', verificarAdmin, (req, res) => {
  const { nome, descricao, preco, imagem_url, genero, plataforma, classificacao } = req.body;
  
  const sql = `
    INSERT INTO jogos (nome, descricao, preco, imagem_url, genero, plataforma, classificacao)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(sql, [nome, descricao, preco, imagem_url, genero, plataforma, classificacao], function(err) {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    res.json({
      sucesso: true,
      mensagem: 'Jogo adicionado com sucesso!',
      id: this.lastID
    });
  });
});

// DELETE /api/admin/jogos/:id (Remover jogo)
router.delete('/jogos/:id', verificarAdmin, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM jogos WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ sucesso: true, mensagem: 'Jogo removido com sucesso' });
  });
});

// ============================================
// GERENCIAMENTO DE CONTEÚDO (CMS)
// ============================================

// GET /api/admin/paginas/:slug (Ler conteúdo)
router.get('/paginas/:slug', (req, res) => {
  const { slug } = req.params;
  db.get('SELECT conteudo FROM conteudo_paginas WHERE slug = ?', [slug], (err, row) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ conteudo: row ? row.conteudo : '' });
  });
});

// POST /api/admin/paginas (Atualizar conteúdo)
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
