import { attachTeachingVideo } from './teaching-video.js?v=da5ff88279ed';

export function openLevel2({ stage, art, button, graphicButton, announce, complete, back, pauseMusic, resumeMusic }) {
  const species = shuffle(['arnab', 'monyet', 'rusa']);
  const targets = shuffle(Array.from({ length: 10 }, (_, i) => i + 1)).slice(0, 3);
  let round = 0;
  let screen;
  let tutorialVideo;
  let audio;
  let queue = [];
  let timer;

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
    let finished = false;
    function finish() {
      if (finished || audio !== current) return;
      finished = true;
      audio = null;
      next.done?.();
      if (!audio) drain();
    }
    current.onended = finish;
    current.onerror = finish;
    current.play().catch(() => {
      announce('Tekan pembesar suara untuk mendengar soalan.');
      finish();
    });
  }

  function exit() { stop(); back(); resumeMusic(); }

  function page() {
    stop();
    screen = stage();
    screen.classList.add('l2-screen');
    const home = graphicButton('Homepage/finish/peta.png', 'Kembali ke peta', exit);
    home.classList.add('l2-home');
    screen.append(home);
  }

  function panel(path) {
    const element = document.createElement('div');
    element.className = 'l2-panel';
    const board = art(path);
    board.classList.add('l2-board');
    element.append(board);
    screen.append(element);
    return element;
  }

  function start() {
    pauseMusic();
    page();
    const board = panel('l2/start game/start l2.png');
    tutorialVideo = attachTeachingVideo(board, 'Teaching Video/Teaching Video Level 2.mp4', 'Video panduan Tahap 2');
    board.setAttribute('aria-label', 'Jom kira haiwan!');
    const begin = graphicButton('l2/start game/start button.png', 'Mula Tahap 2', nextRound);
    begin.classList.add('l2-start');
    board.append(begin);
    begin.focus();
  }

  function nextRound() {
    page();
    const target = targets[round];
    const kind = species[round];
    let counted = 0;
    let phase = 'counting';
    const heading = document.createElement('div');
    heading.className = 'l2-heading';
    heading.append(art(`l2/soalan/soalan ${kind}.png`));
    const prompt = graphicButton(`l2/soalan/soalan (${target}).png`, `Dengar nombor sasaran ${target}`, () => speak(`l2/audio/number/${target}.mp3`));
    prompt.classList.add('l2-prompt-number');
    heading.append(prompt);
    const field = document.createElement('div');
    field.className = 'l2-field';
    const animalTotal = target <= 4 ? 10 : target <= 7 ? 12 : 15;
    const otherSpecies = species.filter(item => item !== kind);
    const animals = shuffle([
      ...Array(target).fill(kind),
      ...Array.from({ length: animalTotal - target }, (_, i) => otherSpecies[i % 2]),
    ]);
    field.style.setProperty('--rows', animals.length > 10 ? '3' : '2');
    animals.forEach(animalKind => {
      let countedOnce = false;
      let shake;
      const animal = button('', () => {
        if (phase !== 'counting' || countedOnce) return;
        if (animalKind !== kind) {
          shake?.cancel();
          shake = body.animate([
            { transform: 'translateX(-50%)' },
            { transform: 'translateX(calc(-50% - 4px))' },
            { transform: 'translateX(calc(-50% + 4px))' },
            { transform: 'translateX(calc(-50% - 3px))' },
            { transform: 'translateX(-50%)' },
          ], { duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 320 });
          speak('l2/audio/wrong effect.mp3');
          announce(`Cari ${kind}. Cuba lagi.`);
          return;
        }
        countedOnce = true;
        counted++;
        animal.classList.add('l2-counted');
        animal.setAttribute('aria-pressed', 'true');
        animal.setAttribute('aria-label', `${kind}, telah dikira ${counted}`);
        const number = art(`l2/number/number (${counted}).png`);
        number.classList.add('l2-count-number');
        animal.append(number);
        announce(`${counted} ${kind}.`);
        if (counted === target) {
          phase = 'waiting';
          field.inert = true;
          speak(`l2/audio/number/${counted}.mp3`, question);
        } else speak(`l2/audio/number/${counted}.mp3`);
      }, 'l2-animal');
      animal.setAttribute('aria-label', `${animalKind}, belum dikira`);
      animal.setAttribute('aria-pressed', 'false');
      animal.style.setProperty('--pace', `${9 + Math.random() * 5}s`);
      animal.style.setProperty('--delay', `${-Math.random() * 8}s`);
      const body = art(`l2/animal/animal ${animalKind}.png`);
      body.classList.add('l2-body');
      animal.append(body);
      field.append(animal);
    });
    screen.append(heading, field);
    prompt.focus();
    announce(`Pusingan ${round + 1}. Cari dan kira ${target} ${kind}.`);
    speak(`l2/audio/number/${target}.mp3`);

    function question() {
      if (!screen.isConnected) return;
      phase = 'question';
      heading.inert = true;
      const overlay = document.createElement('div');
      overlay.className = 'l2-question';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-label', `Berapa jumlah ${kind}?`);
      const board = art(`l2/jumlah dan kuantiti/jumlah/jumlah ${kind}.png`);
      board.classList.add('l2-board');
      const replay = graphicButton('l2/element/audio.png', 'Dengar soalan jumlah', () => {
        stop();
        speak(`l2/audio/jumlah/${kind}.mp3`);
      });
      replay.classList.add('l2-question-audio');
      const choices = document.createElement('div');
      choices.className = 'l2-answers';
      const wrong = shuffle(Array.from({ length: 10 }, (_, i) => i + 1).filter(n => n !== target)).slice(0, 2);
      shuffle([target, ...wrong]).forEach(value => {
        const answer = graphicButton(`l2/jumlah dan kuantiti/kuantiti/kuantiti (${value}).png`, `Jawapan ${value}`, () => {
          if (phase !== 'question') return;
          phase = 'answering';
          choices.inert = true;
          replay.disabled = true;
          stop();
          speak(`l2/audio/number/${value}.mp3`, () => {
            if (value !== target) {
              speak('l2/audio/wrong effect.mp3', () => {
                phase = 'question';
                choices.inert = false;
                replay.disabled = false;
                answer.focus();
              });
              announce('Cuba lagi.');
              return;
            }
            const feedback = art('l2/element/betul.png', 'Betul!');
            feedback.classList.add('l2-feedback');
            screen.append(feedback);
            announce('Betul!');
            speak('l2/audio/betul.mp3', () => {
              timer = setTimeout(() => {
                round++;
                if (round === 3) finish(); else nextRound();
              }, 1200);
            });
          });
        });
        choices.append(answer);
      });
      overlay.append(board, replay, choices);
      screen.append(overlay);
      announce(`Berapa jumlah ${kind}?`);
      replay.focus();
      speak(`l2/audio/jumlah/${kind}.mp3`);
    }
  }

  function finish() {
    complete();
    page();
    const board = panel('l2/Done Level Page/siap.png');
    board.setAttribute('aria-label', 'Tahniah! Anda telah berjaya!');
    const replay = graphicButton('l2/Done Level Page/siap semula.png', 'Semula', () => {
      stop();
      openLevel2({ stage, art, button, graphicButton, announce, complete, back, pauseMusic, resumeMusic });
    });
    replay.classList.add('l2-replay');
    const onward = graphicButton('l2/Done Level Page/siap seterusnya.png', 'Seterusnya', exit);
    onward.classList.add('l2-next');
    board.append(replay, onward);
    speak('l2/Done Level Page/done.mp3');
    announce('Tahniah! Tahap 2 selesai. Tahap 3 dibuka.');
    onward.focus();
  }

  start();
}
