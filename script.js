// ============================================
// SISTEMA COMPLETO DA LOJA DE JOGOS
// ============================================

// Estado da aplicação
let cart = [];
let wishlist = [];
let isLoggedIn = false;
let currentUser = null;

// ============================================
// SISTEMA DE CARRINHO
// ============================================

function addToCart(gameName, price) {
    const existingItem = cart.find(item => item.name === gameName);
    
    if (existingItem) {
        existingItem.quantity++;
        showNotification(`Mais uma unidade de "${gameName}" adicionada ao carrinho!`);
    } else {
        cart.push({
            name: gameName,
            price: price,
            quantity: 1
        });
        showNotification(`"${gameName}" adicionado ao carrinho!`);
    }
    
    updateCartCount();
}

function removeFromCart(gameName) {
    cart = cart.filter(item => item.name !== gameName);
    updateCartCount();
    updateCartModal();
    showNotification(`"${gameName}" removido do carrinho!`);
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
}

function openCart() {
    document.getElementById('cartModal').style.display = 'block';
    updateCartModal();
}

function closeCart() {
    document.getElementById('cartModal').style.display = 'none';
}

function updateCartModal() {
    const cartItemsDiv = document.getElementById('cartItems');
    const cartTotalDiv = document.getElementById('cartTotal');
    const totalValueSpan = document.getElementById('totalValue');
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p style="text-align: center; color: #b0b0c0;">Seu carrinho está vazio</p>';
        cartTotalDiv.innerHTML = '';
        totalValueSpan.textContent = '0';
        return;
    }
    
    let total = 0;
    let itemsHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        itemsHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>R$ ${item.price.toFixed(2)} × ${item.quantity}</p>
                </div>
                <div class="cart-item-actions">
                    <span style="color: #6a11cb; font-weight: bold;">R$ ${itemTotal.toFixed(2)}</span>
                    <button onclick="removeFromCart('${item.name}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    cartItemsDiv.innerHTML = itemsHTML;
    cartTotalDiv.innerHTML = `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
    totalValueSpan.textContent = total.toFixed(2);
}

// ============================================
// SISTEMA DE WISHLIST
// ============================================

function addToWishlist(gameName) {
    if (wishlist.includes(gameName)) {
        wishlist = wishlist.filter(name => name !== gameName);
        showNotification(`"${gameName}" removido da lista de desejos!`);
    } else {
        wishlist.push(gameName);
        showNotification(`"${gameName}" adicionado à lista de desejos!`);
    }
    
    updateWishlistCount();
}

function showWishlist() {
    if (wishlist.length === 0) {
        showNotification('Sua lista de desejos está vazia!');
    } else {
        const gamesList = wishlist.join('\n• ');
        alert(`📋 SUA LISTA DE DESEJOS:\n\n• ${gamesList}\n\nTotal: ${wishlist.length} jogo(s)`);
    }
}

function updateWishlistCount() {
    document.getElementById('wishlistCount').textContent = wishlist.length;
}

// ============================================
// SISTEMA DE LOGIN/CADASTRO
// ============================================

function openLogin() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLogin() {
    document.getElementById('loginModal').style.display = 'none';
}

function showRegister() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('registerModal').style.display = 'block';
}

function closeRegister() {
    document.getElementById('registerModal').style.display = 'none';
}

function doLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Por favor, preencha todos os campos!');
        return;
    }
    
    // Simulação de login
    isLoggedIn = true;
    currentUser = email;
    
    showNotification(`Bem-vindo de volta, ${email.split('@')[0]}!`);
    closeLogin();
    
    // Atualiza ícone de usuário
    document.querySelector('.user-icon i').className = 'fas fa-user-check';
}

function doRegister() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    if (!name || !email || !password) {
        showNotification('Por favor, preencha todos os campos!');
        return;
    }
    
    if (password.length < 6) {
        showNotification('A senha deve ter pelo menos 6 caracteres!');
        return;
    }
    
    // Simulação de cadastro
    isLoggedIn = true;
    currentUser = email;
    
    showNotification(`Conta criada com sucesso! Bem-vindo(a), ${name}!`);
    closeRegister();
    
    // Atualiza ícone de usuário
    document.querySelector('.user-icon i').className = 'fas fa-user-check';
}

// ============================================
// SISTEMA DE COMPRA/CHECKOUT
// ============================================

function checkout() {
    if (cart.length === 0) {
        showNotification('Seu carrinho está vazio!');
        return;
    }
    
    if (!isLoggedIn) {
        showNotification('Por favor, faça login para finalizar a compra!');
        openLogin();
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Simulação de pagamento
    const paymentMethod = prompt(`💳 FINALIZAR COMPRA\n\nTotal: R$ ${total.toFixed(2)}\n\nEscolha a forma de pagamento:\n1. Cartão de Crédito\n2. PIX\n3. Boleto\n\nDigite o número:`);
    
    if (!paymentMethod) return;
    
    let methodName = '';
    switch(paymentMethod) {
        case '1': methodName = 'Cartão de Crédito'; break;
        case '2': methodName = 'PIX'; break;
        case '3': methodName = 'Boleto'; break;
        default: methodName = 'Pagamento';
    }
    
    // Simulação de processamento
    showNotification(`Processando pagamento via ${methodName}...`);
    
    setTimeout(() => {
        cart = [];
        updateCartCount();
        closeCart();
        
        // Gerar número de pedido
        const orderNumber = Math.floor(Math.random() * 1000000);
        
        alert(`✅ COMPRA FINALIZADA COM SUCESSO!\n\n📦 Número do pedido: #${orderNumber}\n💰 Valor total: R$ ${total.toFixed(2)}\n📧 Enviamos os detalhes para: ${currentUser}\n\nObrigado por comprar na GameStore!`);
        
        showNotification('Compra realizada com sucesso! Obrigado!');
    }, 2000);
}

// ============================================
// FUNÇÕES DOS BOTÕES
// ============================================

function scrollToGames() {
    document.querySelector('#jogos').scrollIntoView({ behavior: 'smooth' });
}

function showDailyOffer() {
    const offers = [
        "Pacote GTA V + Red Dead 2 por R$ 199,90!",
        "Assinatura Xbox Game Pass - 30% OFF",
        "Promoção: Leve 2, pague 1 em jogos indie!",
        "Cupom: GAMER10 - 10% OFF em toda loja!"
    ];
    
    const randomOffer = offers[Math.floor(Math.random() * offers.length)];
    alert(`🎁 OFERTA DO DIA 🎁\n\n${randomOffer}\n\nAproveite agora!`);
}

function searchGames() {
    const query = document.getElementById('searchInput').value.trim();
    
    if (!query) {
        showNotification('Digite algo para buscar!');
        return;
    }
    
    showNotification(`Buscando por: "${query}"...`);
    
    // Simulação de busca
    setTimeout(() => {
        alert(`🔍 RESULTADOS DA BUSCA: "${query}"\n\nEncontramos 3 jogos relacionados:\n\n1. Cyberpunk 2077\n2. EA Sports FC 24\n3. Call of Duty: Modern Warfare\n\nClique em "Comprar" para adicionar ao carrinho!`);
    }, 1000);
}

function filterByCategory(category) {
    showNotification(`Filtrando jogos da categoria: ${category}`);
    
    // Simulação de filtro
    setTimeout(() => {
        alert(`🎮 JOGOS DE ${category.toUpperCase()}:\n\n${getGamesByCategory(category)}\n\nClique em "Comprar" para adicionar ao carrinho!`);
    }, 500);
}

function getGamesByCategory(category) {
    const games = {
        'Ação': '• Cyberpunk 2077\n• God of War\n• Call of Duty',
        'Aventura': '• The Legend of Zelda\n• Uncharted\n• Tomb Raider',
        'RPG': '• Final Fantasy\n• The Witcher 3\n• Skyrim',
        'Esportes': '• EA Sports FC 24\n• NBA 2K24\n• F1 2023',
        'Estratégia': '• Age of Empires\n• Civilization VI\n• XCOM 2',
        'Terror': '• Resident Evil 4\n• Silent Hill\n• Outlast'
    };
    
    return games[category] || '• Nenhum jogo encontrado nesta categoria.';
}

function showBirthdayOffers() {
    alert('🎂 PROMOÇÃO DE ANIVERSÁRIO 🎂\n\n- 50% OFF em jogos selecionados\n- Cupom: FELIZANIVERSARIO\n- Válido por 7 dias\n\nAproveite as ofertas especiais!');
}

function createBundle() {
    alert('🎮 MONTAR PACOTE GAMER 🎮\n\nEscolha 3 jogos da lista:\n\n1. The Witcher 3\n2. Red Dead Redemption 2\n3. GTA V\n4. Cyberpunk 2077\n5. God of War\n\nPreço do pacote: R$ 299,90\n\nClique nos jogos que deseja!');
}

function loadMoreGames() {
    showNotification('Carregando mais jogos...');
    
    // Simulação de carregamento
    setTimeout(() => {
        alert('➕ MAIS JOGOS CARREGADOS!\n\n• Call of Duty: Modern Warfare III\n• Spider-Man 2\n• Starfield\n• Forza Motorsport\n\nRole para ver os novos jogos!');
    }, 1500);
}

// ============================================
// FUNÇÕES SOCIAIS
// ============================================

function shareOnFacebook() {
    showNotification('Compartilhando GameStore no Facebook...');
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href), '_blank');
}

function shareOnTwitter() {
    showNotification('Compartilhando GameStore no Twitter...');
    window.open('https://twitter.com/intent/tweet?text=Conheça a GameStore - A melhor loja de jogos!&url=' + encodeURIComponent(window.location.href), '_blank');
}

function shareOnInstagram() {
    showNotification('Siga-nos no Instagram: @GameStoreOficial');
}

function joinDiscord() {
    showNotification('Junte-se ao nosso Discord! Link copiado para a área de transferência.');
    
    // Copiar link fictício
    navigator.clipboard.writeText('https://discord.gg/gamestore').then(() => {
        alert('🔗 LINK DO DISCORD COPIADO!\n\nCole no seu navegador para entrar na nossa comunidade!');
    });
}

// ============================================
// FUNÇÕES DE CONTATO/SUPORTE
// ============================================

function callPhone() {
    if (confirm('📞 LIGAR PARA A GAMESTORE?\n\n(11) 99999-9999\n\nDeseja realizar a ligação?')) {
        showNotification('Iniciando chamada... (simulação)');
    }
}

function sendEmail() {
    window.location.href = 'mailto:contato@gamestore.com.br?subject=Contato GameStore&body=Olá, gostaria de mais informações sobre...';
}

function openSupport() {
    alert('🛟 SUPORTE GAMESTORE\n\n• Email: suporte@gamestore.com.br\n• WhatsApp: (11) 99999-9999\n• Horário: 24/7\n\nComo podemos ajudar?');
}

function openTerms() {
    alert('📜 TERMOS DE USO\n\n1. Todos os jogos são digitais\n2. Não aceitamos devoluções de jogos ativados\n3. Os preços podem mudar sem aviso prévio\n4. O estoque é limitado\n\nLeia os termos completos em nosso site.');
}

function openPrivacy() {
    alert('🔒 POLÍTICA DE PRIVACIDADE\n\n• Seus dados estão seguros conosco\n• Não compartilhamos informações com terceiros\n• Usamos criptografia SSL\n• Você pode excluir sua conta a qualquer momento');
}

// ============================================
// FUNÇÕES GERAIS
// ============================================

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showAllOffers() {
    alert('🏷️ TODAS AS OFERTAS\n\n1. Jogos com até 70% OFF\n2. Pacotes especiais\n3. Cupons exclusivos\n4. Promoções relâmpago\n\nConfira todas na seção "Ofertas"!');
}

function subscribeNewsletter() {
    const email = document.getElementById('newsletterEmail').value;
    
    if (!email || !email.includes('@')) {
        showNotification('Digite um email válido!');
        return;
    }
    
    showNotification(`Inscrito na newsletter com: ${email}`);
    document.getElementById('newsletterEmail').value = '';
    
    setTimeout(() => {
        alert('📧 INSCRIÇÃO CONFIRMADA!\n\nVocê receberá nossas ofertas exclusivas em breve!\n\nObrigado por se inscrever!');
    }, 1000);
}

// ============================================
// NOTIFICAÇÕES
// ============================================

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 GameStore - Sistema carregado!');
    
    // Fechar modais clicando fora
    window.onclick = function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });
    };
    
    // Contador de ofertas
    setInterval(updateOfferTimer, 1000);
});

function updateOfferTimer() {
    // Simulação de contador regressivo
    const days = document.getElementById('days');
    const hours = document.getElementById('hours');
    const minutes = document.getElementById('minutes');
    
    let d = parseInt(days.textContent);
    let h = parseInt(hours.textContent);
    let m = parseInt(minutes.textContent);
    
    m--;
    
    if (m < 0) {
        m = 59;
        h--;
        
        if (h < 0) {
            h = 23;
            d--;
            
            if (d < 0) {
                d = 0;
                h = 0;
                m = 0;
            }
        }
    }
    
    days.textContent = d.toString().padStart(2, '0');
    hours.textContent = h.toString().padStart(2, '0');
    minutes.textContent = m.toString().padStart(2, '0');
}

// Suavizar rolagem para links âncora
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});