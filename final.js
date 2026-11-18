import { attachTeachingVideo } from './teaching-video.js?v=da5ff88279ed';

export function openFinal({ stage, art, button, graphicButton, announce, complete, back, pauseMusic, resumeMusic }) {
  const requests = [
    { animal: 'arnab', food: 'lobak' },
    { animal: 'monyet', food: 'pisang' },
    { animal: 'rusa', food: 'epal' },
  ].map(request => ({ ...request, quantity: 1 + Math.floor(Math.random() * 10) }));
  let round = 0;
  let screen;
  let tutorialVideo;
  let audio;
  let queue = [];
  let timer;
  let cancelDrag = () => {};

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
    current.play().catch(() => { announce('Tekan nombor dalam dialog untuk mendengarnya.'); finish(); });
  }

  function exit() { stop(); back(); resumeMusic(); }

  function page() {
    stop();
    screen = stage();
    screen.classList.add('final-screen');
    const home = graphicButton('Homepage/finish/peta.png', 'Kembali ke peta', exit);
    home.classList.add('final-home');
    screen.append(home);
  }

  function panel(path) {
    const element = document.createElement('div');
    element.className = 'final-panel';
    const picture = art(path);
    picture.classList.add('final-board');
    element.append(picture);
    screen.append(element);
    return element;
  }

  function start() {
    pauseMusic();
    page();
    const board = panel('final/start game/start final.png');
    tutorialVideo = attachTeachingVideo(board, 'Teaching Video/Teaching Video Final Level.mp4', 'Video panduan misi akhir');
    board.setAttribute('aria-label', 'Jamuan rimba!');
    const begin = graphicButton('final/start game/start button.png', 'Mula misi akhir', nextAnimal);
    begin.classList.add('final-start');
    board.append(begin);
    begin.focus();
  }

  function nextAnimal() {
    page();
    const request = requests[round];
    let phase = 'packing';
    let selected = null;
    let dragging = null;
    const packed = [];
    const guest = document.createElement('div');
    guest.className = 'final-guest';
    const picture = document.createElement('img');
    picture.src = `final/animal/dialog ${request.animal}.png`;
    picture.alt = `${request.animal} mahu ${request.quantity} ${request.food}.`;
    picture.draggable = false;
    const number = graphicButton(`final/number/number (${request.quantity}).png`, `Dengar permintaan ${request.quantity} ${request.food}`, () => speak(`final/audio/number/${request.quantity}.mp3`));
    number.classList.add('final-request');
    guest.append(picture, number);
    const basket = graphicButton('final/element/bakul.png', 'Bakul makanan', () => { if (selected) deposit(selected); });
    basket.classList.add('final-basket');
    const contents = document.createElement('span');
    contents.className = 'final-contents';
    contents.setAttribute('aria-hidden', 'true');
    basket.append(contents);
    const foods = document.createElement('div');
    foods.className = 'final-foods';
    ['pisang', 'lobak', 'epal'].forEach(kind => {
      const row = document.createElement('div');
      row.className = 'final-food-row';
      row.setAttribute('role', 'group');
      row.setAttribute('aria-label', kind);
      for (let i = 0; i < 10; i++) {
        const food = graphicButton(`l3/fruit/buah ${kind}.png`, `${kind} ${i + 1}. Seret ke bakul`, () => {
          if (phase !== 'packing' || food.hidden) return;
          selected?.setAttribute('aria-pressed', 'false');
          selected = food;
          food.setAttribute('aria-pressed', 'true');
          announce('Tekan bakul untuk memasukkan makanan yang dipilih.');
        });
        food.classList.add('final-food');
        food.dataset.kind = kind;
        food.setAttribute('aria-pressed', 'false');
        food.addEventListener('pointerdown', event => {
          if (event.button !== 0 || phase !== 'packing' || dragging) return;
          dragging = { food, pointerId: event.pointerId, x: event.clientX, y: event.clientY };
          food.setPointerCapture(event.pointerId);
          food.classList.add('final-dragging');
          basket.classList.add('final-drop-ready');
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
        row.append(food);
      }
      foods.append(row);
    });

    cancelDrag = () => {
      if (!dragging) return;
      const { food, pointerId } = dragging;
      dragging = null;
      food.style.transform = '';
      food.classList.remove('final-dragging');
      basket.classList.remove('final-drop-ready');
      if (food.hasPointerCapture(pointerId)) food.releasePointerCapture(pointerId);
    };

    function deposit(food) {
      if (phase !== 'packing' || food.hidden) return;
      selected?.setAttribute('aria-pressed', 'false');
      selected = null;
      food.setAttribute('aria-pressed', 'false');
      if (food.dataset.kind !== request.food) {
        speak('final/audio/wrong effect.mp3');
        announce(`Cuba lagi. ${request.animal} mahu ${request.food}.`);
        return;
      }
      food.hidden = true;
      packed.push(food);
      contents.append(art(`l3/fruit/buah ${request.food}.png`));
      speak(`final/audio/number/${packed.length}.mp3`);
      announce(`${packed.length} ${request.food} di dalam bakul.`);
      basket.focus();
    }

    const confirm = graphicButton('tick.png', 'Semak makanan', () => {
      if (phase !== 'packing') return;
      cancelDrag();
      stop();
      if (packed.length !== request.quantity) {
        packed.forEach(food => { food.hidden = false; food.setAttribute('aria-pressed', 'false'); });
        packed.length = 0;
        selected?.setAttribute('aria-pressed', 'false');
        selected = null;
        contents.replaceChildren();
        speak('final/audio/wrong effect.mp3');
        announce('Cuba lagi. Semua makanan kembali ke meja.');
        return;
      }
      phase = 'feedback';
      foods.inert = true;
      basket.disabled = true;
      confirm.disabled = true;
      number.disabled = true;
      const feedback = art('final/element/betul.png', 'Betul!');
      feedback.classList.add('final-feedback');
      screen.append(feedback);
      announce('Betul!');
      speak('final/audio/betul.mp3', () => {
        timer = setTimeout(() => {
          round++;
          if (round === requests.length) finish(); else nextAnimal();
        }, 1200);
      });
    });
    confirm.classList.add('final-confirm');
    screen.append(guest, foods, basket, confirm);
    number.focus();
    announce(`${request.animal} mahu ${request.quantity} ${request.food}.`);
    speak(`final/audio/number/${request.quantity}.mp3`);
  }

  function finish() {
    complete();
    page();
    const board = panel('final/Done Level Page/siap.png');
    board.setAttribute('aria-label', 'Tahniah! Anda telah berjaya!');
    const replay = graphicButton('final/Done Level Page/siap semula.png', 'Semula', () => {
      stop();
      openFinal({ stage, art, button, graphicButton, announce, complete, back, pauseMusic, resumeMusic });
    });
    replay.classList.add('final-replay');
    const onward = graphicButton('final/Done Level Page/siap seterusnya.png', 'Seterusnya', exit);
    onward.classList.add('final-next');
    board.append(replay, onward);
    announce('Tahniah! Misi akhir selesai.');
    speak('final/Done Level Page/done.mp3');
    onward.focus();
  }

  start();
}
