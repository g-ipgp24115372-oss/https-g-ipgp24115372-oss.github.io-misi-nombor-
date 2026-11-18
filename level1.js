import { attachTeachingVideo } from './teaching-video.js?v=da5ff88279ed';

export function openLevel1({ stage, art, button, graphicButton, announce, complete, back, pauseMusic, resumeMusic }) {
  let screen;
  let tutorialVideo;
  let round = 0;
  let locked = false;
  let audio;
  let timer;
  const targets = Array.from({ length: 10 }, (_, i) => i + 1);
  for (let i = targets.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [targets[i], targets[j]] = [targets[j], targets[i]];
  }

  function stopAudio() {
    tutorialVideo?.pause();
    if (audio) { audio.pause(); audio.currentTime = 0; }
  }

  function play(path) {
    stopAudio();
    audio = new Audio(path);
    audio.play().catch(() => announce('Tekan ikon pembesar suara untuk mendengar nombor.'));
  }

  function exit() {
    clearTimeout(timer);
    stopAudio();
    back();
    resumeMusic();
  }

  function page(game = false) {
    clearTimeout(timer);
    stopAudio();
    screen = stage();
    screen.classList.add('level-one');
    if (game) screen.classList.add('level-one-playing');
    const controls = document.createElement('div');
    controls.className = 'level-controls';
    const home = graphicButton('Homepage/finish/peta.png', 'Kembali ke peta', exit);
    home.classList.add('level-home');
    controls.append(home);
    screen.append(controls);
    return screen;
  }

  function panel(path) {
    const element = document.createElement('div');
    element.className = 'level-panel';
    const board = art(path);
    board.classList.add('panel-art');
    element.append(board);
    screen.append(element);
    return element;
  }

  function start() {
    pauseMusic();
    page();
    const board = panel('l1/start game/start.png');
    tutorialVideo = attachTeachingVideo(board, 'Teaching Video/Teaching Video Level 1.mp4', 'Video panduan Tahap 1');
    board.setAttribute('aria-label', 'Mana nombor?');
    const begin = graphicButton('l1/start game/start button.png', 'Mula Tahap 1', () => {
      round = 0;
      nextRound();
    });
    begin.classList.add('level-start');
    board.append(begin);
    begin.focus();
  }

  function nextRound() {
    page(true);
    locked = false;
    const target = targets[round];
    const stars = document.createElement('div');
    stars.className = 'target-stars';
    stars.setAttribute('role', 'img');
    stars.setAttribute('aria-label', `${target} bintang`);
    for (let i = 0; i < target; i++) stars.append(art('l1/element/bintang.png'));
    const replay = graphicButton('l1/element/audio.png', 'Dengar nombor sasaran', () => {
      announce(`Cari semua haiwan dengan nombor ${target}.`);
      play(`l1/audio/number/${target}.mp3`);
    });
    replay.classList.add('target-audio');
    const field = document.createElement('div');
    field.className = 'animal-field';
    const targetCount = 2 + Math.floor(Math.random() * 3);
    let remaining = targetCount;
    const numbers = Array.from({ length: 10 }, (_, i) => {
      if (i < targetCount) return target;
      const other = 1 + Math.floor(Math.random() * 9);
      return other >= target ? other + 1 : other;
    });
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    numbers.forEach((number, i) => {
      const species = ['arnab', 'monyet', 'rusa'][Math.floor(Math.random() * 3)];
      let found = false;
      const animal = button('', () => {
        if (locked || found) return;
        if (number !== target) {
          play('l1/audio/wrong effect.mp3');
          announce('Cuba lagi.');
          return;
        }
        found = true;
        remaining--;
        animal.classList.add('found');
        animal.setAttribute('aria-pressed', 'true');
        play(`l1/audio/number/${number}.mp3`);
        announce(`Betul. ${remaining} haiwan lagi.`);
        if (remaining === 0) {
          locked = true;
          field.inert = true;
          timer = setTimeout(() => {
            const feedback = art('l1/element/betul.png', 'Betul!');
            feedback.classList.add('round-feedback');
            screen.append(feedback);
            play('l1/audio/betul.mp3');
            announce('Betul!');
            timer = setTimeout(() => {
              round++;
              if (round === 3) finish(); else nextRound();
            }, 2000);
          }, 800);
        }
      }, 'animal-choice');
      animal.setAttribute('aria-label', `${species}, nombor ${number}`);
      animal.setAttribute('aria-pressed', 'false');
      animal.style.setProperty('--pace', `${7 + Math.random() * 5}s`);
      animal.style.setProperty('--delay', `${-Math.random() * 8}s`);
      const body = art(`l1/animal/animal ${species}.png`);
      body.classList.add('animal-body');
      const badge = art(`l1/number/number (${number}).png`);
      badge.classList.add('animal-number');
      animal.append(body, badge);
      field.append(animal);
    });
    screen.append(stars, replay, field);
    announce(`Pusingan ${round + 1}. Cari semua haiwan dengan nombor ${target}.`);
    replay.focus();
    play(`l1/audio/number/${target}.mp3`);
  }

  function finish() {
    complete();
    page();
    const board = panel('l1/Done Level Page/siap.png');
    board.setAttribute('role', 'region');
    board.setAttribute('aria-label', 'Tahniah! Anda telah berjaya!');
    const replay = graphicButton('l1/Done Level Page/siap semula.png', 'Semula', () => {
      stopAudio();
      openLevel1({ stage, art, button, graphicButton, announce, complete, back, pauseMusic, resumeMusic });
    });
    replay.classList.add('level-replay');
    const onward = graphicButton('l1/Done Level Page/siap seterusnya.png', 'Seterusnya', exit);
    onward.classList.add('level-next');
    board.append(replay, onward);
    play('l1/Done Level Page/done.mp3');
    announce('Tahniah! Tahap 1 selesai. Tahap 2 dibuka.');
    onward.focus();
  }

  start();
}
