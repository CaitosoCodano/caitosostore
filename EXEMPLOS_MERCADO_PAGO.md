# 💻 Exemplos de Uso - Mercado Pago PIX

## 📚 Índice

1. [JavaScript/Frontend](#javascriptfrontend)
2. [cURL / Terminal](#curl--terminal)
3. [PowerShell](#powershell)
4. [Python](#python)
5. [Node.js](#nodejs)

---

## JavaScript/Frontend

### Exemplo 1: Criar Pagamento e Exibir QR Code

```javascript
// Função para criar pagamento PIX
async function criarPagamentoPix(valor, descricao) {
  try {
    const response = await fetch('/api/pagamento/pix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valor: valor,
        descricao: descricao,
        usuarioId: 1  // Substitua com ID do usuário real
      })
    });

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.erro || 'Erro ao criar pagamento');
    }

    const dados = await response.json();
    
    // Exibir QR Code na página
    exibirQRCode(dados.qrCode, dados.pixPaymentId);
    
    // Guardar ID para verificação depois
    localStorage.setItem('pixPaymentId', dados.pixPaymentId);
    localStorage.setItem('valor', dados.valor);
    
    console.log('✅ Pagamento criado:', dados.pixPaymentId);
    return dados;

  } catch (erro) {
    console.error('❌ Erro:', erro.message);
    alert('Erro ao criar pagamento: ' + erro.message);
    throw erro;
  }
}

// Função para exibir QR Code
function exibirQRCode(qrCodeBase64, pixPaymentId) {
  // Encontrar elemento HTML
  const container = document.getElementById('qr-code-container');
  
  if (container) {
    container.innerHTML = `
      <div class="qr-code-wrapper">
        <h2>Escaneie o QR Code</h2>
        <img src="${qrCodeBase64}" alt="QR Code PIX" class="qr-code-image">
        <p>ID do Pagamento: ${pixPaymentId}</p>
        <p>Escaneie com seu app bancário para completar a transferência</p>
        <button onclick="verificarPagamento()">Verificar Pagamento</button>
      </div>
    `;
  }
}
```

### Exemplo 2: Verificar Status do Pagamento

```javascript
// Função para verificar status
async function verificarPagamento() {
  const pixPaymentId = localStorage.getItem('pixPaymentId');
  
  if (!pixPaymentId) {
    alert('Nenhum pagamento em andamento');
    return;
  }

  try {
    const response = await fetch(`/api/pagamento/pix/${pixPaymentId}`);
    
    if (!response.ok) {
      throw new Error('Erro ao verificar status');
    }

    const dados = await response.json();

    console.log('📊 Status:', dados);

    if (dados.pago) {
      // Pagamento confirmado
      document.getElementById('qr-code-container').innerHTML = `
        <div class="success-message">
          <h2>✅ Pagamento Confirmado!</h2>
          <p>${dados.mensagem}</p>
          <p>Valor: R$ ${dados.valor.toFixed(2)}</p>
          <button onclick="location.href='/compras.html'">Ver Meus Pedidos</button>
        </div>
      `;
    } else {
      // Ainda aguardando
      document.getElementById('qr-code-container').innerHTML = `
        <div class="pending-message">
          <p>⏳ ${dados.mensagem}</p>
          <button onclick="verificarPagamento()">Tentar Novamente</button>
        </div>
      `;
    }

  } catch (erro) {
    console.error('❌ Erro:', erro);
    alert('Erro ao verificar: ' + erro.message);
  }
}

// Verificar status automaticamente a cada 5 segundos
setInterval(() => {
  const pixPaymentId = localStorage.getItem('pixPaymentId');
  if (pixPaymentId) {
    verificarPagamento();
  }
}, 5000);
```

### Exemplo 3: Integração Completa no HTML

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Checkout PIX</title>
  <style>
    .qr-code-wrapper {
      text-align: center;
      padding: 40px;
      border: 2px solid #4CAF50;
      border-radius: 10px;
      max-width: 400px;
      margin: 20px auto;
    }

    .qr-code-image {
      width: 300px;
      height: 300px;
      border: 5px solid #ddd;
      padding: 10px;
      background: white;
    }

    button {
      background: #4CAF50;
      color: white;
      padding: 12px 30px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 20px;
    }

    button:hover {
      background: #45a049;
    }

    .success-message {
      background: #d4edda;
      color: #155724;
      padding: 20px;
      border-radius: 5px;
      border: 1px solid #c3e6cb;
    }

    .pending-message {
      background: #fff3cd;
      color: #856404;
      padding: 20px;
      border-radius: 5px;
      border: 1px solid #ffeaa7;
    }
  </style>
</head>
<body>
  <h1>Checkout PIX - GameStore</h1>
  
  <div id="qr-code-container">
    <p>Carregando...</p>
  </div>

  <script>
    // Criar pagamento ao carregar página
    window.addEventListener('load', async () => {
      await criarPagamentoPix(99.90, 'Compra de 2 jogos');
    });

    // ... Cole as funções acima aqui ...
  </script>
</body>
</html>
```

---

## cURL / Terminal

### Criar Pagamento

```bash
curl -X POST http://localhost:3000/api/pagamento/pix \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 49.90,
    "descricao": "Compra de 1 jogo",
    "usuarioId": 1
  }'
```

**Resposta:**
```json
{
  "sucesso": true,
  "pixPaymentId": "PRE-1234567890",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "valor": 49.90,
  "instrucoes": {
    "metodo": "PIX",
    "passo1": "Escaneie o QR Code com seu app bancário",
    "passo2": "Confirme a transferência",
    "passo3": "Seu pagamento será confirmado em até 5 minutos"
  }
}
```

### Verificar Status

```bash
curl http://localhost:3000/api/pagamento/pix/PRE-1234567890
```

**Resposta:**
```json
{
  "pixPaymentId": "PRE-1234567890",
  "status": "pendente",
  "statusFormatado": "⏳ Aguardando pagamento",
  "valor": 49.90,
  "pago": false,
  "mensagem": "⏳ Pagamento ainda não foi recebido. Escaneie o QR Code e complete a transferência."
}
```

### Simular Pagamento (Teste)

```bash
curl -X POST http://localhost:3000/api/pagamento/pix/simular/PRE-1234567890
```

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "✅ Pagamento simulado com sucesso",
  "pixPaymentId": "PRE-1234567890",
  "status": "confirmado"
}
```

---

## PowerShell

### Criar Pagamento

```powershell
$body = @{
    valor = 149.90
    descricao = "Compra de 3 jogos"
    usuarioId = 1
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/pagamento/pix" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$resultado = $response.Content | ConvertFrom-Json
$resultado | Format-Table

# Salvar ID para usar depois
$pixPaymentId = $resultado.pixPaymentId
Write-Host "Pagamento criado: $pixPaymentId"
```

### Verificar Status

```powershell
$pixPaymentId = "PRE-1234567890"

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/pagamento/pix/$pixPaymentId"
$status = $response.Content | ConvertFrom-Json

if ($status.pago) {
    Write-Host "✅ Pagamento confirmado!" -ForegroundColor Green
} else {
    Write-Host "⏳ Aguardando pagamento..." -ForegroundColor Yellow
}

$status | Format-Table
```

### Script Completo

```powershell
# 1. Criar pagamento
Write-Host "💳 Criando pagamento..." -ForegroundColor Cyan
$body = @{
    valor = 99.90
    descricao = "Teste PIX"
    usuarioId = 1
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/pagamento/pix" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$pagamento = $response.Content | ConvertFrom-Json
$pixPaymentId = $pagamento.pixPaymentId

Write-Host "✅ Pagamento criado: $pixPaymentId" -ForegroundColor Green
Write-Host "Valor: R$ $($pagamento.valor)"

# 2. Simular pagamento
Write-Host "`n🎯 Simulando pagamento..." -ForegroundColor Cyan
$simulacao = Invoke-WebRequest -Uri "http://localhost:3000/api/pagamento/pix/simular/$pixPaymentId" `
  -Method POST

$resultado_sim = $simulacao.Content | ConvertFrom-Json
Write-Host "✅ Simulado: $($resultado_sim.mensagem)" -ForegroundColor Green

# 3. Verificar status
Write-Host "`n📊 Verificando status..." -ForegroundColor Cyan
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/pagamento/pix/$pixPaymentId"
$status = $response.Content | ConvertFrom-Json

Write-Host "Status: $($status.statusFormatado)"
Write-Host "Pago: $($status.pago)"
Write-Host "`n✨ Fluxo de teste concluído!" -ForegroundColor Green
```

---

## Python

### Requisições Básicas

```python
import requests
import json
from datetime import datetime

# URL base do servidor
BASE_URL = "http://localhost:3000"

def criar_pagamento(valor, descricao, usuario_id=1):
    """Criar pagamento PIX"""
    url = f"{BASE_URL}/api/pagamento/pix"
    
    payload = {
        "valor": valor,
        "descricao": descricao,
        "usuarioId": usuario_id
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        dados = response.json()
        print("✅ Pagamento criado:")
        print(f"  ID: {dados['pixPaymentId']}")
        print(f"  Valor: R$ {dados['valor']}")
        
        return dados
    
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro: {e}")
        return None

def verificar_status(pix_payment_id):
    """Verificar status do pagamento"""
    url = f"{BASE_URL}/api/pagamento/pix/{pix_payment_id}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        dados = response.json()
        
        if dados['pago']:
            print(f"✅ {dados['mensagem']}")
        else:
            print(f"⏳ {dados['mensagem']}")
        
        return dados
    
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro: {e}")
        return None

def simular_pagamento(pix_payment_id):
    """Simular pagamento confirmado (teste)"""
    url = f"{BASE_URL}/api/pagamento/pix/simular/{pix_payment_id}"
    
    try:
        response = requests.post(url)
        response.raise_for_status()
        
        dados = response.json()
        print(f"✅ {dados['mensagem']}")
        
        return dados
    
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro: {e}")
        return None

# Uso
if __name__ == "__main__":
    print("=" * 50)
    print("Teste Mercado Pago PIX")
    print("=" * 50)
    
    # 1. Criar pagamento
    print("\n1️⃣ Criando pagamento...")
    pagamento = criar_pagamento(99.90, "Teste Python")
    
    if pagamento:
        pix_id = pagamento['pixPaymentId']
        
        # 2. Simular pagamento
        print("\n2️⃣ Simulando pagamento confirmado...")
        simular_pagamento(pix_id)
        
        # 3. Verificar status
        print("\n3️⃣ Verificando status...")
        status = verificar_status(pix_id)
        
        print("\n" + "=" * 50)
        print("✨ Teste concluído com sucesso!")
        print("=" * 50)
```

### Com Salvamento em Arquivo

```python
import requests
import json
from datetime import datetime

class MercadoPagoClient:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.historico = []
    
    def criar_pagamento(self, valor, descricao, usuario_id=1):
        """Criar novo pagamento"""
        url = f"{self.base_url}/api/pagamento/pix"
        payload = {
            "valor": valor,
            "descricao": descricao,
            "usuarioId": usuario_id
        }
        
        response = requests.post(url, json=payload)
        dados = response.json()
        
        # Salvar no histórico
        self.historico.append({
            "timestamp": datetime.now().isoformat(),
            "acao": "criacao",
            "dados": dados
        })
        
        return dados
    
    def verificar_status(self, pix_id):
        """Verificar status"""
        url = f"{self.base_url}/api/pagamento/pix/{pix_id}"
        response = requests.get(url)
        return response.json()
    
    def salvar_historico(self, arquivo="pagamentos.json"):
        """Salvar histórico em arquivo"""
        with open(arquivo, 'w', encoding='utf-8') as f:
            json.dump(self.historico, f, ensure_ascii=False, indent=2)
        print(f"✅ Histórico salvo em {arquivo}")

# Uso
client = MercadoPagoClient()
pag = client.criar_pagamento(50.00, "Teste")
print(f"ID: {pag['pixPaymentId']}")
client.salvar_historico()
```

---

## Node.js

### Com Axios

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Criar pagamento
async function criarPagamento(valor, descricao, usuarioId = 1) {
  try {
    const response = await axios.post(`${BASE_URL}/api/pagamento/pix`, {
      valor,
      descricao,
      usuarioId
    });

    console.log('✅ Pagamento criado:', response.data.pixPaymentId);
    return response.data;
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Verificar status
async function verificarStatus(pixPaymentId) {
  try {
    const response = await axios.get(`${BASE_URL}/api/pagamento/pix/${pixPaymentId}`);
    
    console.log(`Status: ${response.data.statusFormatado}`);
    console.log(`Pago: ${response.data.pago}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

// Simular pagamento
async function simularPagamento(pixPaymentId) {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/pagamento/pix/simular/${pixPaymentId}`
    );

    console.log('✅', response.data.mensagem);
    return response.data;
  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

// Teste completo
async function testeCompleto() {
  try {
    console.log('💳 Teste Mercado Pago PIX\n');

    // 1. Criar
    console.log('1️⃣ Criando pagamento...');
    const pag = await criarPagamento(149.90, 'Teste Node.js');
    const pixId = pag.pixPaymentId;

    // 2. Simular
    console.log('\n2️⃣ Simulando pagamento...');
    await simularPagamento(pixId);

    // 3. Verificar
    console.log('\n3️⃣ Verificando status...');
    await verificarStatus(pixId);

    console.log('\n✨ Teste concluído!');
  } catch (error) {
    console.error('Erro no teste:', error.message);
  }
}

// Executar
testeCompleto();
```

---

## 🎯 Quick Start

### Testar em 30 segundos

**JavaScript (navegador):**
```javascript
// Cole no console do navegador
fetch('/api/pagamento/pix', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ valor: 50, descricao: 'Teste', usuarioId: 1 })
}).then(r => r.json()).then(d => console.log(d));
```

**PowerShell:**
```powershell
$r = Invoke-WebRequest "http://localhost:3000/api/pagamento/pix" -Method POST `
  -ContentType "application/json" `
  -Body (@{valor=50; descricao="Teste"; usuarioId=1} | ConvertTo-Json)
$r.Content | ConvertFrom-Json
```

**Python:**
```python
import requests
r = requests.post('http://localhost:3000/api/pagamento/pix',
  json={'valor': 50, 'descricao': 'Teste', 'usuarioId': 1})
print(r.json())
```

---

## 📝 Salvar QR Code como Imagem

### JavaScript

```javascript
// Converter base64 para imagem
function salvarQRCode(base64, nome = 'qr-code.png') {
  const link = document.createElement('a');
  link.href = base64;
  link.download = nome;
  link.click();
}

// Usar:
const pagamento = await criarPagamentoPix(99.90, 'Compra');
salvarQRCode(pagamento.qrCode);
```

### Python

```python
import base64

def salvar_qr_code(base64_data, arquivo='qr_code.png'):
    """Salvar QR Code base64 como imagem"""
    # Remover prefixo data:image/png;base64,
    dados = base64_data.split(',')[1]
    
    # Converter para bytes
    imagem = base64.b64decode(dados)
    
    # Salvar arquivo
    with open(arquivo, 'wb') as f:
        f.write(imagem)
    
    print(f"✅ QR Code salvo em {arquivo}")

# Usar:
pag = criar_pagamento(99.90, 'Teste')
salvar_qr_code(pag['qrCode'])
```

---

## ✅ Verificação Rápida

Tudo funcionando?

```bash
# Testar conectividade
curl http://localhost:3000/api/pagamento/pix -X POST \
  -H "Content-Type: application/json" \
  -d '{"valor":10,"descricao":"teste","usuarioId":1}'

# Se receber JSON com "sucesso": true → ✅ Funcionando
# Se receber erro 403 → Configure token Mercado Pago
# Se receber erro 500 → Reinicie npm start
```

