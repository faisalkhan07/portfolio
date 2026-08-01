// ===== Interactive background =====
// Particles drift in cyan/magenta, connect into faint lines when close together,
// swirl more the further you've scrolled through the page, and get pushed away
// by your cursor. Note: scrolling now happens inside the `.scroller` element
// (because of scroll-snap), not the window — so progress is measured from that.

const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');
const scroller = document.querySelector('.scroller');

const PARTICLE_COUNT = 90;
const BASE_SPEED = 0.12;
const CONNECT_DIST = 130;
const MOUSE_RADIUS = 140;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let particles = [];
let scrollProgress = 0; // 0 at top, 1 at bottom of the .scroller
const mouse = { x: -9999, y: -9999 };

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function makeParticles() {
  particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * BASE_SPEED,
    vy: (Math.random() - 0.5) * BASE_SPEED,
    r: Math.random() * 1.4 + 0.5,
    hue: Math.random() < 0.5 ? 'cyan' : 'magenta',
  }));
}

function updateScrollProgress() {
  if (!scroller) return;
  const range = scroller.scrollHeight - scroller.clientHeight;
  scrollProgress = range > 0 ? Math.min(scroller.scrollTop / range, 1) : 0;
}

const COLORS = {
  cyan: (a) => `rgba(0, 229, 255, ${a})`,
  magenta: (a) => `rgba(255, 46, 147, ${a})`,
};

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
        ctx.strokeStyle = COLORS[a.hue](alpha);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  particles.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = COLORS[p.hue](0.65);
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
if (scroller) scroller.addEventListener('scroll', updateScrollProgress, { passive: true });
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
    ctx.fillStyle = COLORS[p.hue](0.5);
    ctx.fill();
  });
}

// ===== Glitch-in text reveal =====
// Each .glitch-text plays its glitch-in animation once, the first time it's
// mostly visible, and then stays visible. Simple, reliable, no scroll-math.
const glitchObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        glitchObserver.unobserve(entry.target);
      }
    });
  },
  { root: scroller, threshold: 0.6 }
);

document.querySelectorAll('.glitch-text').forEach((el) => glitchObserver.observe(el));

// Fade out the "scroll" hint once scrolling actually starts
const scrollHint = document.querySelector('.scroll-hint');
if (scrollHint && scroller) {
  scroller.addEventListener(
    'scroll',
    () => {
      scrollHint.style.opacity = scroller.scrollTop > 40 ? '0' : '';
      scrollHint.style.transition = 'opacity 0.4s ease';
    },
    { passive: true }
  );
}
