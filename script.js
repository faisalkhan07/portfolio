// ===== Ambient background animation =====
// A quiet field of drifting dots — subtle, monochrome, non-distracting.
// Edit PARTICLE_COUNT / SPEED below to make it busier or calmer.

const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');

const PARTICLE_COUNT = 60;
const SPEED = 0.15;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let particles = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function makeParticles() {
  particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * SPEED,
    vy: (Math.random() - 0.5) * SPEED,
    r: Math.random() * 1.4 + 0.4,
    a: Math.random() * 0.35 + 0.1,
  }));
}

function step() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;

    // wrap around edges
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(244, 241, 232, ${p.a})`;
    ctx.fill();
  });

  requestAnimationFrame(step);
}

resize();
makeParticles();
window.addEventListener('resize', () => {
  resize();
  makeParticles();
});

if (!prefersReducedMotion) {
  requestAnimationFrame(step);
} else {
  // Draw one static frame instead of animating
  step_static();
}

function step_static() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(244, 241, 232, ${p.a})`;
    ctx.fill();
  });
}

// ===== Scroll-reveal quotes =====
// Each .quote-line fades/slides in once it's mostly in view, and stays visible.
const quoteObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('.quote-line').forEach((line) => quoteObserver.observe(line));

// Fade out the "scroll" hint once the person actually starts scrolling
const scrollHint = document.querySelector('.scroll-hint');
if (scrollHint) {
  window.addEventListener(
    'scroll',
    () => {
      scrollHint.style.opacity = window.scrollY > 40 ? '0' : '';
      scrollHint.style.transition = 'opacity 0.4s ease';
    },
    { passive: true }
  );
}
