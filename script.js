// ═══════════════════════════════════════════════════
//  SLIDE ENGINE
// ═══════════════════════════════════════════════════

const TOTAL_SLIDES = 7;
const SLIDE_LABELS = [
  'Portada',
  'Dataset',
  'Preprocesamiento & Sobel',
  'MLP & Forward Pass',
  'CUDA & Entrenamiento GPU',
  'Métricas & Streamlit',
  'Limitaciones & Conclusiones'
];

let currentSlide = 0;
let isAnimating  = false;
let animTimer    = null;

const slides      = document.querySelectorAll('.slide');
const dots        = document.querySelectorAll('.nav-dot');
const progressBar = document.getElementById('progress-bar');
const counter     = document.getElementById('slide-counter');
const labelEl     = document.getElementById('slide-label');
const prevBtn     = document.getElementById('prev-btn');
const nextBtn     = document.getElementById('next-btn');

// ─────────────────────────────────────────────────────
//  BUG FIX: nunca usar classList.add('') - cadena vacia
//  lanza DOMException y deja isAnimating=true para siempre.
//  Usamos clases explícitas para cada dirección.
// ─────────────────────────────────────────────────────
const EXIT_FORWARD  = 'exit-left';
const EXIT_BACKWARD = 'exit-right';

function goToSlide(index) {
  if (isAnimating)                        return;
  if (index === currentSlide)             return;
  if (index < 0 || index >= TOTAL_SLIDES) return;

  const from         = currentSlide;
  const to           = index;
  const goingForward = to > from;

  // Actualizar currentSlide ANTES de cualquier operacion DOM
  // para que clicks rapidos no generen estados inconsistentes
  isAnimating  = true;
  currentSlide = to;

  try {
    // 1. Salida del slide actual
    slides[from].classList.remove('active');
    if (goingForward) {
      slides[from].classList.add(EXIT_FORWARD);
    } else {
      slides[from].classList.add(EXIT_BACKWARD);
    }

    // 2. Posicionar slide destino fuera de pantalla sin transicion
    slides[to].style.transition = 'none';
    slides[to].style.transform  = goingForward ? 'translateX(60px)' : 'translateX(-60px)';
    slides[to].style.opacity    = '0';

    // Forzar reflow para que el browser aplique el estado inicial
    void slides[to].offsetWidth;

    // 3. Animar entrada del slide destino
    slides[to].style.transition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.45s ease';
    slides[to].style.transform  = 'translateX(0)';
    slides[to].style.opacity    = '1';
    slides[to].classList.add('active');

    // 4. Actualizar barra de navegacion
    updateUI();

    // 5. Limpiar tras la animacion - try/finally garantiza que
    //    isAnimating siempre vuelva a false aunque algo falle
    if (animTimer) clearTimeout(animTimer);
    animTimer = setTimeout(function () {
      try {
        slides[from].classList.remove(EXIT_FORWARD, EXIT_BACKWARD);
        slides[from].style.transform  = '';
        slides[from].style.opacity    = '';
        slides[from].style.transition = '';

        slides[to].style.transform  = '';
        slides[to].style.opacity    = '';
        slides[to].style.transition = '';
      } finally {
        isAnimating = false;
      }
    }, 480);

  } catch (err) {
    // Liberar el bloqueo inmediatamente si algo falla
    console.error('[Slide Engine] Error en transicion:', err);
    isAnimating = false;
  }
}

function changeSlide(dir) {
  goToSlide(currentSlide + dir);
}

function updateUI() {
  var i = currentSlide;
  dots.forEach(function (d, di) {
    d.classList.toggle('active', di === i);
  });
  progressBar.style.width = ((i + 1) / TOTAL_SLIDES * 100) + '%';
  counter.textContent     = (i + 1) + ' / ' + TOTAL_SLIDES;
  labelEl.textContent     = SLIDE_LABELS[i];
  prevBtn.disabled = (i === 0);
  nextBtn.disabled = (i === TOTAL_SLIDES - 1);
}

// Dot clicks
dots.forEach(function (dot, i) {
  dot.addEventListener('click', function () { goToSlide(i); });
});

// Teclado
document.addEventListener('keydown', function (e) {
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
    case 'PageDown':
      e.preventDefault();
      changeSlide(1);
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'PageUp':
      e.preventDefault();
      changeSlide(-1);
      break;
    case ' ':
      e.preventDefault();
      changeSlide(1);
      break;
    default:
      if (e.key >= '1' && e.key <= '7') {
        goToSlide(parseInt(e.key) - 1);
      }
  }
});

// Touch / Swipe
var touchStartX = 0;
var touchStartY = 0;

document.addEventListener('touchstart', function (e) {
  touchStartX = e.changedTouches[0].clientX;
  touchStartY = e.changedTouches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', function (e) {
  var dx = e.changedTouches[0].clientX - touchStartX;
  var dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
    changeSlide(dx < 0 ? 1 : -1);
  }
}, { passive: true });

// ═══════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════
function init() {
  slides[0].classList.add('active');
  slides[0].style.opacity   = '1';
  slides[0].style.transform = 'translateX(0)';
  updateUI();
  createParticles();
  tryLoadImages();
}

// ═══════════════════════════════════════════════════
//  PARTICLES
// ═══════════════════════════════════════════════════
function createParticles() {
  var container = document.getElementById('particles');
  if (!container) return;

  var colors = ['#76b900', '#00d4ff', '#a855f7'];
  for (var i = 0; i < 50; i++) {
    var dot = document.createElement('div');
    dot.style.cssText =
      'position:absolute;' +
      'width:'  + (Math.random() * 3 + 1) + 'px;' +
      'height:' + (Math.random() * 3 + 1) + 'px;' +
      'background:' + colors[Math.floor(Math.random() * 3)] + ';' +
      'border-radius:50%;' +
      'left:'   + (Math.random() * 100) + '%;' +
      'top:'    + (Math.random() * 100) + '%;' +
      'opacity:'  + (Math.random() * 0.6 + 0.1) + ';' +
      'animation:float-particle ' + (Math.random() * 8 + 4) + 's ease-in-out infinite;' +
      'animation-delay:' + (Math.random() * 4) + 's;';
    container.appendChild(dot);
  }

  // Inyectar keyframes + clases de salida
  var style = document.createElement('style');
  style.textContent =
    '@keyframes float-particle {' +
    '  0%,100% { transform:translateY(0) translateX(0); }' +
    '  33%  { transform:translateY(-20px) translateX(10px); }' +
    '  66%  { transform:translateY(12px) translateX(-8px); }' +
    '}' +
    '.exit-left  {' +
    '  transform:translateX(-60px) !important;' +
    '  opacity:0 !important;' +
    '  transition:transform 0.45s cubic-bezier(0.4,0,0.2,1),opacity 0.45s ease !important;' +
    '}' +
    '.exit-right {' +
    '  transform:translateX(60px) !important;' +
    '  opacity:0 !important;' +
    '  transition:transform 0.45s cubic-bezier(0.4,0,0.2,1),opacity 0.45s ease !important;' +
    '}';
  document.head.appendChild(style);
}

// ═══════════════════════════════════════════════════
//  AUTO IMAGE LOADING
// ═══════════════════════════════════════════════════
var IMAGE_MAP = {
  'dataset_original_1.png':  ['imagenes/dataset_original_1.png', 'imagenes/postura_radial_piso_recta/img_001.jpg'],
  'dataset_original_2.png':  ['imagenes/dataset_original_2.png', 'imagenes/postura_radial_piso_encorvada/img_001.jpg'],
  'imagen_original.png':     ['imagenes/imagen_original.png'],
  'imagen_sobel.png':        ['imagenes/imagen_sobel.png'],
  'cpu_vs_gpu.png':          ['imagenes/cpu_vs_gpu.png'],
  'tiempo_vs_bloque.png':    ['imagenes/tiempo_vs_bloque.png'],
  'nvidia_smi.png':          ['imagenes/nvidia_smi.png'],
  'curva_perdida.png':       ['imagenes/curva_perdida.png'],
  'curva_exactitud.png':     ['imagenes/curva_exactitud.png'],
  'matriz_confusion.png':    ['imagenes/matriz_confusion.png'],
  'metricas.png':            ['imagenes/metricas.png'],
  'app_streamlit.png':       ['imagenes/app_streamlit.png'],
  'inferencia.png':          ['imagenes/inferencia.png']
};

function tryLoadImages() {
  document.querySelectorAll('.ph-frame').forEach(function (frame) {
    var nameEl = frame.querySelector('.ph-name');
    if (!nameEl) return;
    var name  = nameEl.textContent.trim();
    var paths = IMAGE_MAP[name];
    if (!paths) return;

    var tried = 0;
    function tryNext() {
      if (tried >= paths.length) return;
      var path = paths[tried++];
      var img  = new Image();
      img.onload = function () {
        var icon = frame.querySelector('.ph-icon');
        var nameEl = frame.querySelector('.ph-name');
        if (icon) icon.remove();
        if (nameEl) nameEl.style.display = 'none';
        img.style.cssText = 'max-width:100%;max-height:100px;border-radius:4px;object-fit:cover;margin-bottom:4px;';
        frame.insertBefore(img, nameEl);
        frame.style.borderStyle = 'solid';
        frame.style.borderColor = '#76b900';
      };
      img.onerror = tryNext;
      img.src = path;
    }
    tryNext();
  });
}

// ═══════════════════════════════════════════════════
//  COUNTER ANIMATIONS
// ═══════════════════════════════════════════════════
function animateCounters(slideEl) {
  slideEl.querySelectorAll('.stat-n').forEach(function (el) {
    var target = parseInt(el.textContent.replace(/\D/g, ''));
    if (!target) return;
    var suffix  = el.textContent.replace(/[\d]/g, '');
    var current = 0;
    var step    = Math.ceil(target / 30);
    var timer   = setInterval(function () {
      current = Math.min(current + step, target);
      el.textContent = current + suffix;
      if (current >= target) clearInterval(timer);
    }, 30);
  });
}

setTimeout(function () { animateCounters(slides[0]); }, 300);

// ═══════════════════════════════════════════════════
//  START
// ═══════════════════════════════════════════════════
init();

window.changeSlide = changeSlide;
window.goToSlide   = goToSlide;

// ═══════════════════════════════════════════════════
//  IMAGE LIGHTBOX
// ═══════════════════════════════════════════════════
(function () {
  var overlay = document.getElementById('lightbox-overlay');
  var lbImg   = document.getElementById('lightbox-img');
  var lbCap   = document.getElementById('lightbox-caption');
  var closeBtn = document.getElementById('lightbox-close');

  if (!overlay || !lbImg) return;

  function openLightbox(src, caption) {
    lbImg.src = src;
    lbCap.textContent = caption || '';
    lbCap.style.display = caption ? 'block' : 'none';
    overlay.classList.add('active');
    // Bloquear scroll del slide
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    // Limpiar src tras la animación
    setTimeout(function () {
      if (!overlay.classList.contains('active')) {
        lbImg.src = '';
      }
    }, 400);
  }

  // Cerrar con botón ×
  closeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    closeLightbox();
  });

  // Cerrar al hacer click fuera de la imagen
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });

  // Cerrar con Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeLightbox();
    }
  });

  // Delegación de eventos: escuchar clicks en imágenes dentro de ph-frame
  document.addEventListener('click', function (e) {
    // Buscar si el click fue en una imagen dentro de un .ph-frame
    var img = e.target.closest('.ph-frame img');
    if (img) {
      e.preventDefault();
      e.stopPropagation();
      var frame = img.closest('.ph-frame');
      var hintEl = frame ? frame.querySelector('.ph-hint') : null;
      var caption = '';
      if (hintEl && hintEl.textContent.trim()) {
        caption = hintEl.textContent.trim();
      }
      openLightbox(img.src, caption);
      return;
    }

    // También permitir click en el frame completo si tiene imagen
    var frame = e.target.closest('.ph-frame');
    if (frame) {
      var frameImg = frame.querySelector('img');
      if (frameImg && frameImg.src) {
        e.preventDefault();
        var hintEl = frame.querySelector('.ph-hint');
        var caption = '';
        if (hintEl && hintEl.textContent.trim()) {
          caption = hintEl.textContent.trim();
        }
        openLightbox(frameImg.src, caption);
      }
    }
  });

  // Exponer para uso externo si es necesario
  window.openLightbox  = openLightbox;
  window.closeLightbox = closeLightbox;
})();
