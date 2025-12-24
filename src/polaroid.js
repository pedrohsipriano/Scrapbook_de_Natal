const rootElement = document.documentElement;

// Mantemos suas configurações originais
const interactiveConfig = {
    maxTilt: 15,
    hoverScale: 1.05,
    perspective: '1000px',
    typewriterSpeed: 70,
    typewriterDefaultSpeed: 50,
    typewriterDelay: 500
};

// Mantemos a sincronização com o CSS
function syncInteractiveConfig() {
    const styles = getComputedStyle(rootElement);
    const maxTilt = parseFloat(styles.getPropertyValue('--polaroid-tilt-max'));
    const hoverScale = parseFloat(styles.getPropertyValue('--polaroid-hover-scale'));
    const typewriterSpeed = parseFloat(styles.getPropertyValue('--hero-typewriter-speed'));
    const typewriterDefault = parseFloat(styles.getPropertyValue('--hero-typewriter-default-speed'));
    const typewriterDelay = parseFloat(styles.getPropertyValue('--hero-typewriter-delay'));
    const perspective = styles.getPropertyValue('--scene-perspective').trim();

    if (!Number.isNaN(maxTilt)) interactiveConfig.maxTilt = maxTilt;
    if (!Number.isNaN(hoverScale)) interactiveConfig.hoverScale = hoverScale;
    if (perspective.length) interactiveConfig.perspective = perspective;
    if (!Number.isNaN(typewriterSpeed)) interactiveConfig.typewriterSpeed = typewriterSpeed;
    if (!Number.isNaN(typewriterDefault)) interactiveConfig.typewriterDefaultSpeed = typewriterDefault;
    if (!Number.isNaN(typewriterDelay)) interactiveConfig.typewriterDelay = typewriterDelay;
}

syncInteractiveConfig();
window.addEventListener('resize', syncInteractiveConfig);


// ==========================================
// LÓGICA DO OVERLAY & TYPEWRITER
// ==========================================
const overlay = document.getElementById('hero-overlay');
const heroImageContainer = document.getElementById('hero-image-container');
const heroCaption = document.getElementById('hero-caption');
let typewriterTimeout; 

function typeWriter(text, element, speed) {
    const effectiveSpeed = typeof speed === 'number' ? speed : interactiveConfig.typewriterDefaultSpeed;
    element.innerHTML = ''; 
    let i = 0;

    function typing() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            typewriterTimeout = setTimeout(typing, effectiveSpeed);
        }
    }
    typing();
}

// Fechar o overlay (Evento estático, pode ficar aqui)
if (overlay) {
    overlay.addEventListener('click', () => {
        overlay.classList.remove('active');
        clearTimeout(typewriterTimeout); 
    });
}

// ==========================================
// NOVA FUNÇÃO DE CONEXÃO (ADAPTAÇÃO)
// ==========================================
// Em vez de rodar o forEach no carregamento, criamos essa função
// para o scroll.js chamar a cada foto criada.

window.attachPolaroidEvents = function(item) {
    
    // 1. TILT 3D (Com suavidade ativa)
    item.addEventListener('mousemove', (e) => {
        // NÃO desligamos a transition aqui. Deixamos o CSS fazer a suavização.
        
        const rect = item.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Pega a posição do mouse relativa ao centro da foto
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const percentX = (mouseX - centerX) / centerX;
        const percentY = (mouseY - centerY) / centerY;

        // Calcula a inclinação
        const tiltX = percentY * interactiveConfig.maxTilt * -1;
        const tiltY = percentX * interactiveConfig.maxTilt;
        
        // Pega a rotação original (tortinho) para não dar "pulo"
        const currentRotation = item.dataset.rotation || '0deg';

        // Aplica o transform. Como o CSS tem 'transition: 0.4s', 
        // ele vai "flutuar" até essa nova posição suavemente.
        item.style.transform = `
            perspective(${interactiveConfig.perspective})
            rotate(${currentRotation}) 
            rotateX(${tiltX}deg)
            rotateY(${tiltY}deg)
            scale(${interactiveConfig.hoverScale})
        `;
        
        item.style.zIndex = 100;
    });

    // 2. MOUSE LEAVE (Volta suave para o lugar)
    item.addEventListener('mouseleave', () => {
        // A transição do CSS já cuida da suavidade aqui também
        item.style.transform = item.dataset.originalTransform || '';
        item.style.zIndex = ''; 
    });

    // 3. CLICK (Igual ao anterior)
    item.addEventListener('click', () => {
        if (typeof playClickSound === 'function') playClickSound();

        const img = item.querySelector('img');
        const captionText = item.querySelector('.hidden-caption')?.innerText || "Sem legenda...";

        if (!img) return; 

        heroImageContainer.innerHTML = ''; 
        const clonedImg = img.cloneNode(true);
        heroImageContainer.appendChild(clonedImg);

        // Correção da largura da legenda
        setTimeout(() => {
            if(clonedImg.offsetWidth > 0) {
                heroCaption.style.maxWidth = `${clonedImg.offsetWidth}px`;
            }
        }, 10);

        heroCaption.innerHTML = '';
        overlay.classList.add('active');

        clearTimeout(typewriterTimeout); 
        setTimeout(() => {
            typeWriter(captionText, heroCaption, interactiveConfig.typewriterSpeed);
        }, interactiveConfig.typewriterDelay);
    });
};