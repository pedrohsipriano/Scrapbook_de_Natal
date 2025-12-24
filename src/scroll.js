// ==========================================
// 1. SELEÇÃO DE ELEMENTOS E VARIÁVEIS GLOBAIS
// ==========================================
const scrollContainer = document.querySelector('.scroll-container');
const scrollContent = document.querySelector('.scroll-content'); // O trilho
const parallaxLayer2 = document.getElementById('parallax-layer-2'); // O fundo
const progressBar = document.getElementById('timeline-progress'); // A barra nova

// Variáveis de Estado
let target = 0;   // Onde queremos chegar
let current = 0;  // Onde estamos agora
let maxScroll = 0; // Limite máximo do scroll

// Configurações (Tokens)
const scrollTokens = {
    ease: 0.075,
    parallaxSpeedFactor: 0.3,
    touchSensitivity: 1.5,
    decoMinGap: 150, decoGapVariance: 300,
    decoMinSize: 80, decoMaxSize: 200,
    decoTopMin: 5, decoTopMax: 80,
    decoRotationRange: 30,
    decoStartOffset: 50,
    decoInitDelay: 100, decoResizeDelay: 200,
    soundVolumeClick: 0.3,
    soundVolumeScroll: 0.2,
    soundScrollCooldown: 300
};
let ease = scrollTokens.ease;

// ==========================================
// 2. SINCRONIZAÇÃO COM CSS
// ==========================================
function syncConfigFromCSS() {
    const styles = getComputedStyle(document.documentElement);
    const readNumber = (varName) => {
        const raw = styles.getPropertyValue(varName);
        const parsed = parseFloat(raw);
        return Number.isNaN(parsed) ? null : parsed;
    };
    
    // Atualiza a suavidade se estiver no CSS
    const cssEase = readNumber('--scroll-ease');
    if (cssEase !== null) ease = cssEase;
    
    // Atualiza outras configs se necessário...
}
syncConfigFromCSS();

// ==========================================
// 3. CÁLCULO DO TAMANHO (CORREÇÃO DO TRAVAMENTO)
// ==========================================
function onResize() {
    if (!scrollContent) return;

    // Calcula largura total do conteúdo - largura da tela
    // Math.max(0, ...) garante que nunca seja negativo
    maxScroll = Math.max(0, scrollContent.scrollWidth - window.innerWidth);
    
    // Se maxScroll for 0, o site não rola.
    // console.log("Limite de Scroll:", maxScroll); 
}

// O ResizeObserver vigia se as fotos carregaram e mudaram o tamanho da div
const resizeObserver = new ResizeObserver(() => {
    onResize();
});
if (scrollContent) resizeObserver.observe(scrollContent);
window.addEventListener('resize', onResize);


// ==========================================
// 4. RENDERIZAÇÃO DA GALERIA
// ==========================================
function renderGallery() {
    const track = document.getElementById('gallery-track');
    if (!track) return;
    
    if (typeof memorias === 'undefined') {
        console.error("ERRO: 'memorias' não encontrado. Verifique src/data.js");
        return;
    }

    // --- NOVA LÓGICA DE ORDENAÇÃO ---
    const sortedMemories = memorias.sort((a, b) => {
        // 1. Primeiro compara as DATAS
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();

        // Se as datas forem diferentes, ordena por data (mais antiga primeiro)
        if (dateA !== dateB) {
            return dateA - dateB;
        }

        // 2. Se as datas forem IGUAIS, desempata pelo NOME do arquivo (ordem alfabética)
        // Usa o caminho da imagem (ex: ./src/.../A_foto.jpg vem antes de B_foto.jpg)
        return a.image.localeCompare(b.image);
    });
    // --------------------------------

    track.innerHTML = ''; // Limpa

    sortedMemories.forEach((memory, index) => {
        const polaroid = document.createElement('div');
        polaroid.classList.add('polaroid', 'item');
        polaroid.setAttribute('data-date', memory.displayDate);

        // Rotação inicial
        const rotation = index % 2 === 0 ? '2deg' : '-2deg';
        const translateY = index % 2 === 0 ? '20px' : '-20px';
        const originalTransform = `rotate(${rotation}) translateY(${translateY})`;
        
        // Salva dados para o polaroid.js usar
        polaroid.dataset.rotation = rotation; 
        polaroid.dataset.originalTransform = originalTransform;
        polaroid.style.transform = originalTransform;

        polaroid.innerHTML = `
            <div class="polaroid-inner">
                <img src="${memory.image}" alt="${memory.caption}" loading="lazy">
                <p class="legenda">${memory.caption}</p>
                <p class="hidden-caption">${memory.hiddenCaption}</p>
            </div>
        `;

        track.appendChild(polaroid);

        // Conecta com o polaroid.js
        if (typeof window.attachPolaroidEvents === 'function') {
            window.attachPolaroidEvents(polaroid);
        }
    });

    // Inicia observador de datas da navbar
    initDateObserver();
    
    // Força recalculo do scroll após criar elementos
    setTimeout(onResize, 100);
}


// ==========================================
// 5. LOOP DE ANIMAÇÃO (COM BARRA DE PROGRESSO)
// ==========================================
function animate() {
    // Interpolação Linear (Suavidade)
    current = current + (target - current) * ease;

    // A. Move as Fotos
    if (scrollContent) {
        scrollContent.style.transform = `translate3d(-${current.toFixed(2)}px, 0, 0)`;
    }

    // B. Move o Fundo (Parallax)
    if (parallaxLayer2) {
        const parallaxOffset = current * scrollTokens.parallaxSpeedFactor;
        parallaxLayer2.style.transform = `translate3d(-${parallaxOffset.toFixed(2)}px, 0, 0)`;
    }

    // C. Atualiza a Barra de Progresso
    if (progressBar) {
        let progress = 0;
        if (maxScroll > 0) {
            progress = current / maxScroll;
        }
        // Trava entre 0 e 1
        if (progress < 0) progress = 0;
        if (progress > 1) progress = 1;
        
        progressBar.style.width = `${progress * 100}%`;
    }

    requestAnimationFrame(animate);
}
// Inicia o loop
animate();


// ==========================================
// 6. EVENTOS DE MOUSE (WHEEL)
// ==========================================
window.addEventListener('wheel', (e) => {
    e.preventDefault();
    target += e.deltaY;

    // Limites Físicos
    target = Math.max(0, target);
    target = Math.min(target, maxScroll);
    
    // Som
    if (Math.abs(e.deltaY) > 5) playScrollSound();

}, { passive: false });


// ==========================================
// 7. EVENTOS DE TOUCH (CELULAR)
// ==========================================
let touchStartX = 0;
let touchScrollStart = 0;

window.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchScrollStart = target;
}, { passive: false });

window.addEventListener('touchmove', (e) => {
    if (e.cancelable) e.preventDefault();
    const touchCurrentX = e.touches[0].clientX;
    const deltaX = (touchStartX - touchCurrentX) * scrollTokens.touchSensitivity;

    target = touchScrollStart + deltaX;
    target = Math.max(0, target);
    target = Math.min(target, maxScroll);

    playScrollSound();
}, { passive: false });


// ==========================================
// 8. UTILITÁRIOS (TIMELINE, SOM, DECORAÇÃO)
// ==========================================

// Atualiza a data na navbar
function initDateObserver() {
    const dateDisplay = document.getElementById('timeline-date');
    const items = document.querySelectorAll('.item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const date = entry.target.getAttribute('data-date');
                if (date) dateDisplay.innerText = date;
            }
        });
    }, { threshold: 0.5 });

    items.forEach(item => observer.observe(item));
}

// Configuração de Sons
const audioClick = document.getElementById('audio-polaroid');
const audioScroll = document.getElementById('audio-scroll');
let lastScrollSoundTime = 0;

if(audioClick) audioClick.volume = scrollTokens.soundVolumeClick;
if(audioScroll) audioScroll.volume = scrollTokens.soundVolumeScroll;

window.playClickSound = function() {
    if (!audioClick) return;
    audioClick.currentTime = 0;
    audioClick.play().catch(()=>{});
}

function playScrollSound() {
    if (!audioScroll) return;
    const now = Date.now();
    if (now - lastScrollSoundTime > scrollTokens.soundScrollCooldown) {
        audioScroll.currentTime = 0;
        audioScroll.playbackRate = 0.9 + Math.random() * 0.2;
        audioScroll.play().catch(()=>{});
        lastScrollSoundTime = now;
    }
}

// Decoração Infinita (SVG)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function setupInfiniteDecorations() {
    const layer = parallaxLayer2;
    if (!layer || !scrollContent) return;

    if (!window.decorationTemplates) {
        const rawTemplates = Array.from(document.querySelectorAll('.deco-item'));
        window.decorationTemplates = rawTemplates.map(el => el.cloneNode(true));
        rawTemplates.forEach(el => el.remove());
    }
    const masterTemplates = window.decorationTemplates;
    if (masterTemplates.length === 0) return;

    layer.innerHTML = '';
    const totalContentWidth = scrollContent.scrollWidth;
    let currentDeck = [];
    let currentX = scrollTokens.decoStartOffset;

    while (currentX < totalContentWidth) {
        if (currentDeck.length === 0) currentDeck = shuffleArray(masterTemplates);
        
        const clone = currentDeck.pop().cloneNode(true);
        const size = Math.floor(Math.random() * (scrollTokens.decoMaxSize - scrollTokens.decoMinSize + 1)) + scrollTokens.decoMinSize;
        const top = Math.floor(Math.random() * (scrollTokens.decoTopMax - scrollTokens.decoTopMin)) + scrollTokens.decoTopMin;
        const rotate = Math.floor(Math.random() * (scrollTokens.decoRotationRange * 2)) - scrollTokens.decoRotationRange;

        clone.style.width = `${size}px`;
        clone.style.position = 'absolute';
        clone.style.top = `${top}%`;
        clone.style.left = `${currentX}px`;
        clone.style.transform = `rotate(${rotate}deg)`;
        
        const img = clone.querySelector('img');
        if (img) { img.style.width = '100%'; img.style.display = 'block'; }

        layer.appendChild(clone);
        currentX += size + scrollTokens.decoMinGap + Math.floor(Math.random() * scrollTokens.decoGapVariance);
    }
    layer.style.width = `${totalContentWidth}px`;
}

// ==========================================
// 9. INICIALIZAÇÃO
// ==========================================
window.addEventListener('load', () => {
    renderGallery(); // Gera as fotos
    
    // Pequeno delay para garantir cálculos
    setTimeout(() => {
        onResize();
        setupInfiniteDecorations();
    }, 100);
});