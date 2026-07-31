// ===== Interactive background (cyan/magenta duotone) =====
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');

const PARTICLE_COUNT = 90;
const BASE_SPEED = 0.12;
const CONNECT_DIST = 130;
const MOUSE_RADIUS = 140;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let particles = [];
let docHeight = 1;
let scrollProgress = 0;
const mouse = { x: -9999, y: -9999 };

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  docHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
}

function makeParticles() {
  particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * BASE_SPEED,
    vy: (Math.random() - 0.5) * BASE_SPEED,
    r: Math.random() * 1.5 + 0.5,
    color: Math.random() > 0.5 ? '0, 229, 255' : '255, 46, 147', // cyan / magenta mix
  }));
}

function updateScrollProgress() {
  scrollProgress = Math.min(window.scrollY / docHeight, 1);
}

function step() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const swirl = scrollProgress * 0.0022;
  const speedMult = 1 + scrollProgress * 1.6;

  particles.forEach((p) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    p.vx += -dy * swirl;
    p.vy += dx * swirl;

    const mdx = p.x - mouse.x;
    const mdy = p.y - mouse.y;
    const mdist = Math.hypot(mdx, mdy);
    if (mdist < MOUSE_RADIUS) {
      const force = (1 - mdist / MOUSE_RADIUS) * 0.6;
      p.vx += (mdx / (mdist || 1)) * force;
      p.vy += (mdy / (mdist || 1)) * force;
    }

    p.vx *= 0.98;
    p.vy *= 0.98;
    p.x += p.vx * speedMult;
    p.y += p.vy * speedMult;

    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;
  });

  const lineOpacityBoost = 0.12 + scrollProgress * 0.3;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i];
      const b = particles[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < CONNECT_DIST) {
        const alpha = (1 - dist / CONNECT_DIST) * lineOpacityBoost;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  particles.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.color}, 0.75)`;
    ctx.fill();
  });

  requestAnimationFrame(step);
}

resize();
makeParticles();
updateScrollProgress();

window.addEventListener('resize', () => {
  resize();
  makeParticles();
  updateScrollProgress();
});
window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener('mouseleave', () => {
  mouse.x = -9999;
  mouse.y = -9999;
});

if (!prefersReducedMotion) {
  requestAnimationFrame(step);
} else {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.color}, 0.5)`;
    ctx.fill();
  });
}

// ===== Quote screen reveals =====
// Each .quote-screen fades/glitches in once it's mostly on screen, and stays
// visible after that — no fragile scroll-height math, just IntersectionObserver.
const screenObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        screenObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);

document.querySelectorAll('.quote-screen').forEach((screen) => screenObserver.observe(screen));

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
