const CORRECT_PASSCODE = '092226';
const state = {
  hearts: 47,
  capsuleMsgs: [],
  futureMsgs: [],
  gpMsgs: [],
  playing: false
};

function checkPasscode() {
  const input = document.getElementById('pc-input');
  const error = document.getElementById('pc-error');
  const passcodeScreen = document.getElementById('passcode-screen');

  if (input.value.trim() === CORRECT_PASSCODE) {
    passcodeScreen.classList.add('hidden');
    error.textContent = '';
  } else {
    error.textContent = 'Incorrect passcode. Please try again.';
    input.value = '';
    input.focus();
  }
}

function initCanvas() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  const particles = [];

  function makeParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 1,
      opa: Math.random() * 0.7 + 0.1,
      speed: Math.random() * 0.4 + 0.1,
      drift: Math.random() * 0.8 - 0.4,
      angle: Math.random() * Math.PI * 2,
      type: Math.random() < 0.65 ? 'spark' : 'petal'
    };
  }

  for (let i = 0; i < 90; i += 1) {
    particles.push(makeParticle());
  }

  function drawParticle(particle) {
    ctx.save();
    ctx.globalAlpha = particle.opa;

    if (particle.type === 'spark') {
      ctx.fillStyle = Math.random() < 0.5 ? '#f0d060' : '#e8c84a';
      ctx.beginPath();
      const size = particle.size;
      ctx.moveTo(particle.x, particle.y - size);
      ctx.lineTo(particle.x + size * 0.3, particle.y - size * 0.3);
      ctx.lineTo(particle.x + size, particle.y);
      ctx.lineTo(particle.x + size * 0.3, particle.y + size * 0.3);
      ctx.lineTo(particle.x, particle.y + size);
      ctx.lineTo(particle.x - size * 0.3, particle.y + size * 0.3);
      ctx.lineTo(particle.x - size, particle.y);
      ctx.lineTo(particle.x - size * 0.3, particle.y - size * 0.3);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(230, 110, 130, 0.45)';
      ctx.beginPath();
      ctx.ellipse(particle.x, particle.y, particle.size * 2, particle.size * 3.5, particle.angle, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle) => {
      particle.y += particle.speed;
      particle.x += particle.drift;
      particle.angle += 0.008;
      particle.opa += Math.sin(Date.now() * 0.001 + particle.x) * 0.004;

      if (particle.y > canvas.height + 20 || particle.x < -30 || particle.x > canvas.width + 30) {
        const next = makeParticle();
        next.y = -10;
        Object.assign(particle, next);
      }

      drawParticle(particle);
    });

    requestAnimationFrame(animate);
  }

  animate();
}

function initCountdown() {
  function tick() {
    const target = new Date('2026-09-22T00:00:00');
    const now = new Date();
    let diff = Math.max(0, target - now);

    const days = Math.floor(diff / 86400000);
    diff -= days * 86400000;
    const hours = Math.floor(diff / 3600000);
    diff -= hours * 3600000;
    const mins = Math.floor(diff / 60000);
    diff -= mins * 60000;
    const secs = Math.floor(diff / 1000);

    document.getElementById('cd-days').textContent = String(days).padStart(3, '0');
    document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
    document.getElementById('cd-secs').textContent = String(secs).padStart(2, '0');
  }

  tick();
  setInterval(tick, 1000);
}

function initHeartCounter() {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      let count = 0;
      const element = document.getElementById('heart-count');
      const interval = setInterval(() => {
        count = Math.min(count + 1, state.hearts);
        element.textContent = count;
        if (count >= state.hearts) {
          clearInterval(interval);
        }
      }, 35);
      observer.disconnect();
    }
  });

  observer.observe(document.getElementById('hearts'));
}

function toggleMusicPanel() {
  const musicFloat = document.getElementById('musicFloat');
  musicFloat.classList.toggle('open');
}

function initMusic() {
  const audio = document.getElementById('weddingAudio');
  const playButton = document.getElementById('playBtn');
  const progress = document.getElementById('progress');
  const curTime = document.getElementById('cur-time');
  const totalTime = document.getElementById('tot-time');

  audio.addEventListener('loadedmetadata', () => {
    const total = audio.duration;
    const minutes = Math.floor(total / 60);
    const seconds = Math.floor(total % 60);
    totalTime.textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
  });

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const percent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = `${percent}%`;
    const minutes = Math.floor(audio.currentTime / 60);
    const seconds = Math.floor(audio.currentTime % 60);
    curTime.textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
  });

  audio.addEventListener('ended', () => {
    state.playing = false;
    playButton.textContent = '▶';
    progress.style.width = '0%';
  });

  window.togglePlay = () => {
    if (state.playing) {
      audio.pause();
      state.playing = false;
      playButton.textContent = '▶';
    } else {
      audio.play().catch(() => {
        playButton.textContent = '▶';
      });
      state.playing = true;
      playButton.textContent = '⏸';
    }
  };

  window.seekSong = (event) => {
    if (!audio.duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    audio.currentTime = ((event.clientX - rect.left) / rect.width) * audio.duration;
  };
}

function updateCapsule() {
  const countElement = document.getElementById('capsule-count');
  const box = document.getElementById('capsule-msgs');
  const count = state.capsuleMsgs.length;

  countElement.textContent = `${count} message${count !== 1 ? 's' : ''} sealed inside ✦`;
  box.innerHTML = '';

  state.capsuleMsgs.forEach((message) => {
    const item = document.createElement('div');
    item.className = 'capsule-msg';
    item.innerHTML = `<p>${escapeHtml(message.msg)}</p><div class="capsule-msg-from">— ${escapeHtml(message.name)} · ${message.time}</div>`;
    box.appendChild(item);
  });
}

function toggleCapsule() {
  const messages = document.getElementById('capsule-msgs');
  const button = document.getElementById('capsule-btn');
  const isOpen = messages.style.display === 'block';

  messages.style.display = isOpen ? 'none' : 'block';
  button.textContent = isOpen ? 'Peek Inside (Host View) ▾' : 'Close Capsule ▲';
}

function renderGodparents() {
  const box = document.getElementById('gp-messages');
  box.innerHTML = '<h3 style="font-family:Playfair Display,serif;font-size:19px;color:var(--yellow-light);font-style:italic;text-align:center;margin-bottom:18px">Blessings Received</h3>';

  state.gpMsgs.forEach((message) => {
    const item = document.createElement('div');
    item.className = 'gp-msg';
    item.innerHTML = `<div class="gp-msg-name">${escapeHtml(message.name)}</div><div class="gp-msg-role">Beloved Godparent</div><p class="gp-msg-text">${escapeHtml(message.msg)}</p>`;
    box.appendChild(item);
  });
}

function renderFuture() {
  const wall = document.getElementById('future-wall');
  wall.innerHTML = '';

  state.futureMsgs.forEach((message) => {
    const item = document.createElement('div');
    item.className = 'future-note';
    item.innerHTML = `<div class="future-note-year">${escapeHtml(message.year)}</div><p>"${escapeHtml(message.msg)}"</p><div class="future-note-from">— ${escapeHtml(message.name)}</div>`;
    wall.appendChild(item);
  });
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function submitRSVP() {
  const name = document.getElementById('rsvp-name').value.trim();
  const message = document.getElementById('rsvp-msg').value.trim();
  const attendance = document.querySelector('input[name="attend"]:checked').value;
  const guests = parseInt(document.getElementById('rsvp-guests').value, 10) || 1;

  if (!name) {
    alert('Please enter your name.');
    return;
  }

  if (attendance === 'yes') {
    state.hearts += guests;
    document.getElementById('heart-count').textContent = state.hearts;
    if (message) {
      state.capsuleMsgs.push({ name, msg: message, time: new Date().toLocaleDateString() });
      updateCapsule();
    }
    document.getElementById('rsvp-success').style.display = 'block';
    document.getElementById('rsvp-decline').style.display = 'none';
  } else {
    document.getElementById('rsvp-success').style.display = 'none';
    document.getElementById('rsvp-decline').style.display = 'block';
  }

  document.getElementById('rsvpModal').classList.add('open');
  document.getElementById('rsvp-name').value = '';
  document.getElementById('rsvp-email').value = '';
  document.getElementById('rsvp-msg').value = '';
}

function submitGodparent() {
  const name = document.getElementById('gp-name').value.trim();
  const message = document.getElementById('gp-msg').value.trim();

  if (!name || !message) {
    alert('Please fill in your name and blessing.');
    return;
  }

  state.gpMsgs.push({ name, msg: message });
  renderGodparents();
  document.getElementById('gp-name').value = '';
  document.getElementById('gp-msg').value = '';
}

function submitFuture() {
  const name = document.getElementById('fut-name').value.trim();
  const message = document.getElementById('fut-msg').value.trim();
  const year = document.getElementById('fut-year').value;

  if (!name || !message) {
    alert('Please fill in your name and message.');
    return;
  }

  state.futureMsgs.push({ name, msg: message, year });
  renderFuture();
  document.getElementById('fut-name').value = '';
  document.getElementById('fut-msg').value = '';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function goTo(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

window.checkPasscode = checkPasscode;
window.submitRSVP = submitRSVP;
window.submitGodparent = submitGodparent;
window.submitFuture = submitFuture;
window.closeModal = closeModal;
window.goTo = goTo;
window.toggleCapsule = toggleCapsule;
window.toggleMusicPanel = toggleMusicPanel;

initCanvas();
initCountdown();
initHeartCounter();
initMusic();
updateCapsule();
renderGodparents();
renderFuture();
