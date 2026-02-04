#!/bin/bash

# ============================================
# INÍCIO RÁPIDO - GameStore v2.0
# ============================================
# Este script instala e inicia o servidor
# ============================================

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║        🎮 GAMESTORE - INÍCIO RÁPIDO           ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null
then
    echo "❌ Node.js não está instalado!"
    echo "📥 Baixe em: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js detectado: $(node --version)"
echo ""

# Verificar se npm está instalado
if ! command -v npm &> /dev/null
then
    echo "❌ npm não está instalado!"
    exit 1
fi

echo "✅ npm detectado: $(npm --version)"
echo ""

# Instalar dependências se não existirem
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    echo "✅ Dependências instaladas!"
else
    echo "✅ Dependências já instaladas"
fi

echo ""

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "📋 Criando a partir de .env.example..."
    cp .env.example .env
    echo "✅ Arquivo .env criado!"
    echo "📝 IMPORTANTE: Edite o arquivo .env com suas configurações!"
else
    echo "✅ Arquivo .env encontrado"
fi

echo ""

# Iniciar servidor
echo "🚀 Iniciando servidor..."
echo ""

npm start

# Se npm start falhar, mostrar erro
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Erro ao iniciar o servidor"
    echo "📚 Consulte o README.md para mais informações"
    exit 1
fi
