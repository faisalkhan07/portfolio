// ===== Ambient background blobs =====
// A handful of large, softly-colored circles drifting slowly behind
// everything (blurred via CSS on the canvas itself, so the shapes here can
// stay simple — the blur is what turns them into soft glowing blobs).
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resizeBgCanvas() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
resizeBgCanvas();
window.addEventListener('resize', resizeBgCanvas);

const BLOB_COLORS = ['rgba(255,30,30,0.35)', 'rgba(20,20,20,0.12)', 'rgba(255,30,30,0.2)'];

const blobs = Array.from({ length: 6 }, (_, i) => ({
  baseX: Math.random(),
  baseY: Math.random(),
  radius: 140 + Math.random() * 160,
  speed: 0.00015 + Math.random() * 0.0002,
  offset: Math.random() * Math.PI * 2,
  color: BLOB_COLORS[i % BLOB_COLORS.length],
}));

function drawBlobs(time) {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

  blobs.forEach((b) => {
    const x = b.baseX * bgCanvas.width + Math.sin(time * b.speed + b.offset) * 120;
    const y = b.baseY * bgCanvas.height + Math.cos(time * b.speed * 0.8 + b.offset) * 120;

    bgCtx.beginPath();
    bgCtx.arc(x, y, b.radius, 0, Math.PI * 2);
    bgCtx.fillStyle = b.color;
    bgCtx.fill();
  });

  if (!prefersReducedMotion) requestAnimationFrame(drawBlobs);
}

requestAnimationFrame(drawBlobs);
if (prefersReducedMotion) drawBlobs(0); // draw a single static frame instead

// ===== Rotating quote (changes every 12 hours) =====
// Add, remove, or edit quotes freely — the rotation logic doesn't need
// changes when you do. Every visitor within the same 12-hour window sees
// the same quote, and it's fully static — no backend needed.
const QUOTES = [
  { text: 'Fall seven times, stand up eight.', author: 'Japanese Proverb' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Code is like humor. When you have to explain it, it\u2019s bad.', author: 'Cory House' },
  { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
  { text: 'The best way to predict the future is to invent it.', author: 'Alan Kay' },
  { text: 'Whether you think you can, or you think you can\u2019t \u2014 you\u2019re right.', author: 'Henry Ford' },
  { text: 'Curiosity is the engine of achievement.', author: 'Ken Robinson' },
  { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
];

const ROTATION_MS = 12 * 60 * 60 * 1000; // 12 hours

function getCurrentWindowIndex() {
  return Math.floor(Date.now() / ROTATION_MS);
}

function renderQuote() {
  const windowIndex = getCurrentWindowIndex();
  const quote = QUOTES[windowIndex % QUOTES.length];
  document.getElementById('quoteText').textContent = quote.text;
  document.getElementById('quoteAuthor').textContent = `— ${quote.author}`;
}

function renderCountdown() {
  const windowIndex = getCurrentWindowIndex();
  const nextChangeAt = (windowIndex + 1) * ROTATION_MS;
  const remaining = Math.max(nextChangeAt - Date.now(), 0);

  const h = String(Math.floor(remaining / 3600000)).padStart(2, '0');
  const m = String(Math.floor((remaining % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');

  document.getElementById('quoteTimer').textContent = `${h}:${m}:${s}`;

  // if the countdown hits zero, swap in the new quote right away
  if (remaining <= 0) renderQuote();
}

renderQuote();
renderCountdown();
setInterval(renderCountdown, 1000);

// ===== Visitor count =====
// Uses a free, no-signup counter API (countapi.xyz) — every page load
// increments and returns the total. If the request fails for any reason
// (offline, API down), it just shows a dash instead of breaking the page.
const VISITOR_NAMESPACE = 'faisalkhan-portfolio-2026';
const VISITOR_KEY = 'visits';

fetch(`https://api.countapi.xyz/hit/${VISITOR_NAMESPACE}/${VISITOR_KEY}`)
  .then((res) => res.json())
  .then((data) => {
    document.getElementById('visitorCount').textContent = `${data.value} visits`;
  })
  .catch(() => {
    document.getElementById('visitorCount').textContent = '';
  });
