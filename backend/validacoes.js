/*
  ARQUIVO: backend/validacoes.js
  DESCRIÇÃO: Funções para validar dados do usuário
  
  Sempre validar NO SERVIDOR, não confiar apenas no frontend!
  O usuário pode burlar validações do navegador.
*/

const validator = require('validator');

/*
  ============================================
  VALIDAR EMAIL
  ============================================
  
  Aqui verificamos se o email é válido e do domínio permitido.
  Aceitamos apenas domínios reais: gmail.com, hotmail.com, outlook.com, etc
*/
function validarEmail(email) {
  // Domínios permitidos (adicione mais se necessário)
  const dominiosPermitidos = [
    'gmail.com',
    'hotmail.com',
    'outlook.com',
    'yahoo.com',
    'mail.com',
    'protonmail.com',
    'uol.com.br',
    'bol.com.br',
    'ig.com.br'
  ];

  // Verificar se está vazio
  if (!email || email.trim() === '') {
    return {
      valido: false,
      erro: 'Email é obrigatório'
    };
  }

  // Verificar se tem formato válido de email
  if (!validator.isEmail(email)) {
    return {
      valido: false,
      erro: 'Email inválido. Use formato: seu@email.com'
    };
  }

  // Extrair domínio do email (tudo depois do @)
  const dominio = email.split('@')[1].toLowerCase();

  // Verificar se domínio está na lista permitida
  if (!dominiosPermitidos.includes(dominio)) {
    return {
      valido: false,
      erro: `Email deve ser de um dos domínios permitidos: ${dominiosPermitidos.join(', ')}`
    };
  }

  return {
    valido: true,
    email: email.toLowerCase()
  };
}

/*
  ============================================
  VALIDAR SENHA
  ============================================
  
  Senha forte = segura contra ataques de força bruta
  
  Requisitos:
  - Mínimo 8 caracteres
  - Máximo 100 caracteres
  - Pelo menos 1 letra maiúscula
  - Pelo menos 1 letra minúscula
  - Pelo menos 1 número
  - Pelo menos 1 caractere especial (!@#$%^&*)
*/
function validarSenha(senha) {
  // Verificar se está vazio
  if (!senha) {
    return {
      valida: false,
      erro: 'Senha é obrigatória'
    };
  }

  // Verificar comprimento mínimo
  if (senha.length < 8) {
    return {
      valida: false,
      erro: 'Senha deve ter pelo menos 8 caracteres'
    };
  }

  // Verificar comprimento máximo (evitar senhas absurdas)
  if (senha.length > 100) {
    return {
      valida: false,
      erro: 'Senha não pode ter mais de 100 caracteres'
    };
  }

  // Verificar se tem letra maiúscula
  if (!/[A-Z]/.test(senha)) {
    return {
      valida: false,
      erro: 'Senha deve conter pelo menos 1 letra maiúscula (A-Z)'
    };
  }

  // Verificar se tem letra minúscula
  if (!/[a-z]/.test(senha)) {
    return {
      valida: false,
      erro: 'Senha deve conter pelo menos 1 letra minúscula (a-z)'
    };
  }

  // Verificar se tem número
  if (!/[0-9]/.test(senha)) {
    return {
      valida: false,
      erro: 'Senha deve conter pelo menos 1 número (0-9)'
    };
  }

  // Verificar se tem caractere especial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha)) {
    return {
      valida: false,
      erro: 'Senha deve conter pelo menos 1 caractere especial (!@#$%^&*)'
    };
  }

  return {
    valida: true
  };
}

/*
  ============================================
  VALIDAR NOME
  ============================================
  
  Nome do usuário deve ser válido.
  Não aceitamos nomes estranhos ou muito curtos.
*/
function validarNome(nome) {
  // Verificar se está vazio
  if (!nome || nome.trim() === '') {
    return {
      valido: false,
      erro: 'Nome é obrigatório'
    };
  }

  // Remover espaços em branco
  const nomeLimpo = nome.trim();

  // Verificar comprimento mínimo
  if (nomeLimpo.length < 3) {
    return {
      valido: false,
      erro: 'Nome deve ter pelo menos 3 caracteres'
    };
  }

  // Verificar comprimento máximo
  if (nomeLimpo.length > 100) {
    return {
      valido: false,
      erro: 'Nome não pode ter mais de 100 caracteres'
    };
  }

  // Verificar se tem apenas letras, espaços e apóstrofos
  if (!/^[a-zA-ZÀ-ÿ\s']+$/.test(nomeLimpo)) {
    return {
      valido: false,
      erro: 'Nome pode conter apenas letras e espaços'
    };
  }

  return {
    valido: true,
    nome: nomeLimpo
  };
}

/*
  ============================================
  VALIDAR DADOS DE CARTÃO (Simulado)
  ============================================
  
  Em um site real, NUNCA processamos cartão.
  O Stripe faz isso de forma segura.
  Aqui apenas fazemos validação básica.
*/
function validarCartao(numero, mes, ano, cvv) {
  // Remover espaços
  numero = numero.replace(/\s/g, '');

  // Verificar se tem 16 dígitos
  if (numero.length !== 16 || !/^\d+$/.test(numero)) {
    return {
      valido: false,
      erro: 'Número de cartão inválido'
    };
  }

  // Verificar mês (01-12)
  const mesNum = parseInt(mes);
  if (mesNum < 1 || mesNum > 12) {
    return {
      valido: false,
      erro: 'Mês inválido'
    };
  }

  // Verificar ano (deve ser futuro)
  const anoAtual = new Date().getFullYear();
  const anoNum = parseInt(ano);
  if (anoNum < anoAtual || anoNum > anoAtual + 20) {
    return {
      valido: false,
      erro: 'Ano de expiração inválido'
    };
  }

  // Verificar CVV (3 ou 4 dígitos)
  if (!/^\d{3,4}$/.test(cvv)) {
    return {
      valido: false,
      erro: 'CVV inválido'
    };
  }

  return {
    valido: true
  };
}

/*
  ============================================
  VALIDAR QUANTIDADE
  ============================================
  
  Para adicionar itens ao carrinho
*/
function validarQuantidade(quantidade) {
  const qtd = parseInt(quantidade);

  // Verificar se é número válido
  if (isNaN(qtd) || qtd < 1) {
    return {
      valida: false,
      erro: 'Quantidade deve ser no mínimo 1'
    };
  }

  // Verificar limite máximo (evitar abuso)
  if (qtd > 99) {
    return {
      valida: false,
      erro: 'Quantidade máxima é 99'
    };
  }

  return {
    valida: true,
    quantidade: qtd
  };
}

/*
  ============================================
  VALIDAR MENSAGEM DE CONTATO
  ============================================
*/
function validarMensagem(mensagem) {
  if (!mensagem || mensagem.trim() === '') {
    return {
      valida: false,
      erro: 'Mensagem é obrigatória'
    };
  }

  const msg = mensagem.trim();

  if (msg.length < 10) {
    return {
      valida: false,
      erro: 'Mensagem deve ter pelo menos 10 caracteres'
    };
  }

  if (msg.length > 1000) {
    return {
      valida: false,
      erro: 'Mensagem não pode ter mais de 1000 caracteres'
    };
  }

  return {
    valida: true,
    mensagem: msg
  };
}

/*
  ============================================
  EXPORTAR TODAS AS FUNÇÕES
  ============================================
*/
module.exports = {
  validarEmail,
  validarSenha,
  validarNome,
  validarCartao,
  validarQuantidade,
  validarMensagem
};
