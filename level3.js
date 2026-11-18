import { attachTeachingVideo } from './teaching-video.js?v=da5ff88279ed';

export function openLevel3({ stage, art, button, graphicButton, announce, complete, back, pauseMusic, resumeMusic }) {
  let screen;
  let tutorialVideo;
  let round = 0;
  let audio;
  let queue = [];
  let timer;
  let cancelDrag = () => {};
  const targets = shuffle(Array.from({ length: 10 }, (_, i) => i + 1)).slice(0, 3);

  function shuffle(values) {
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
    return values;
  }

  function stop() {
    tutorialVideo?.pause();
    clearTimeout(timer);
    cancelDrag();
    queue = [];
    if (audio) { audio.onended = null; audio.onerror = null; audio.pause(); audio = null; }
  }

  function speak(path, done) {
    queue.push({ path, done });
    if (!audio) drain();
  }

  function drain() {
    const next = queue.shift();
    if (!next) return;
    const current = new Audio(next.path);
    audio = current;
    let ended = false;
    const finish = () => {
      if (ended || audio !== current) return;
      ended = true;
      audio = null;
      next.done?.();
      if (!audio) drain();
    };
    current.onended = finish;
    current.onerror = finish;
    current.play().catch(() => { announce('Tekan nombor pada bakul untuk mendengarnya.'); finish(); });
  }

  function exit() { stop(); back(); resumeMusic(); }

  function page() {
    stop();
    screen = stage();
    screen.classList.add('l3-screen');
    const home = graphicButton('Homepage/finish/peta.png', 'Kembali ke peta', exit);
    home.classList.add('l3-home');
    screen.append(home);
  }

  function panel(path) {
    const element = document.createElement('div');
    element.className = 'l3-panel';
    const picture = art(path);
    picture.classList.add('l3-board');
    element.append(picture);
    screen.append(element);
    return element;
  }

  function start() {
    pauseMusic();
    page();
    const board = panel('l3/start game/start l3.png');
    tutorialVideo = attachTeachingVideo(board, 'Teaching Video/Teaching Video Level 3.mp4', 'Video panduan Tahap 3');
    board.setAttribute('aria-label', 'Berapa buah-buahan?');
    const begin = graphicButton('l3/start game/start button.png', 'Mula Tahap 3', nextRound);
    begin.classList.add('l3-start');
    board.append(begin);
    begin.focus();
  }

  function nextRound() {
    page();
    const target = targets[round];
    const kinds = ['pisang', 'lobak', 'epal'];
    const matchingKind = kinds[Math.floor(Math.random() * kinds.length)];
    const otherCounts = shuffle(Array.from({ length: 10 }, (_, i) => i + 1).filter(n => n !== target));
    let phase = 'choosing';
    let packed = 0;
    let selectedFood = null;
    let dragging = null;
    const basket = graphicButton(`l3/bakul/e bakul (${target}).png`, `Bakul nombor ${target}. Dengar nombor`, () => {
      if (selectedFood) deposit(selectedFood);
      else speak(`l3/audio/number/${target}.mp3`);
    });
    basket.classList.add('l3-basket');
    const contents = document.createElement('span');
    contents.className = 'l3-contents';
    contents.setAttribute('aria-hidden', 'true');
    basket.append(contents);
    const groups = document.createElement('div');
    groups.className = 'l3-groups';
    screen.append(basket, groups);
    kinds.forEach(kind => {
      const quantity = kind === matchingKind ? target : otherCounts.pop();
      const row = document.createElement('div');
      row.className = 'l3-row';
      row.style.setProperty('--quantity', quantity);
      row.style.setProperty('--mobile-columns', Math.min(quantity, 5));
      const frame = art('l3/element/bingkai.png');
      frame.classList.add('l3-frame');
      const pick = button('', () => {
        if (phase !== 'choosing') return;
        if (quantity !== target) {
          speak('l3/audio/wrong effect.mp3');
          announce('Cuba lagi. Pilih kuantiti yang sama dengan nombor bakul.');
          return;
        }
        phase = 'selection-feedback';
        stop();
        groups.inert = true;
        basket.disabled = true;
        [...groups.children].forEach(other => { if (other !== row) other.remove(); });
        pick.remove();
        const foodList = document.createElement('div');
        foodList.className = 'l3-food-list';
        for (let i = 0; i < quantity; i++) {
          const food = graphicButton(`l3/fruit/buah ${kind}.png`, `${kind} ${i + 1}. Seret ke bakul`, () => {
            if (phase !== 'packing' || food.dataset.packed) return;
            selectedFood?.setAttribute('aria-pressed', 'false');
            selectedFood = food;
            food.setAttribute('aria-pressed', 'true');
            announce('Tekan bakul untuk memasukkan makanan yang dipilih.');
          });
          food.classList.add('l3-food');
          food.setAttribute('aria-pressed', 'false');
          food.dataset.kind = kind;
          food.addEventListener('pointerdown', event => {
            if (event.button !== 0 || phase !== 'packing' || dragging) return;
            dragging = { food, pointerId: event.pointerId, x: event.clientX, y: event.clientY };
            food.setPointerCapture(event.pointerId);
            food.classList.add('l3-dragging');
            basket.classList.add('l3-drop-ready');
          });
          food.addEventListener('pointermove', event => {
            if (dragging?.food !== food || dragging.pointerId !== event.pointerId) return;
            food.style.transform = `translate(${event.clientX - dragging.x}px, ${event.clientY - dragging.y}px)`;
          });
          food.addEventListener('pointerup', event => {
            if (dragging?.food !== food || dragging.pointerId !== event.pointerId) return;
            const box = basket.getBoundingClientRect();
            const inside = event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
            cancelDrag();
            if (inside) deposit(food);
          });
          food.addEventListener('pointercancel', () => { if (dragging?.food === food) cancelDrag(); });
          food.addEventListener('lostpointercapture', () => { if (dragging?.food === food) cancelDrag(); });
          foodList.append(food);
        }
        row.append(foodList);
        const feedback = art('l3/element/betul.png', 'Betul!');
        feedback.classList.add('l3-feedback');
        screen.append(feedback);
        announce('Betul!');
        speak('l3/audio/betul.mp3', () => {
          timer = setTimeout(() => {
            feedback.remove();
            phase = 'packing';
            groups.inert = false;
            basket.disabled = false;
            announce(`Seret ${kind} satu demi satu ke dalam bakul.`);
            foodList.querySelector('button').focus();
          }, 800);
        });
      }, 'l3-group-choice');
      pick.setAttribute('aria-label', `Pilih kumpulan ${quantity} ${kind}`);
      for (let i = 0; i < quantity; i++) pick.append(art(`l3/fruit/buah ${kind}.png`));
      row.append(frame, pick);
      groups.append(row);
    });

    cancelDrag = () => {
      if (!dragging) return;
      const { food, pointerId } = dragging;
      dragging = null;
      food.style.transform = '';
      food.classList.remove('l3-dragging');
      basket.classList.remove('l3-drop-ready');
      if (food.hasPointerCapture(pointerId)) food.releasePointerCapture(pointerId);
    };

    function deposit(food) {
      if (phase !== 'packing' || food.dataset.packed) return;
      food.dataset.packed = 'true';
      selectedFood = null;
      packed++;
      contents.append(art(`l3/fruit/buah ${food.dataset.kind}.png`));
      food.remove();
      announce(`${packed} makanan di dalam bakul.`);
      basket.focus();
      if (packed === target) {
        phase = 'waiting';
        groups.inert = true;
        basket.disabled = true;
        speak(`l3/audio/number/${packed}.mp3`, () => {
          const feedback = art('l3/element/betul.png', 'Betul!');
          feedback.classList.add('l3-feedback');
          screen.append(feedback);
          speak('l3/audio/betul.mp3', () => {
            timer = setTimeout(() => {
              round++;
              if (round === 3) finish(); else nextRound();
            }, 1200);
          });
        });
      } else speak(`l3/audio/number/${packed}.mp3`);
    }

    announce(`Pusingan ${round + 1}. Pilih kumpulan makanan yang sepadan dengan nombor ${target}.`);
    basket.focus();
    speak(`l3/audio/number/${target}.mp3`);
  }

  function finish() {
    complete();
    page();
    const board = panel('l3/Done Level Page/siap.png');
    board.setAttribute('aria-label', 'Tahniah! Anda telah berjaya!');
    const replay = graphicButton('l3/Done Level Page/siap semula.png', 'Semula', () => {
      stop();
      openLevel3({ stage, art, button, graphicButton, announce, complete, back, pauseMusic, resumeMusic });
    });
    replay.classList.add('l3-replay');
    const onward = graphicButton('l3/Done Level Page/siap seterusnya.png', 'Seterusnya', exit);
    onward.classList.add('l3-next');
    board.append(replay, onward);
    announce('Tahniah! Tahap 3 selesai. Misi akhir dibuka.');
    speak('l3/Done Level Page/done.mp3');
    onward.focus();
  }

  start();
}
