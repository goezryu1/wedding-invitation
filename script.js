/* ============================================================
   STATE
   ============================================================ */
const CORRECT_PASSCODE = '092226';

const state = {
  hearts: 47,
  capsuleMsgs: [],
  futureMsgs: [],
  gpMsgs: [],
  playing: false,
};

/* ============================================================
   PASSCODE
   ============================================================ */
function checkPasscode() {
  const input = document.getElementById('pc-input');
  const error = document.getElementById('pc-error');
  const screen = document.getElementById('passcode-screen');

  if (input.value.trim() === CORRECT_PASSCODE) {
    screen.classList.add('hidden');
    error.textContent = '';
  } else {
    error.textContent = 'Incorrect passcode. Please try again.';
    input.value = '';
    input.focus();
  }
}

/* ============================================================
   COUNTDOWN TIMER
   ============================================================ */
function initCountdown() {
  const target = new Date('2026-09-22T00:00:00');

  function tick() {
    let diff = Math.max(0, target - new Date());

    const days  = Math.floor(diff / 86400000); diff -= days  * 86400000;
    const hours = Math.floor(diff / 3600000);  diff -= hours * 3600000;
    const mins  = Math.floor(diff / 60000);    diff -= mins  * 60000;
    const secs  = Math.floor(diff / 1000);

    document.getElementById('cd-days').textContent  = String(days).padStart(3, '0');
    document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cd-mins').textContent  = String(mins).padStart(2, '0');
    document.getElementById('cd-secs').textContent  = String(secs).padStart(2, '0');
  }

  tick();
  setInterval(tick, 1000);
}

/* ============================================================
   HEART COUNTER (scroll-triggered animation)
   ============================================================ */
function initHeartCounter() {
  const observer = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;

    let count = 0;
    const el = document.getElementById('heart-count');

    const interval = setInterval(() => {
      count = Math.min(count + 1, state.hearts);
      el.textContent = count;
      if (count >= state.hearts) clearInterval(interval);
    }, 35);

    observer.disconnect();
  });

  observer.observe(document.getElementById('hearts'));
}

/* ============================================================
   MUSIC PLAYER
   ============================================================ */
function toggleMusicPanel() {
  document.getElementById('musicFloat').classList.toggle('open');
}

function initMusic() {
  const audio     = document.getElementById('weddingAudio');
  const playBtn   = document.getElementById('playBtn');
  const progress  = document.getElementById('progress');
  const curTime   = document.getElementById('cur-time');
  const totalTime = document.getElementById('tot-time');

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  audio.addEventListener('loadedmetadata', () => {
    totalTime.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    progress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
    curTime.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener('ended', () => {
    state.playing = false;
    playBtn.textContent = '▶';
    progress.style.width = '0%';
  });

  window.togglePlay = () => {
    if (state.playing) {
      audio.pause();
      state.playing = false;
      playBtn.textContent = '▶';
    } else {
      audio.play().catch(() => { playBtn.textContent = '▶'; });
      state.playing = true;
      playBtn.textContent = '⏸';
    }
  };

  window.seekSong = (event) => {
    if (!audio.duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    audio.currentTime = ((event.clientX - rect.left) / rect.width) * audio.duration;
  };
}

/* ============================================================
   LOVE CAPSULE
   ============================================================ */
function updateCapsule() {
  const countEl = document.getElementById('capsule-count');
  const box     = document.getElementById('capsule-msgs');
  const count   = state.capsuleMsgs.length;

  countEl.textContent = `${count} message${count !== 1 ? 's' : ''} sealed inside ✦`;
  box.innerHTML = '';

  state.capsuleMsgs.forEach((msg) => {
    const item = document.createElement('div');
    item.className = 'capsule-msg';
    item.innerHTML = `
      <p>${escapeHtml(msg.msg)}</p>
      <div class="capsule-msg-from">— ${escapeHtml(msg.name)} · ${msg.time}</div>
    `;
    box.appendChild(item);
  });
}

function toggleCapsule() {
  const messages = document.getElementById('capsule-msgs');
  const btn      = document.getElementById('capsule-btn');
  const isOpen   = messages.style.display === 'block';

  messages.style.display = isOpen ? 'none' : 'block';
  btn.textContent = isOpen ? 'Peek Inside (Host View) ▾' : 'Close Capsule ▲';
}

/* ============================================================
   GODPARENT MESSAGES
   ============================================================ */
function renderGodparents() {
  const box = document.getElementById('gp-messages');
  box.innerHTML = '';

  if (state.gpMsgs.length === 0) return;

  const heading = document.createElement('h3');
  heading.className = 'gp-messages-title';
  heading.textContent = 'Blessings Received';
  box.appendChild(heading);

  state.gpMsgs.forEach((msg) => {
    const item = document.createElement('div');
    item.className = 'gp-msg';
    item.innerHTML = `
      <div class="gp-msg-name">${escapeHtml(msg.name)}</div>
      <div class="gp-msg-role">Beloved Godparent</div>
      <p class="gp-msg-text">${escapeHtml(msg.msg)}</p>
    `;
    box.appendChild(item);
  });
}

/* ============================================================
   FUTURE WISHES WALL
   ============================================================ */
function renderFuture() {
  const wall = document.getElementById('future-wall');
  wall.innerHTML = '';

  state.futureMsgs.forEach((msg) => {
    const item = document.createElement('div');
    item.className = 'future-note';
    item.innerHTML = `
      <p>"${escapeHtml(msg.msg)}"</p>
      <div class="future-note-from">— ${escapeHtml(msg.name)}</div>
      <div class="future-note-date">Sealed · September 22, 2026</div>
    `;
    wall.appendChild(item);
  });
}

/* ============================================================
   FORM SUBMISSIONS
   ============================================================ */
function submitRSVP() {
  const name       = document.getElementById('rsvp-name').value.trim();
  const message    = document.getElementById('rsvp-msg').value.trim();
  const attendance = document.querySelector('input[name="attend"]:checked').value;
  const guests     = parseInt(document.getElementById('rsvp-guests').value, 10) || 1;

  if (!name) {
    alert('Please enter your name.');
    return;
  }

  const successEl = document.getElementById('rsvp-success');
  const declineEl = document.getElementById('rsvp-decline');

  if (attendance === 'yes') {
    state.hearts += guests;
    document.getElementById('heart-count').textContent = state.hearts;

    if (message) {
      state.capsuleMsgs.push({ name, msg: message, time: new Date().toLocaleDateString() });
      updateCapsule();
    }

    successEl.hidden = false;
    declineEl.hidden = true;
  } else {
    successEl.hidden = true;
    declineEl.hidden = false;
  }

  document.getElementById('rsvpModal').classList.add('open');
  document.getElementById('rsvp-name').value  = '';
  document.getElementById('rsvp-email').value = '';
  document.getElementById('rsvp-msg').value   = '';
}

function submitGodparent() {
  const name    = document.getElementById('gp-name').value.trim();
  const message = document.getElementById('gp-msg').value.trim();

  if (!name || !message) {
    alert('Please fill in your name and blessing.');
    return;
  }

  state.gpMsgs.push({ name, msg: message });
  renderGodparents();
  document.getElementById('gp-name').value = '';
  document.getElementById('gp-msg').value  = '';
}

function submitFuture() {
  const name    = document.getElementById('fut-name').value.trim();
  const message = document.getElementById('fut-msg').value.trim();

  if (!name || !message) {
    alert('Please fill in your name and message.');
    return;
  }

  state.futureMsgs.push({ name, msg: message });
  renderFuture();
  document.getElementById('fut-name').value = '';
  document.getElementById('fut-msg').value  = '';
}

/* ============================================================
   UTILITIES
   ============================================================ */
function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function goTo(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

/* ============================================================
   GLOBAL EXPORTS (called from inline HTML onclick attributes)
   ============================================================ */
window.checkPasscode    = checkPasscode;
window.submitRSVP       = submitRSVP;
window.submitGodparent  = submitGodparent;
window.submitFuture     = submitFuture;
window.closeModal       = closeModal;
window.goTo             = goTo;
window.toggleCapsule    = toggleCapsule;
window.toggleMusicPanel = toggleMusicPanel;

/* ============================================================
   FLOATING CANVAS — Gold flowers, lining strokes & sparkles
   ============================================================ */
(function () {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;

  /* Gold colour palette */
  const GOLDS = [
    'rgba(201,162,39,',
    'rgba(232,200,74,',
    'rgba(160,120,24,',
    'rgba(245,230,140,',
    'rgba(218,178,60,',
  ];
  const rg  = () => GOLDS[Math.floor(Math.random() * GOLDS.length)];
  const rnd = (a, b) => a + Math.random() * (b - a);

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* ── FLOWER ─────────────────────────────────────────────── */
  function makeFlower() {
    const side = Math.random();
    let x, y;
    if      (side < 0.70) { x = rnd(0, W); y = H + 20; }
    else if (side < 0.85) { x = -20;       y = rnd(H * 0.2, H); }
    else                  { x = W + 20;    y = rnd(H * 0.2, H); }

    return {
      x, y,
      size:     rnd(7, 22),
      petals:   Math.floor(rnd(5, 9)),
      rot:      rnd(0, Math.PI * 2),
      rotSpeed: (Math.random() - 0.5) * 0.005,
      vx:       (Math.random() - 0.5) * 0.18,
      vy:       -rnd(0.10, 0.30),
      alpha:    0,
      life:     0,
      maxLife:  rnd(340, 600),
      color:    rg(),
      type:     Math.random() > 0.42 ? 'flower' : (Math.random() > 0.5 ? 'leaf' : 'blossom'),
    };
  }

  function drawFlower(f) {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.rot);
    ctx.globalAlpha = f.alpha;
    const r = f.size;

    if (f.type === 'flower') {
      for (let i = 0; i < f.petals; i++) {
        ctx.save();
        ctx.rotate((Math.PI * 2 / f.petals) * i);
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.62, r * 0.28, r * 0.52, 0, 0, Math.PI * 2);
        ctx.fillStyle   = f.color + '0.45)';
        ctx.strokeStyle = f.color + '0.80)';
        ctx.lineWidth   = 0.7;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.20, 0, Math.PI * 2);
      ctx.fillStyle = f.color + '0.95)';
      ctx.fill();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 / 6) * i;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * r * 0.38, Math.sin(a) * r * 0.38);
        ctx.strokeStyle = f.color + '0.45)';
        ctx.lineWidth   = 0.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r * 0.42, Math.sin(a) * r * 0.42, 1.1, 0, Math.PI * 2);
        ctx.fillStyle = f.color + '0.65)';
        ctx.fill();
      }

    } else if (f.type === 'leaf') {
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.bezierCurveTo( r * 0.55, -r * 0.25,  r * 0.55,  r * 0.25, 0,  r * 0.45);
      ctx.bezierCurveTo(-r * 0.55,  r * 0.25, -r * 0.55, -r * 0.25, 0, -r);
      ctx.fillStyle   = f.color + '0.28)';
      ctx.strokeStyle = f.color + '0.70)';
      ctx.lineWidth   = 0.65;
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(0, r * 0.45);
      ctx.strokeStyle = f.color + '0.40)';
      ctx.lineWidth   = 0.4;
      ctx.stroke();

    } else {
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.rotate((Math.PI / 2) * i + Math.PI / 4);
        ctx.beginPath();
        ctx.arc(0, -r * 0.5, r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle   = f.color + '0.38)';
        ctx.strokeStyle = f.color + '0.75)';
        ctx.lineWidth   = 0.7;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = f.color + '0.90)';
      ctx.fill();
    }

    ctx.restore();
  }

  /* ── GOLD LINING STROKES ────────────────────────────────── */
  function makeLine() {
    const edge = Math.floor(Math.random() * 4);
    let x1, y1, angle;

    if      (edge === 0) { x1 = rnd(0, W); y1 = 0;  angle = rnd(0.2, 1.4); }
    else if (edge === 1) { x1 = W;         y1 = rnd(0, H); angle = rnd(Math.PI * 0.6, Math.PI * 1.4); }
    else if (edge === 2) { x1 = rnd(0, W); y1 = H;  angle = rnd(Math.PI + 0.2, Math.PI * 2 - 0.2); }
    else                 { x1 = 0;         y1 = rnd(0, H); angle = rnd(-0.6, 0.6); }

    return {
      x1, y1, angle,
      len:      rnd(80, 220),
      width:    rnd(0.5, 1.4),
      alpha:    0,
      life:     0,
      maxLife:  rnd(180, 360),
      color:    rg(),
      branches: Math.random() > 0.55,
    };
  }

  function drawLine(l) {
    ctx.save();
    ctx.globalAlpha = l.alpha;

    const ex = l.x1 + Math.cos(l.angle) * l.len;
    const ey = l.y1 + Math.sin(l.angle) * l.len;

    ctx.beginPath();
    ctx.moveTo(l.x1, l.y1);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = l.color + '0.65)';
    ctx.lineWidth   = l.width;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ex, ey, l.width * 1.6, 0, Math.PI * 2);
    ctx.fillStyle = l.color + '0.75)';
    ctx.fill();

    if (l.branches) {
      const bx = l.x1 + Math.cos(l.angle) * l.len * 0.55;
      const by = l.y1 + Math.sin(l.angle) * l.len * 0.55;
      const ba = l.angle + rnd(0.4, 0.9) * (Math.random() > 0.5 ? 1 : -1);
      const bl = l.len * rnd(0.3, 0.5);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(ba) * bl, by + Math.sin(ba) * bl);
      ctx.strokeStyle = l.color + '0.45)';
      ctx.lineWidth   = l.width * 0.6;
      ctx.stroke();
    }

    ctx.restore();
  }

  /* ── SPARKLES ───────────────────────────────────────────── */
  function makeSparkle() {
    return {
      x: rnd(0, W), y: rnd(0, H),
      r: rnd(0.8, 2.2),
      alpha:   0,
      life:    0,
      maxLife: rnd(80, 180),
      color:   rg(),
    };
  }

  function drawSparkle(s) {
    ctx.save();
    ctx.globalAlpha = s.alpha;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = s.color + '0.9)';
    ctx.fill();
    ctx.restore();
  }

  /* ── POOLS (pre-seeded) ─────────────────────────────────── */
  const flowers  = Array.from({ length: 20 }, () => { const f = makeFlower(); f.y = rnd(0, H); f.life = rnd(0, f.maxLife * 0.6); return f; });
  const lines    = Array.from({ length: 10 }, () => { const l = makeLine();  l.life = rnd(0, l.maxLife * 0.5); return l; });
  const sparkles = Array.from({ length: 14 }, makeSparkle);

  /* ── ANIMATION LOOP ─────────────────────────────────────── */
  function tick() {
    ctx.clearRect(0, 0, W, H);

    lines.forEach((l, i) => {
      l.life++;
      const half = l.maxLife * 0.2;
      const tail = l.maxLife * 0.72;
      l.alpha = l.life < half
        ? (l.life / half) * 0.72
        : l.life > tail
          ? Math.max(0, 0.72 - (l.life - tail) / (l.maxLife - tail) * 0.72)
          : 0.72;
      drawLine(l);
      if (l.life >= l.maxLife) lines[i] = makeLine();
    });

    flowers.forEach((f, i) => {
      f.life++; f.x += f.vx; f.y += f.vy; f.rot += f.rotSpeed;
      const fadeIn  = f.maxLife * 0.15;
      const fadeOut = f.maxLife * 0.78;
      f.alpha = f.life < fadeIn
        ? (f.life / fadeIn) * 0.82
        : f.life > fadeOut
          ? Math.max(0, 0.82 - (f.life - fadeOut) / (f.maxLife - fadeOut) * 0.82)
          : 0.82;
      drawFlower(f);
      if (f.life >= f.maxLife || f.y < -80 || f.x < -80 || f.x > W + 80) flowers[i] = makeFlower();
    });

    sparkles.forEach((s, i) => {
      s.life++;
      const half = s.maxLife / 2;
      s.alpha = s.life < half ? s.life / half : Math.max(0, 1 - (s.life - half) / half);
      drawSparkle(s);
      if (s.life >= s.maxLife) sparkles[i] = makeSparkle();
    });

    if (Math.random() < 0.012 && flowers.length  < 36) flowers.push(makeFlower());
    if (Math.random() < 0.006 && lines.length    < 18) lines.push(makeLine());
    if (Math.random() < 0.025 && sparkles.length < 24) sparkles.push(makeSparkle());

    requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener('resize', resize);
  tick();
})();

/* ============================================================
   INIT
   ============================================================ */
initCountdown();
initHeartCounter();
initMusic();
updateCapsule();
renderGodparents();
renderFuture();