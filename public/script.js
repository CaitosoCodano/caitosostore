/*
  ARQUIVO: public/script.js
  DESCRIÇÃO: Comportamentos interativos do site
  JavaScript é como o cérebro - adiciona lógica e interatividade
*/

// LINHA 5: Função para comprar um jogo
function comprarJogo(nomeJogo) {
    /*
      'function' = define uma função (bloco de código reutilizável)
      'comprarJogo' = nome da função (escolhemos)
      '(nomeJogo)' = parâmetro (dado que a função recebe)
    */
    
    // LINHA 11: Exibe mensagem no console (F12 > Console)
    console.log(`Tentando comprar: ${nomeJogo}`);
    /*
      'console.log()' = exibe mensagem no console do navegador
      `${}` = template string (forma moderna de concatenar texto)
    */
    
    // LINHA 16: Mostra alerta para o usuário
    alert(`🎉 Parabéns! Você comprou: ${nomeJogo}`);
    /*
      'alert()' = mostra caixa de diálogo com mensagem
      Bom para testes, mas não use muito em sites reais
    */
    
    // LINHA 21: Atualiza o título da página (opcional, apenas demonstração)
    document.title = `Caitoso Store - Comprou ${nomeJogo}`;
    /*
      'document' = representa toda a página HTML
      '.title' = acessa o título da página (aba do navegador)
    */
}

// LINHA 27: Função para enviar formulário de contato
function enviarContato() {
    // LINHA 29: Pega os valores dos campos do formulário
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const mensagem = document.getElementById('mensagem').value;
    /*
      'const' = declara uma variável que não muda (constante)
      'document.getElementById()' = busca elemento pelo id
      '.value' = pega o valor digitado no campo
    */
    
    // LINHA 36: Validação simples (verifica se campos estão preenchidos)
    if (!nome || !email || !mensagem) {
        /*
          'if' = estrutura condicional (SE)
          '!' = operador NOT (negação)
          '||' = operador OR (OU)
        */
        
        alert('❌ Por favor, preencha todos os campos!');
        return; // Para a execução da função aqui
    }
    
    // LINHA 44: Valida formato do email (bem básico)
    if (!email.includes('@')) {
        /*
          '.includes()' = verifica se string contém determinado texto
          Retorna true (verdadeiro) ou false (falso)
        */
        
        alert('❌ Por favor, insira um email válido!');
        return;
    }
    
    // LINHA 52: Se passou nas validações, mostra sucesso
    alert(`✅ Obrigado, ${nome}!\nSua mensagem foi enviada com sucesso.`);
    /*
      '\n' = quebra de linha no texto
    */
    
    // LINHA 56: Limpa os campos do formulário
    document.getElementById('nome').value = '';
    document.getElementById('email').value = '';
    document.getElementById('mensagem').value = '';
    /*
      Atribui string vazia '' para limpar os campos
    */
    
    console.log('Formulário enviado:', { nome, email, mensagem });
    // Mostra objeto no console com os dados
}

// LINHA 65: Função para rolar suavemente até uma seção
function rolarParaSecao(idSecao) {
    /*
      Esta função não está sendo chamada no HTML atual
      Mas mostra como criar navegação suave
    */
    
    const elemento = document.getElementById(idSecao);
    // Busca o elemento pelo id
    
    if (elemento) {
        elemento.scrollIntoView({
            behavior: 'smooth', // Animação suave
            block: 'start'      // Alinha ao topo da tela
        });
    }
}

// LINHA 78: Evento que roda quando a página termina de carregar
document.addEventListener('DOMContentLoaded', function() {
    /*
      'addEventListener' = "ouve" eventos na página
      'DOMContentLoaded' = evento que dispara quando HTML está pronto
    */
    
    console.log('🎮 Caitoso Store carregada com sucesso!');
    console.log('📍 URL atual:', window.location.href);
    /*
      'window' = objeto global do navegador
      '.location.href' = URL completa da página
    */
    
    // LINHA 87: Adiciona evento de clique aos botões de compra (forma alternativa)
    const botoesCompra = document.querySelectorAll('.card-jogo .btn');
    /*
      'querySelectorAll' = busca todos elementos que combinam com o seletor CSS
      Retorna uma lista (NodeList) de elementos
    */
    
    botoesCompra.forEach(function(botao, index) {
        /*
          '.forEach' = executa função para cada item da lista
          Recebe função callback com (elemento, índice)
        */
        
        botao.addEventListener('mouseenter', function() {
            // Muda texto do botão quando mouse entra
            const textos = ['🛒 Adicionar ao Carrinho', '💰 Finalizar Compra', '🎁 Comprar com Desconto'];
            this.textContent = textos[index] || 'Comprar Agora';
            /*
              'this' = refere-se ao elemento atual (o botão)
              'textContent' = texto dentro do elemento
              '||' = operador OR - se textos[index] for undefined, usa alternativa
            */
        });
        
        botao.addEventListener('mouseleave', function() {
            // Volta texto original quando mouse sai
            this.textContent = 'Comprar Agora';
        });
    });
});

// LINHA 113: Objeto com dados da loja (exemplo de estrutura de dados)
const dadosLoja = {
    /*
      '{}' = define um objeto (coleção de propriedades)
      Objetos agrupam dados relacionados
    */
    
    nome: 'Caitoso Store',
    fundacao: 2024,
    plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
    /*
      '[]' = array (lista ordenada)
      Arrays são bons para listas de itens
    */
    
    endereco: {
        // Objeto dentro de objeto
        cidade: 'São Paulo',
        estado: 'SP',
        online: true
    },
    
    mostrarInfo: function() {
        // Método (função dentro de objeto)
        console.log(`Loja: ${this.nome}, Fundada em: ${this.fundacao}`);
        /*
          'this' = refere-se ao próprio objeto
        */
    }
};

// LINHA 135: Exemplo de uso do objeto
console.log('Dados da loja:', dadosLoja);
dadosLoja.mostrarInfo();
console.log('Primeira plataforma:', dadosLoja.plataformas[0]);
/*
  Acessa propriedades com ponto '.'
  Arrays usam colchetes com índice '[0]' (primeiro item é 0)
*/

// LINHA 142: Função para calcular preço com desconto
function calcularDesconto(precoOriginal, percentualDesconto) {
    const desconto = precoOriginal * (percentualDesconto / 100);
    const precoFinal = precoOriginal - desconto;
    
    return precoFinal; // Retorna o valor calculado
    /*
      'return' = devolve um valor da função
    */
}

// LINHA 150: Exemplo de uso da função de desconto
const precoComDesconto = calcularDesconto(249.90, 20);
console.log(`Preço com 20% off: R$ ${precoComDesconto.toFixed(2)}`);
/*
  '.toFixed(2)' = formata número com 2 casas decimais
*/

// LINHA 156: Array de jogos (exemplo de lista)
const jogosEmDestaque = [
    { nome: 'Cyberpunk 2077', preco: 149.90, categoria: 'RPG' },
    { nome: 'EA Sports FC 24', preco: 209.90, categoria: 'Esportes' },
    { nome: 'God of War: Ragnarok', preco: 249.90, categoria: 'Ação' }
];

// LINHA 163: Percorrer array com forEach
console.log('📋 Catálogo de Jogos:');
jogosEmDestaque.forEach(function(jogo, indice) {
    console.log(`${indice + 1}. ${jogo.nome} - R$ ${jogo.preco} (${jogo.categoria})`);
});

// FIM DO ARQUIVO JAVASCRIPT
