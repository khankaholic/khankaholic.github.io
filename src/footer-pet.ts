export function initFooterPet(): void {
  const yard = document.querySelector<HTMLElement>(".pet-yard");
  const pet = document.querySelector<HTMLButtonElement>(".pet-sprite");
  const pause = document.querySelector<HTMLButtonElement>(".pet-pause");
  const message = document.querySelector<HTMLElement>(".pet-message");
  if (!yard || !pet || !pause || !message) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = reduced.matches;
  let visible = false;
  let x = 0;
  let elapsed = 0;
  let waveUntil = 0;
  let last = 0;
  let animationRow = -1;
  let animationTime = 0;
  let drag: { id: number; startX: number; startY: number; x: number; y: number; active: boolean } | null = null;
  let dragY = 0;
  let suppressClick = false;
  let dragSpeech = 0;
  let restUntil = 0;
  const footer = document.querySelector<HTMLElement>(".site-footer")!;
  const header = document.querySelector<HTMLElement>(".site-header")!;
  const choice = yard.querySelector<HTMLSelectElement>(".pet-choice")!;
  const position = yard.querySelector<HTMLSelectElement>(".pet-position")!;
  const hidden = yard.querySelector<HTMLInputElement>(".pet-hidden")!;
  const options = yard.querySelector<HTMLDetailsElement>(".pet-options")!;
  // The header has no free lane on narrow screens, so the pet lives in the footer there.
  const narrow = matchMedia("(max-width: 760px)");
  const atTop = (): boolean => position.value === "top" && !narrow.matches;
  let laneStart = 0;
  let laneWidth = 0;
  const measureLane = (): void => {
    const brand = header.querySelector(".brand");
    const firstNavLink = header.querySelector(".primary-nav a");
    if (!atTop() || !brand || !firstNavLink) {
      laneStart = 0;
      laneWidth = yard.clientWidth;
      pet.style.left = "";
      return;
    }
    // Walk only in the gap between the brand and the nav so links stay readable.
    const yardLeft = yard.getBoundingClientRect().left;
    const brandRight = brand.getBoundingClientRect().right;
    laneStart = brandRight - yardLeft + 16;
    laneWidth = Math.max(0, firstNavLink.getBoundingClientRect().left - brandRight - 32);
    pet.style.left = `${laneStart}px`;
  };
  document.addEventListener("click", (event) => {
    if (options.open && event.target instanceof Node && !options.contains(event.target)) {
      options.open = false;
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && options.open) {
      const hadFocus = options.contains(document.activeElement);
      options.open = false;
      if (hadFocus) options.querySelector("summary")?.focus();
    }
  });
  const lines: Record<string, string[]> = {
    bsod: ["💭 Not a crash. Just thinking.", "🤖 Systems operational. Suspicious."],
    dewey: ["🦆 One task at a time. Quack.", "✨ Ducks in a row."],
    fireball: ["🔥 Warming up. Stand back.", "⚡ Small flame. Big plans."],
    rocky: ["🪨 Take your time. I’ll wait.", "☕ Take a little break."]
  };
  const read = (key: string): string | null => { try { return localStorage.getItem(key); } catch { return null; } };
  const write = (key: string, value: string): void => { try { localStorage.setItem(key, value); } catch { /* Storage is optional. */ } };
  choice.value = Object.keys(lines).includes(read("site-pet") ?? "") ? read("site-pet")! : "bsod";
  position.value = read("site-pet-position") === "bottom" ? "bottom" : "top";
  hidden.checked = read("site-pet-hidden") === "true";
  const configure = (): void => {
    (atTop() ? header : footer).append(yard);
    yard.classList.toggle("pet-at-top", atTop());
    if (atTop()) yard.querySelector(".pet-options")!.append(pause);
    else yard.append(pause);
    pet.style.backgroundImage = `url('/images/pets/${choice.value}.webp')`;
    pet.hidden = hidden.checked;
    yard.classList.toggle("pet-is-hidden", hidden.checked);
    if (hidden.checked) yard.classList.remove("pet-speaking");
    pet.setAttribute("aria-label", `Say hello to ${choice.selectedOptions[0].text}`);
    pet.title = `Say hello to ${choice.selectedOptions[0].text}`;
    message.textContent = `${choice.selectedOptions[0].text} · say hello`;
    measureLane();
    x = 0;
    dragY = 0;
    pet.style.transform = "translateX(0)";
    pet.style.backgroundPosition = "0 0";
    write("site-pet", choice.value);
    write("site-pet-position", position.value);
    write("site-pet-hidden", String(hidden.checked));
  };
  [choice, position, hidden].forEach((control) => control.addEventListener("change", configure));
  narrow.addEventListener("change", configure);
  window.addEventListener("resize", () => {
    measureLane();
    const scale = atTop() ? .55 : 1;
    x = Math.min(x, Math.max(0, (laneWidth - 96 * scale) / scale));
  });
  configure();
  let clicks: number[] = [];
  let reply = 0;
  let speechTimer = 0;
  const showSpeech = (): void => {
    const center = laneStart + x * (atTop() ? .55 : 1) + (atTop() ? 26 : 48);
    const left = Math.max(0, Math.min(center - 28, yard.clientWidth - 230));
    message.style.left = `${left}px`;
    message.style.setProperty("--bubble-tail", `${Math.max(16, Math.min(206, center - left))}px`);
    yard.classList.add("pet-speaking");
    clearTimeout(speechTimer);
    speechTimer = window.setTimeout(() => yard.classList.remove("pet-speaking"), 1500);
  };
  const durations: Record<number, number[]> = {
    0: [280, 110, 110, 140, 140, 320],
    1: [120, 120, 120, 120, 120, 120, 120, 220],
    2: [120, 120, 120, 120, 120, 120, 120, 220],
    3: [140, 140, 140, 280]
  };
  const dragLines: Record<string, string[]> = {
    bsod: ["😵‍💫 Gravity driver missing!", "🔌 Please don’t unplug me.", "💾 Saving my dignity…"],
    dewey: ["🦆 Quack?! I’m flying!", "🪽 No pilot license yet.", "☁️ A duck above the clouds."],
    fireball: ["🚀 Ignition! Here we go!", "🔥 Handle with warm gloves.", "☄️ Tiny comet coming through!"],
    rocky: ["🪨 I thought I was immovable.", "😌 Taking the scenic route.", "🌍 A rolling stone, apparently."]
  };
  const finishDrag = (cancelled = false): void => {
    if (!drag) return;
    const previous = drag;
    drag = null;
    clearInterval(dragSpeech);
    yard.classList.remove("pet-dragging");
    if (pet.hasPointerCapture(previous.id)) pet.releasePointerCapture(previous.id);
    if (!previous.active) return;
    suppressClick = true;
    window.setTimeout(() => { suppressClick = false; }, 0);
    clicks = [];
    const landingY = atTop() ? 0 : Math.max(0, yard.clientHeight - 104);
    const fromY = dragY;
    dragY = landingY;
    pet.style.transform = `translate(${x}px, ${landingY}px)`;
    if (!reduced.matches && Math.abs(fromY - landingY) > 1) {
      pet.animate([
        { transform: `translate(${x}px, ${fromY}px)`, offset: 0, easing: "cubic-bezier(.42,0,1,1)" },
        { transform: `translate(${x}px, ${landingY}px)`, offset: .7, easing: "ease-out" },
        { transform: `translate(${x}px, ${landingY - 4}px)`, offset: .85, easing: "ease-in" },
        { transform: `translate(${x}px, ${landingY}px)`, offset: 1 }
      ], { duration: 380 });
    }
    restUntil = performance.now() + 1800;
    message.textContent = cancelled ? "🛟 Back on solid ground." : "🛬 Safe landing. Nailed it.";
    showSpeech();
  };
  pet.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || drag) return;
    drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x, y: dragY, active: false };
    pet.setPointerCapture(event.pointerId);
  });
  pet.addEventListener("pointermove", (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    if (!drag.active && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 5) return;
    if (!drag.active) {
      drag.active = true;
      clicks = [];
      yard.classList.add("pet-dragging");
      let index = 0;
      const talk = (): void => { message.textContent = dragLines[choice.value][index++ % 3]; showSpeech(); };
      talk();
      dragSpeech = window.setInterval(talk, 1300);
    }
    const scale = atTop() ? .55 : 1;
    x = Math.max(0, Math.min((laneWidth - 96 * scale) / scale, drag.x + (event.clientX - drag.startX) / scale));
    const minY = atTop() ? Math.min(0, (104 * scale - yard.clientHeight) / scale) : 0;
    const maxY = atTop() ? 0 : Math.max(0, yard.clientHeight - 104);
    dragY = Math.max(minY, Math.min(maxY, drag.y + (event.clientY - drag.startY) / scale));
    pet.style.transform = `translate(${x}px, ${dragY}px)`;
    showSpeech();
    event.preventDefault();
  });
  pet.addEventListener("pointerup", () => finishDrag());
  pet.addEventListener("pointercancel", () => finishDrag(true));
  pet.addEventListener("lostpointercapture", () => finishDrag(true));
  window.addEventListener("blur", () => finishDrag(true));
  let lastParty = -5000;
  const celebrate = (party = false): void => {
    if (party && performance.now() - lastParty < 3000) return;
    if (party) lastParty = performance.now();
    showSpeech();
    message.textContent = party ? "🚀 PARTY MODE UNLOCKED! 🎊" : "🎉 Celebration deployed! ✨";
    waveUntil = elapsed + 2200;
    if (reduced.matches) return;
    const bounds = pet.getBoundingClientRect();
    const origin = { x: (bounds.left + bounds.width / 2) / innerWidth, y: (bounds.top + bounds.height / 2) / innerHeight };
    void import("canvas-confetti").then(({ default: confetti }) => {
      if (reduced.matches || document.hidden) return;
      const base = { disableForReducedMotion: true, zIndex: 1000, colors: ["#1689ef", "#70c7ff", "#ffcf56", "#ff729f", "#ffffff"], ticks: 180 };
      if (!party) {
        void confetti({ ...base, origin, particleCount: 95, spread: 100, startVelocity: 32, gravity: .9, scalar: 1.15, angle: origin.y < .3 ? 270 : 90 });
        return;
      }
      for (let burst = 0; burst < 5; burst++) {
        window.setTimeout(() => {
          if (reduced.matches || document.hidden) return;
          for (const left of [true, false]) {
            void confetti({ ...base, origin: { x: left ? .04 : .96, y: .7 }, angle: left ? 60 : 120, particleCount: 45, spread: 65, startVelocity: 48, scalar: 1.2 });
          }
        }, burst * 260);
      }
    });
  };
  document.querySelectorAll<HTMLAnchorElement>('a[href="/cv.html"]').forEach((link) => link.addEventListener("click", () => {
    try { if (!sessionStorage.getItem("cv-celebrated")) sessionStorage.setItem("cv-celebrate-pending", "true"); } catch { /* Optional celebration. */ }
  }));
  if (location.pathname === "/cv.html") {
    try {
      if (sessionStorage.getItem("cv-celebrate-pending")) {
        sessionStorage.removeItem("cv-celebrate-pending");
        sessionStorage.setItem("cv-celebrated", "true");
        if (atTop() && !hidden.checked) setTimeout(celebrate, 400);
      }
    } catch { /* Optional celebration. */ }
  }
  const updatePause = (): void => {
    pause.textContent = paused ? "Resume pet" : "Pause pet";
    pause.setAttribute("aria-pressed", String(paused));
  };
  updatePause();
  pause.addEventListener("click", () => { paused = !paused; updatePause(); });
  reduced.addEventListener("change", () => { paused = reduced.matches; updatePause(); });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(yard);
  pet.addEventListener("click", () => {
    if (suppressClick) return;
    showSpeech();
    waveUntil = elapsed + 2200;
    animationRow = -1;
    message.textContent = lines[choice.value][reply++ % lines[choice.value].length];
    const now = performance.now();
    if (clicks.length && now - clicks[clicks.length - 1] > 450) clicks = [];
    clicks = clicks.filter((time) => now - time < 1800);
    clicks.push(now);
    if (clicks.length === 3) celebrate();
    if (clicks.length >= 5) { clicks = []; celebrate(true); }
    pet.style.backgroundPosition = "0px -312px";
  });
  const tick = (now: number): void => {
    const delta = Math.min(now - last, 50);
    last = now;
    if (visible && !document.hidden && !paused && !hidden.checked && !drag && now >= restUntil) {
      elapsed += delta;
      const phase = elapsed % 16000;
      const waving = elapsed < waveUntil || pet.matches(":hover, :focus-visible");
      const row = waving ? 3 : phase < 6000 ? 1 : phase < 8000 ? 0 : phase < 14000 ? 2 : 0;
      const scale = atTop() ? .55 : 1;
      const limit = Math.max(0, (laneWidth - 96 * scale) / scale);
      if (!waving) x = Math.max(0, Math.min(limit, x + (row === 1 ? 1 : row === 2 ? -1 : 0) * delta * .035));
      pet.style.transform = `translate(${x}px, ${dragY}px)`;
      animationTime = row === animationRow ? animationTime + delta : 0;
      animationRow = row;
      const frames = durations[row];
      let time = animationTime % frames.reduce((sum, duration) => sum + duration, 0);
      let frame = 0;
      while (frame < frames.length - 1 && time >= frames[frame]) time -= frames[frame++];
      pet.style.backgroundPosition = `${-frame * 96}px ${-row * 104}px`;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
