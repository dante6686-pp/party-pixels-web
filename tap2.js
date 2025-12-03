console.log("Tap to Survive 2 JS loaded");

const tapButton = document.getElementById("tapButton");
const restartButton = document.getElementById("restartButton");
const hpBar = document.getElementById("hpBar");
const chaosBar = document.getElementById("chaosBar");
const waveBar = document.getElementById("waveBar");
const hpStat = document.getElementById("hpStat");
const tapStat = document.getElementById("tapStat");
const drainStat = document.getElementById("drainStat");
const hpPercentLabel = document.getElementById("hpPercentLabel");
const chaosPercentLabel = document.getElementById("chaosPercentLabel");
const waveTimeLabel = document.getElementById("waveTimeLabel");
const waveLabel = document.getElementById("waveLabel");
const statusLabel = document.getElementById("statusLabel");
const buffLabel = document.getElementById("buffLabel");
const debuffLabel = document.getElementById("debuffLabel");
const logBox = document.getElementById("logBox");
const upgradeOverlay = document.getElementById("upgradeOverlay");
const upgradeList = document.getElementById("upgradeList");
const gameOverBanner = document.getElementById("gameOverBanner");

const state = {
  wave: 1,
  maxHp: 100,
  hp: 100,
  tapPower: 5,
  baseTapPower: 5,
  baseDrain: 4,
  drainPerSecond: 4,
  chaos: 0,
  chaosPerTap: 2,
  chaosPerSecond: 1,
  waveDuration: 20,
  waveTimeLeft: 20,
  alive: true,
  inUpgradeChoice: false,
  lastTime: performance.now(),
  reverseTapsUntil: 0,
  healBlockedUntil: 0,
  doubleTapUntil: 0,
  healBurstUntil: 0,
  buffActive: false,
  debuffActive: false,
  extraWaveHp: 0
};

const upgradesPool = [
  {
    id: "tap_plus",
    name: "Finger Overdrive",
    desc: "+2 leczenia z tapnięcia.",
    apply: () => { state.tapPower += 2; }
  },
  {
    id: "hp_plus",
    name: "Extra Tank",
    desc: "+20 maksymalnego HP i natychmiastowe leczenie o 20.",
    apply: () => {
      state.maxHp += 20;
      state.hp = Math.min(state.maxHp, state.hp + 20);
    }
  },
  {
    id: "drain_down",
    name: "Slow Bleed",
    desc: "–1 HP/s z utraty życia.",
    apply: () => {
      state.drainPerSecond = Math.max(0.5, state.drainPerSecond - 1);
    }
  },
  {
    id: "chaos_cooling",
    name: "Chaos Cooling",
    desc: "Chaos rośnie wolniej o ok. 30%.",
    apply: () => {
      state.chaosPerSecond *= 0.7;
      state.chaosPerTap *= 0.7;
    }
  },
  {
    id: "burst_heal",
    name: "Emergency Patch",
    desc: "Natychmiast leczysz się o 35% maksymalnego HP.",
    apply: () => {
      state.hp = Math.min(state.maxHp, state.hp + state.maxHp * 0.35);
    }
  },
  {
    id: "wave_shield",
    name: "Wave Shield",
    desc: "Na początku każdej fali dostajesz +15 tymczasowego HP.",
    apply: () => {
      state.extraWaveHp += 15;
    }
  }
];

const chaosEvents = ["reverse_taps", "heal_burst", "double_tap", "hp_lock"];

function log(message, type = "system") {
  const div = document.createElement("div");
  div.className = `log-line ${type}`;
  div.textContent = message;
  logBox.prepend(div);
  while (logBox.childElementCount > 6) {
    logBox.removeChild(logBox.lastChild);
  }
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function setTapButtonEnabled(enabled) {
  tapButton.disabled = !enabled;
  tapButton.classList.toggle("disabled", !enabled);
}

function updateUI() {
  const hpPercent = (state.hp / state.maxHp) * 100;
  hpBar.style.width = clamp(hpPercent, 0, 100) + "%";
  hpPercentLabel.textContent = clamp(hpPercent, 0, 100).toFixed(0) + "%";
  hpStat.textContent = `${Math.max(0, state.hp.toFixed(0))} / ${state.maxHp}`;

  const chaosPercent = clamp(state.chaos, 0, 100);
  chaosBar.style.width = chaosPercent + "%";
  chaosPercentLabel.textContent = chaosPercent.toFixed(0) + "%";

  const waveProgress = clamp(1 - state.waveTimeLeft / state.waveDuration, 0, 1);
  waveBar.style.width = (waveProgress * 100).toFixed(1) + "%";
  waveTimeLabel.textContent = state.waveTimeLeft.toFixed(1) + "s";

  waveLabel.textContent = "Fala " + state.wave;

  tapStat.textContent = `+${state.tapPower}`;
  drainStat.textContent = `${state.drainPerSecond.toFixed(1)}/s`;

  if (!state.alive) {
    statusLabel.textContent = "Offline";
  } else if (state.waveTimeLeft < 5) {
    statusLabel.textContent = "Critical";
  } else if (state.hp < state.maxHp * 0.3) {
    statusLabel.textContent = "Danger";
  } else {
    statusLabel.textContent = "Stable";
  }

  const now = performance.now();
  state.buffActive = now < state.doubleTapUntil || now < state.healBurstUntil;
  state.debuffActive = now < state.reverseTapsUntil || now < state.healBlockedUntil;

  buffLabel.style.display = state.buffActive ? "inline-flex" : "none";
  debuffLabel.style.display = state.debuffActive ? "inline-flex" : "none";
}

function triggerChaosEvent() {
  state.chaos = 0;
  const eventId = chaosEvents[Math.floor(Math.random() * chaosEvents.length)];
  const now = performance.now();

  switch (eventId) {
    case "reverse_taps":
      state.reverseTapsUntil = now + 10000;
      log("CHAOS EVENT: Reverse Flow – przez 10s tapnięcia ranią zamiast leczyć!", "negative");
      break;
    case "heal_burst":
      const healAmount = state.maxHp * 0.4;
      state.hp = clamp(state.hp + healAmount, 0, state.maxHp);
      state.healBurstUntil = now + 4000;
      log("CHAOS EVENT: Healing Surge – +40% HP i chwilowy boost stabilności.", "event");
      break;
    case "double_tap":
      state.doubleTapUntil = now + 8000;
      log("CHAOS EVENT: Overload Fingers – przez 8s leczenie z tapnięć x2.", "event");
      break;
    case "hp_lock":
      state.healBlockedUntil = now + 7000;
      log("CHAOS EVENT: Lockdown – przez 7s nie możesz się leczyć z tapów.", "negative");
      break;
  }
}

function showUpgrades() {
  state.inUpgradeChoice = true;
  setTapButtonEnabled(false);
  upgradeList.innerHTML = "";

  const poolCopy = [...upgradesPool];
  const chosen = [];
  while (poolCopy.length && chosen.length < 3) {
    const idx = Math.floor(Math.random() * poolCopy.length);
    chosen.push(poolCopy.splice(idx, 1)[0]);
  }

  chosen.forEach((upg) => {
    const btn = document.createElement("button");
    btn.className = "upgrade-btn";

    const name = document.createElement("div");
    name.className = "upgrade-name";
    name.textContent = upg.name;

    const desc = document.createElement("div");
    desc.className = "upgrade-desc";
    desc.textContent = upg.desc;

    btn.appendChild(name);
    btn.appendChild(desc);

    btn.addEventListener("click", () => {
      upg.apply();
      log(`Wybrałeś: ${upg.name}.`, "system");
      upgradeOverlay.classList.remove("visible");
      state.inUpgradeChoice = false;
      startNextWave();
    });

    upgradeList.appendChild(btn);
  });

  upgradeOverlay.classList.add("visible");
}

function startNextWave() {
  state.wave += 1;
  state.drainPerSecond += 0.8;
  state.chaosPerSecond += 0.1;
  state.waveDuration += 2;
  state.waveTimeLeft = state.waveDuration;

  if (state.extraWaveHp) {
    state.hp = clamp(state.hp + state.extraWaveHp, 0, state.maxHp);
    log(`Wave Shield: +${state.extraWaveHp} HP na start fali ${state.wave}.`, "system");
  }

  log(`Nowa fala: ${state.wave}. Ciśnienie rośnie...`, "system");
  setTapButtonEnabled(true);
}

function resetGame() {
  state.wave = 1;
  state.maxHp = 100;
  state.hp = 100;
  state.tapPower = 5;
  state.drainPerSecond = 4;
  state.chaos = 0;
  state.chaosPerTap = 2;
  state.chaosPerSecond = 1;
  state.waveDuration = 20;
  state.waveTimeLeft = 20;
  state.alive = true;
  state.inUpgradeChoice = false;
  state.lastTime = performance.now();
  state.reverseTapsUntil = 0;
  state.healBlockedUntil = 0;
  state.doubleTapUntil = 0;
  state.healBurstUntil = 0;
  state.buffActive = false;
  state.debuffActive = false;
  // extraWaveHp zostaje na cały "meta-run", możesz tu wyzerować jeśli chcesz

  gameOverBanner.classList.remove("visible");
  upgradeOverlay.classList.remove("visible");
  setTapButtonEnabled(true);
  log("SYSTEM: Nowy run rozpoczęty.", "system");
}

tapButton.addEventListener("click", () => {
  if (!state.alive || state.inUpgradeChoice) return;
  const now = performance.now();

  state.chaos += state.chaosPerTap;
  if (state.chaos >= 100) triggerChaosEvent();

  let power = state.tapPower;
  if (now < state.doubleTapUntil) power *= 2;

  if (now < state.reverseTapsUntil) {
    state.hp -= power;
    log(`Odwrotny przepływ: tap -${power.toFixed(0)} HP.`, "negative");
  } else if (now < state.healBlockedUntil) {
    log("Lockdown: tap nie leczy!", "negative");
  } else {
    state.hp = clamp(state.hp + power, 0, state.maxHp);
  }

  if (state.hp <= 0) {
    state.hp = 0;
    state.alive = false;
    setTapButtonEnabled(false);
    gameOverBanner.classList.add("visible");
    log("Umierasz. Miasto milknie.", "negative");
  }

  updateUI();
});

restartButton.addEventListener("click", () => {
  resetGame();
  updateUI();
});

function loop() {
  const now = performance.now();
  const dt = (now - state.lastTime) / 1000;
  state.lastTime = now;

  if (state.alive && !state.inUpgradeChoice) {
    state.hp -= state.drainPerSecond * dt;
    if (state.hp <= 0) {
      state.hp = 0;
      state.alive = false;
      setTapButtonEnabled(false);
      gameOverBanner.classList.add("visible");
      log("Wykrwawiłeś się. Koniec runa.", "negative");
    }

    state.chaos += state.chaosPerSecond * dt;
    if (state.chaos >= 100) triggerChaosEvent();

    state.waveTimeLeft -= dt;
    if (state.waveTimeLeft <= 0 && state.alive) {
      state.waveTimeLeft = 0;
      log(`Fala ${state.wave} przetrwana.`, "event");
      setTapButtonEnabled(false);
      showUpgrades();
    }
  }

  updateUI();
  requestAnimationFrame(loop);
}

log("SYSTEM: Tapnij, żeby utrzymać się przy życiu. Chaos będzie Cię testował.", "system");
updateUI();
requestAnimationFrame(loop);