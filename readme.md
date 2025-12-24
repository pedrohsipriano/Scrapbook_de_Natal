# 📸 Nossa História - Scrapbook Digital Interativo

Um scrapbook digital interativo e imersivo, desenvolvido para celebrar memórias especiais. O projeto utiliza uma timeline horizontal infinita com efeitos de paralaxe, física de movimento e interações 3D.

## ✨ Funcionalidades

- **Scroll Horizontal Infinito:** Navegação suave estilo "timeline" com suporte a mouse (wheel) e touch (celular).
- **Galeria Automática:** As fotos são carregadas e ordenadas cronologicamente a partir de um arquivo JSON gerado automaticamente.
- **Efeito Parallax:** Decorações de fundo flutuam em velocidades diferentes do conteúdo principal, criando profundidade.
- **Interatividade 3D:** As polaroids reagem ao movimento do mouse com um efeito de inclinação (tilt) suave.
- **Hero Mode (Overlay):** Ao clicar em uma foto, ela se expande com uma legenda digitada estilo "máquina de escrever".
- **Design Responsivo:** Funciona perfeitamente em Desktops, Tablets e Celulares.
- **Audio Experience:** Efeitos sonoros sutis de papel amassado (clique) e folhear de páginas (scroll).

## 🛠️ Tecnologias Utilizadas

- **HTML5 & CSS3:** Variáveis CSS, Flexbox, Transformações 3D e Animações.
- **JavaScript (Vanilla):**
  - `IntersectionObserver` para a timeline.
  - `ResizeObserver` para recálculo dinâmico do scroll.
  - Lógica de física para o scroll (Lerp - Linear Interpolation).
- **Python:** Script de automação para leitura de arquivos e geração do banco de dados (`data.js`).

## 🚀 Como Adicionar Novas Memórias

Este projeto conta com um script de automação para facilitar a adição de fotos.

1. **Adicione as fotos:**
   Coloque suas imagens (`.jpg`, `.png`) na pasta:
   `src/img/memorias/`

   *Dica: Nomeie os arquivos começando com a data para ordenação automática, ex: `2023-12-25_Natal.jpg`.*

2. **Gere o álbum:**
   Na raiz do projeto, execute o script Python:
   ```bash
   python gerar_album.py