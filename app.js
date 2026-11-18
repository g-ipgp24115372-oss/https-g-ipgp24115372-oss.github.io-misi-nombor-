import assets from './assets.js';
import { openLevel1 } from './level1.js?v=a336104ee6bb';
import { openLevel2 } from './level2.js?v=6565f2c29b4f';
import { openLevel3 } from './level3.js?v=ffab25ea6ea3';
import { openFinal } from './final.js?v=0b08632023c9';

const app = document.querySelector('#app');
const storageKey = 'misi-nombor-v1';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { /* Start with a fresh profile if stored data is unavailable. */ }
const state = {
  name: typeof saved.name === 'string' ? saved.name.slice(0, 24) : '',
  character: saved.character === 'perempuan' ? 'perempuan' : 'lelaki',
  completed: Array.isArray(saved.completed) ? [...new Set(saved.completed.filter(n => [1, 2, 3, 4].includes(n)))] : [],
  music: saved.music === true,
};
const bgm = new Audio('Homepage/bgm.mp4');
bgm.loop = true;
bgm.volume = 0.3;
let toastTimer;
let travelTimer;
let position = 230;

function persist() {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); }
  catch { announce('Kemajuan tidak dapat disimpan pada pelayar ini.'); }
}

function announce(message) { document.querySelector('#announcement').textContent = message; }

function art(path, label = '') {
  const { size: [width, height], box: [left, top, right, bottom] } = assets[path];
  const w = right - left;
  const h = bottom - top;
  const element = document.createElement('span');
  element.className = 'asset';
  element.style.aspectRatio = `${w}/${h}`;
  const img = document.createElement('img');
  img.src = path;
  img.alt = label;
  img.draggable = false;
  Object.assign(img.style, { width: `${width / w * 100}%`, height: `${height / h * 100}%`, left: `${-left / w * 100}%`, top: `${-top / h * 100}%` });
  element.append(img);
  return element;
}

function button(label, handler, className = 'wood-button') {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = className;
  element.textContent = label;
  element.addEventListener('click', handler);
  return element;
}

function graphicButton(path, label, handler) {
  const element = button('', handler, 'graphic-button');
  element.setAttribute('aria-label', label);
  element.append(art(path));
  return element;
}

function stage() {
  cancelAnimationFrame(travelTimer);
  app.replaceChildren();
  const element = document.createElement('section');
  element.className = 'stage';
  app.append(element);
  return element;
}

function syncMusic() {
  if (!state.music) { bgm.pause(); return; }
  bgm.play().catch(() => announce('Tekan butang muzik untuk memainkan muzik latar.'));
}

const revised = 'Homepage/修正 homepage/';

function placeLayer(element, path) {
  const [left, top, right, bottom] = assets[path].box;
  Object.assign(element.style, {
    left: `${(left - 274) / 1431 * 100}%`,
    top: `${(top - 54) / 932 * 100}%`,
    width: `${(right - left) / 1431 * 100}%`,
    height: `${(bottom - top) / 932 * 100}%`,
  });
  return element;
}

function nameField(path, value) {
  const field = document.createElement('div');
  field.className = 'name-field';
  placeLayer(field, path);
  field.append(art(path));
  const input = document.createElement('input');
  input.setAttribute('aria-label', 'Nama pemain');
  input.placeholder = 'Nama kamu';
  input.maxLength = 24;
  input.autocomplete = 'given-name';
  input.value = value;
  field.append(input);
  return { field, input };
}

function login() {
  bgm.pause();
  const screen = stage();
  const panel = document.createElement('div');
  panel.className = 'panel';
  const picture = art(revised + 'log in.png');
  picture.classList.add('panel-art');
  const form = document.createElement('form');
  form.className = 'login-form';
  form.setAttribute('aria-label', 'Selamat datang ke Misi Nombor');
  const choices = ['lelaki', 'perempuan'].map((character, index) => {
    const path = revised + `log in (${index === 0 ? 3 : 2}).png`;
    const choice = graphicButton(path, `Pilih watak ${character}`, () => {
      state.character = character;
      choices.forEach((item, i) => item.setAttribute('aria-pressed', String(i === index)));
    });
    choice.classList.add('gender-choice');
    placeLayer(choice, path);
    choice.setAttribute('aria-pressed', String(state.character === character));
    return choice;
  });
  const { field, input } = nameField(revised + 'log in (4).png', state.name);
  const error = placeLayer(art(revised + 'log in (5).png', 'Sila masukkan nama.'), revised + 'log in (5).png');
  error.classList.add('name-error');
  error.hidden = true;
  const start = button('', () => {}, 'start-hit');
  start.type = 'submit';
  start.setAttribute('aria-label', 'Mula pengembaraan');
  input.addEventListener('input', () => { error.hidden = true; input.removeAttribute('aria-invalid'); });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!input.value.trim()) {
      error.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      announce('Sila masukkan nama.');
      input.focus();
      return;
    }
    state.name = input.value.trim();
    persist();
    map();
    syncMusic();
  });
  form.append(...choices, field, error, start);
  panel.append(picture, form);
  screen.append(panel);
}

function toast(message) {
  clearTimeout(toastTimer);
  document.querySelector('.toast')?.remove();
  const element = document.createElement('div');
  element.className = 'toast';
  element.setAttribute('role', 'status');
  element.textContent = message;
  document.querySelector('.stage').append(element);
  toastTimer = setTimeout(() => element.remove(), 3500);
}

function map(celebrate = false) {
  const screen = stage();
  const world = document.createElement('div');
  world.className = 'world';
  world.tabIndex = 0;
  world.setAttribute('aria-label', 'Peta pengembaraan. Gunakan anak panah untuk bergerak.');
  const landscape = document.createElement('div');
  landscape.className = 'landscape';
  const road = document.createElement('img');
  road.src = revised + 'e rumah.png';
  road.alt = '';
  road.className = 'road';
  road.draggable = false;
  landscape.append(road);
  const explorer = art(`character/${state.character}.png`);
  explorer.classList.add('explorer');
  explorer.style.left = `${position}px`;
  landscape.append(explorer);
  const titles = ['Cari Nombor', 'Kira Haiwan', 'Padan Kuantiti', 'Bantu Haiwan'];
  for (let level = 1; level <= 4; level++) {
    const unlocked = level === 1 || state.completed.includes(level - 1);
    const path = unlocked ? `Homepage/mission number/${level}.png` : `Homepage/locked mission number/lock (${level}).png`;
    const sign = graphicButton(path, `Misi ${level}, ${titles[level - 1]}${unlocked ? '' : ', dikunci'}`, () => {
      if (!unlocked) { toast(`Selesaikan Misi ${level - 1} dahulu.`); return; }
      if (level === 1) {
        openLevel1({
          stage, art, button, graphicButton, announce,
          complete: () => {
            if (!state.completed.includes(1)) state.completed.push(1);
            persist();
          },
          back: map,
          pauseMusic: () => bgm.pause(),
          resumeMusic: syncMusic,
        });
        return;
      }
      if (level === 2) {
        openLevel2({
          stage, art, button, graphicButton, announce,
          complete: () => {
            if (!state.completed.includes(2)) state.completed.push(2);
            persist();
          },
          back: map,
          pauseMusic: () => bgm.pause(),
          resumeMusic: syncMusic,
        });
        return;
      }
      if (level === 3) {
        openLevel3({
          stage, art, button, graphicButton, announce,
          complete: () => {
            if (!state.completed.includes(3)) state.completed.push(3);
            persist();
          },
          back: map,
          pauseMusic: () => bgm.pause(),
          resumeMusic: syncMusic,
        });
        return;
      }
      openFinal({
        stage, art, button, graphicButton, announce,
        complete: () => {
          if (!state.completed.includes(4)) state.completed.push(4);
          persist();
        },
        back: () => map(true),
        pauseMusic: () => bgm.pause(),
        resumeMusic: () => { if (!document.querySelector('.achievement-shade')) syncMusic(); },
      });
    });
    sign.classList.add('sign');
    sign.setAttribute('aria-disabled', String(!unlocked));
    if (state.completed.includes(level)) sign.classList.add('completed');
    sign.style.left = `${level * 370 + 240}px`;
    landscape.append(sign);
  }
  world.append(landscape);
  const hud = document.createElement('div');
  hud.className = 'hud';
  const profile = button('', editProfile, 'profile');
  profile.setAttribute('aria-label', `Profil ${state.name}. Ubah maklumat pemain`);
  profile.append(art(`Homepage/profile/pro ${state.character}.png`));
  const name = document.createElement('strong');
  name.className = 'profile-name';
  name.textContent = state.name;
  profile.append(name);
  const tools = document.createElement('div');
  tools.className = 'tools';
  const sound = graphicButton(`Homepage/sound/suara ${state.music ? 'on' : 'off'}.png`, state.music ? 'Tutup muzik' : 'Main muzik', () => {
    state.music = !state.music;
    persist();
    syncMusic();
    sound.replaceChildren(art(`Homepage/sound/suara ${state.music ? 'on' : 'off'}.png`));
    sound.setAttribute('aria-label', state.music ? 'Tutup muzik' : 'Main muzik');
    sound.setAttribute('aria-pressed', String(state.music));
  });
  sound.setAttribute('aria-pressed', String(state.music));
  tools.append(graphicButton('Homepage/info/info.png', 'Maklumat pemain', editProfile), sound);
  hud.append(profile, tools);
  const bottom = document.createElement('div');
  bottom.className = 'map-bottom';
  const arrows = document.createElement('div');
  arrows.className = 'arrows';
  const back = button('←', () => travel(position - 160));
  back.setAttribute('aria-label', 'Berjalan ke kiri');
  const forward = button('→', () => travel(position + 160));
  forward.setAttribute('aria-label', 'Berjalan ke kanan');
  arrows.append(back, forward);
  bottom.append(arrows);
  screen.append(world, hud, bottom);
  if ([1, 2, 3, 4].every(level => state.completed.includes(level))) {
    const achievement = graphicButton('Homepage/finish/pencapaian.png', 'Pencapaian', showAchievement);
    achievement.classList.add('achievement-button');
    bottom.prepend(achievement);
    bottom.style.justifyContent = 'space-between';
    if (celebrate === true) showAchievement();
  }
  world.scrollLeft = Math.max(0, position - screen.clientWidth / 3);
  world.addEventListener('keydown', event => {
    if (event.target !== world) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      travel(position + (event.key === 'ArrowRight' ? 200 : -200));
    }
  });
  function travel(next) {
    const start = position;
    const destination = Math.max(200, Math.min(1740, next));
    if (destination === start) return;
    cancelAnimationFrame(travelTimer);
    const duration = Math.max(900, Math.abs(destination - start) / 70 * 1000);
    let began;
    explorer.classList.add('walking');
    function step(now) {
      began ??= now;
      const fraction = Math.min(1, (now - began) / duration);
      position = start + (destination - start) * fraction;
      explorer.style.left = `${position}px`;
      world.scrollLeft = Math.max(0, position - screen.clientWidth / 3);
      if (fraction < 1) travelTimer = requestAnimationFrame(step);
      else explorer.classList.remove('walking');
    }
    travelTimer = requestAnimationFrame(step);
  }
}

function showAchievement() {
  const screen = document.querySelector('.stage');
  if (screen.querySelector('.achievement-shade')) return;
  bgm.pause();
  const celebration = new Audio('Homepage/finish/finish.mp3');
  celebration.play().catch(() => announce('Tahniah! Semua misi selesai.'));
  const background = [...screen.children];
  background.forEach(element => { element.inert = true; });
  const overlay = document.createElement('div');
  overlay.className = 'achievement-shade';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Tahniah! Semua misi selesai.');
  const picture = art('Homepage/finish/finish.png', 'Tahniah! Anda telah berjaya!');
  picture.classList.add('achievement-image');
  const board = document.createElement('div');
  board.className = 'achievement-board';
  const player = document.createElement('div');
  player.className = 'achievement-profile';
  player.setAttribute('role', 'group');
  player.setAttribute('aria-label', `Pemain ${state.name}, watak ${state.character}`);
  player.append(art(`Homepage/profile/pro ${state.character}.png`));
  const playerName = document.createElement('strong');
  playerName.className = 'profile-name';
  playerName.textContent = state.name;
  playerName.title = state.name;
  player.append(playerName);
  board.append(picture, player);
  const close = graphicButton('Homepage/finish/kembali.png', 'Kembali ke peta', () => {
    celebration.pause();
    overlay.remove();
    background.forEach(element => { element.inert = false; });
    screen.querySelector('.profile').focus();
    syncMusic();
  });
  close.classList.add('achievement-return');
  overlay.append(board, close);
  overlay.addEventListener('keydown', event => {
    if (event.key === 'Escape') close.click();
    if (event.key === 'Tab') { event.preventDefault(); close.focus(); }
  });
  screen.append(overlay);
  close.focus();
  announce('Tahniah! Semua misi selesai.');
}

function editProfile() {
  const previous = document.activeElement;
  const screen = document.querySelector('.stage');
  const background = [...screen.children];
  background.forEach(element => { element.inert = true; });
  const shade = document.createElement('div');
  shade.className = 'shade';
  const dialog = document.createElement('form');
  dialog.className = 'info-panel';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', 'Informasi pemain');
  const board = art(revised + 'info perempuan.png');
  board.classList.add('panel-art');
  const portraitPath = revised + (state.character === 'perempuan' ? 'info perempuan (2).png' : 'info lelaki.png');
  const portrait = placeLayer(art(portraitPath, `Watak ${state.character}`), portraitPath);
  portrait.classList.add('info-portrait');
  const { field, input } = nameField(revised + 'info nama.png', state.name);
  const save = button('', () => {}, 'continue-hit');
  save.type = 'submit';
  save.setAttribute('aria-label', 'Terus ke halaman utama');
  const close = () => {
    shade.remove();
    background.forEach(element => { element.inert = false; });
    previous?.focus();
  };
  dialog.addEventListener('submit', event => {
    event.preventDefault();
    if (!input.value.trim()) { input.setCustomValidity('Sila masukkan nama.'); input.reportValidity(); return; }
    state.name = input.value.trim();
    persist();
    map();
    document.querySelector('.profile')?.focus();
  });
  input.addEventListener('input', () => input.setCustomValidity(''));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
    if (event.key === 'Tab') {
      event.preventDefault();
      (document.activeElement === input ? save : input).focus();
    }
  });
  dialog.append(board, portrait, field, save);
  shade.append(dialog);
  screen.append(shade);
  input.focus();
}

if (state.name) map(); else login();
