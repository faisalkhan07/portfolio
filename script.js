// ===== Interactive background =====
// Particles drift, form faint connections when close together, swirl more
// the further you scroll down the page, and get pushed away by your cursor.

const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');

const PARTICLE_COUNT = 90;
const BASE_SPEED = 0.12;
const CONNECT_DIST = 130;      // lines appear between particles closer than this
const MOUSE_RADIUS = 140;      // cursor push-away radius
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let particles = [];
let docHeight = 1;
let scrollProgress = 0; // 0 at top of page, 1 at bottom
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
    r: Math.random() * 1.4 + 0.5,
  }));
}

function updateScrollProgress() {
  scrollProgress = Math.min(window.scrollY / docHeight, 1);
}

function step() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  // The more you've scrolled, the stronger the swirl around the page's center
  const swirl = scrollProgress * 0.0022;
  // And the faster particles drift overall
  const speedMult = 1 + scrollProgress * 1.6;

  particles.forEach((p) => {
    // gentle swirl: rotate velocity slightly around the center
    const dx = p.x - cx;
    const dy = p.y - cy;
    p.vx += -dy * swirl;
    p.vy += dx * swirl;

    // cursor push-away
    const mdx = p.x - mouse.x;
    const mdy = p.y - mouse.y;
    const mdist = Math.hypot(mdx, mdy);
    if (mdist < MOUSE_RADIUS) {
      const force = (1 - mdist / MOUSE_RADIUS) * 0.6;
      p.vx += (mdx / (mdist || 1)) * force;
      p.vy += (mdy / (mdist || 1)) * force;
    }

    // gentle damping so speed doesn't run away
    p.vx *= 0.98;
    p.vy *= 0.98;

    p.x += p.vx * speedMult;
    p.y += p.vy * speedMult;

    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;
  });

  // constellation lines between nearby particles
  const lineOpacityBoost = 0.15 + scrollProgress * 0.35;
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
        ctx.strokeStyle = `rgba(244, 241, 232, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  // particles on top of the lines
  particles.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244, 241, 232, 0.55)';
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
  // Draw one static frame instead of animating continuously
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244, 241, 232, 0.4)';
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
