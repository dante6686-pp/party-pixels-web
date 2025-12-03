console.log("Tap to Survive 3 JS loaded");

// ===== DOM =====
const views = {
  city: document.getElementById("cityView"),
  workshop: document.getElementById("workshopView"),
  relics: document.getElementById("relicsView"),
  bar: document.getElementById("barView"),
  run: document.getElementById("runView"),
};

const metaScrapEl = document.getElementById("metaScrap");
const metaSummaryEl = document.getElementById("metaSummary");

// city
document.querySelectorAll(".district").forEach((el) => {
  el.addEventListener("click", () => {
    const target = el.getAttribute("data-target");
    if (target === "runView") {
      startNewRunFromCity();
    } else {
      showView(target);
    }
  });
});
document.querySelectorAll("[data-back]").forEach((btn) => {
  btn.addEventListener("click", () => showView("cityView"));
});

// workshop
const hpLevelLabel = document.getElementById("hpLevelLabel");
const tapLevelLabel = document.getElementById("tapLevelLabel");
const drainLevelLabel = document.getElementById("drainLevelLabel");
const hpCostLabel = document.getElementById("hpCostLabel");
const tapCostLabel = document.getElementById("tapCostLabel");
const drainCostLabel = document.getElementById("drainCostLabel");
const hpUpgradeBtn = document.getElementById("hpUpgradeBtn");
const tapUpgradeBtn = document.getElementById("tapUpgradeBtn");
const drainUpgradeBtn = document.getElementById("drainUpgradeBtn");

// relics
const glassStatus = document.getElementById("glassStatus");
const nightStatus = document.getElementById("nightStatus");
const glassCostEl = document.getElementById("glassCost");
const nightCostEl = document.getElementById("nightCost");
const glassUnlockBtn = document.getElementById("glassUnlockBtn");
const nightUnlockBtn = document.getElementById("nightUnlockBtn");

// run elements
const runSubtitle = document.getElementById("runSubtitle");
const waveLabel = document.getElementById("waveLabel");
const runScrapLabel = document.getElementById("runScrapLabel");
const hpLabelTitle = document.getElementById("hpLabelTitle");
const hpBar = document.getElementById("hpBar");
const chaosBar = document.getElementById("chaosBar");
const waveBar = document.getElementById("waveBar");
const hpStat = document.getElementById("hpStat");
const tapStat = document.getElementById("tapStat");
const drainStat = document.getElementById("drainStat");
const hpPercentLabel = document.getElementById("hpPercentLabel");
const chaosPercentLabel = document.getElementById("chaosPercentLabel");
const waveTimeLabel = document.getElementById("waveTimeLabel");
const statusPill = document.getElementById("statusPill");
const buffLabel = document.getElementById("buffLabel");
const debuffLabel = document.getElementById("debuffLabel");
const logBox = document.getElementById("logBox");
const tapButton = document.getElementById("tapButton");
const runRestartBtn = document.getElementById("runRestartBtn");
const runBackBtn = document.getElementById("runBackBtn");

// run end overlay
const runEndOverlay = document.getElementById("runEndOverlay");
const runEndMessage = document.getElementById("runEndMessage");
const endWaveLabel = document.getElementById("endWaveLabel");
const endScrapLabel = document.getElementById("endScrapLabel");
const endTotalScrapLabel = document.getElementById("endTotalScrapLabel");
const endCityBtn = document.getElementById("endCityBtn");
const endRestartBtn = document.getElementById("endRestartBtn");

// ===== META STATE =====
const meta = {
  scrap: 0,
  hpLevel: 0,
  tapLevel: 0,
  drainLevel: 0,
  relicGlassUnlocked: false,
  relicGlassActive: false,
  relicNightUnlocked: false,
  relicNightActive: false,
};

function updateMetaUI() {
  metaScrapEl.textContent = meta.scrap.toString();

  const buffsCount =
    meta.hpLevel + meta.tapLevel + meta.drainLevel +
    (meta.relicGlassActive ? 1 : 0) +
    (meta.relicNightActive ? 1 : 0);
  metaSummaryEl.textContent = `${buffsCount} buffs`;

  // workshop labels & costs
  const hpCost = 10 + meta.hpLevel * 5;
  const tapCost = 12 + meta.tapLevel * 6;
  const drainCost = 15 + meta.drainLevel * 7;
  hpLevelLabel.textContent = `Poziom ${meta.hpLevel}`;
  tapLevelLabel.textContent = `Poziom ${meta.tapLevel}`;
  drainLevelLabel.textContent = `Poziom ${meta.drainLevel}`;
  hpCostLabel.textContent = hpCost;
  tapCostLabel.textContent = tapCost;
  drainCostLabel.textContent = drainCost;

  hpUpgradeBtn.disabled = meta.scrap < hpCost;
  tapUpgradeBtn.disabled = meta.scrap < tapCost;
  drainUpgradeBtn.disabled = meta.scrap < drainCost;

  // relics
  glassCostEl.textContent = 40;
  nightCostEl.textContent = 30;

  if (!meta.relicGlassUnlocked) {
    glassStatus.textContent = "Zablokowany";
  } else {
    glassStatus.textContent = meta.relicGlassActive ? "Aktywny" : "Odblokowany";
  }

  if (!meta.relicNightUnlocked) {
    nightStatus.textContent = "Zablokowany";
  } else {
    nightStatus.textContent = meta.relicNightActive ? "Aktywny" : "Odblokowany";
  }
}

hpUpgradeBtn.addEventListener("click", () => {
  const cost = 10 + meta.hpLevel * 5;
  if (meta.scrap >= cost) {
    meta.scrap -= cost;
    meta.hpLevel += 1;
    updateMetaUI();
  }
});

tapUpgradeBtn.addEventListener("click", () => {
  const cost = 12 + meta.tapLevel * 6;
  if (meta.scrap >= cost) {
    meta.scrap -= cost;
    meta.tapLevel += 1;
    updateMetaUI();
  }
});

drainUpgradeBtn.addEventListener("click", () => {
  const cost = 15 + meta.drainLevel * 7;
  if (meta.scrap >= cost) {
    meta.scrap -= cost;
    meta.drainLevel += 1;
    updateMetaUI();
  }
});

glassUnlockBtn.addEventListener("click", () => {
  const unlockCost = 40;
  if (!meta.relicGlassUnlocked) {
    if (meta.scrap < unlockCost) return;
    meta.scrap -= unlockCost;
    meta.relicGlassUnlocked = true;
    meta.relicGlassActive = true;
  } else {
    meta.relicGlassActive = !meta.relicGlassActive;
  }
  updateMetaUI();
});

nightUnlockBtn.addEventListener("click", () => {
  const unlockCost = 30;
  if (!meta.relicNightUnlocked) {
    if (meta.scrap < unlockCost) return;
    meta.scrap -= unlockCost;
    meta.relicNightUnlocked = true;
    meta.relicNightActive = true;
  } else {
    meta.relicNightActive = !meta.relicNightActive;
  }
  updateMetaUI();
});

// ===== VIEW SWITCH =====
function showView(id) {
  Object.values(views).forEach((v) => v.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

// ===== RUN STATE =====
const state = {
  wave: 1,
  maxHp: 100,
  hp: 100,
  tapPower: 5,
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
  runScrap: 0,
  runEnded: false,
  endlessNight: false,
};

const chaosEvents = ["reverse_taps", "heal_burst", "double_tap", "hp_lock"];

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function setTapButtonEnabled(enabled) {
  tapButton.disabled = !enabled;
  tapButton.classList.toggle("disabled", !enabled);
}

function log(message, type = "system") {
  const div = document.createElement("div");
  div.className = `log-line ${type}`;
  div.textContent = message;
  logBox.prepend(div);
  while (logBox.childElementCount > 6) {
    logBox.removeChild(logBox.lastChild);
  }
}

// Init run stats from meta
function configureRunFromMeta() {
  const baseHp = 100 + meta.hpLevel * 10;
  const baseTap = 5 + meta.tapLevel * 1;
  let baseDrain = 4 - meta.drainLevel * 0.3;
  baseDrain = Math.max(1.5, baseDrain);

  let chaosPerSecond = 1;
  let chaosPerTap = 2;

  // relic: Glass Universe -> wszystko mocniejsze
  if (meta.relicGlassActive) {
    baseDrain *= 1.5;
    chaosPerSecond *= 1.2;
  }

  // relic: Endless Night -> brak czytelnego HP, chaos wolniej
  state.endlessNight = meta.relicNightActive;
  if (meta.relicNightActive) {
    chaosPerSecond *= 0.8;
    chaosPerTap *= 0.85;
  }

  state.wave = 1;
  state.maxHp = baseHp;
  state.hp = baseHp;
  state.tapPower = baseTap;
  state.drainPerSecond = baseDrain;
  state.chaos = 0;
  state.chaosPerTap = chaosPerTap;
  state.chaosPerSecond = chaosPerSecond;
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
  state.runScrap = 0;
  state.runEnded = false;

  // Endless Night UI tweak
  if (state.endlessNight) {
    hpLabelTitle.textContent = "???";
    hpPercentLabel.textContent = "—";
    hpStat.textContent = "UNKNOWN";
    runSubtitle.textContent = "Endless Night: grasz na czuja. Nie pytaj, ile masz HP.";
  } else {
    hpLabelTitle.textContent = "Life Support";
    runSubtitle.textContent = "Bunkier online. Wszystkie systemy udają stabilność.";
  }
}

function updateRunUI() {
  const hpPercent = (state.hp / state.maxHp) * 100;
  hpBar.style.width = clamp(hpPercent, 0, 100) + "%";

  if (!state.endlessNight) {
    hpPercentLabel.textContent = clamp(hpPercent, 0, 100).toFixed(0) + "%";
    hpStat.textContent = `${Math.max(0, state.hp.toFixed(0))} / ${state.maxHp}`;
  }

  const chaosPercent = clamp(state.chaos, 0, 100);
  chaosBar.style.width = chaosPercent + "%";
  chaosPercentLabel.textContent = chaosPercent.toFixed(0) + "%";

  const waveProgress = clamp(1 - state.waveTimeLeft / state.waveDuration, 0, 1);
  waveBar.style.width = (waveProgress * 100).toFixed(1) + "%";
  waveTimeLabel.textContent = state.waveTimeLeft.toFixed(1) + "s";

  waveLabel.textContent = state.wave.toString();
  tapStat.textContent = `+${state.tapPower}`;
  drainStat.textContent = `${state.drainPerSecond.toFixed(1)}/s`;
  runScrapLabel.textContent = state.runScrap.toString();

  if (!state.alive) {
    statusPill.textContent = "Offline";
  } else if (state.waveTimeLeft < 5) {
    statusPill.textContent = "Critical";
  } else if (state.hp < state.maxHp * 0.3 && !state.endlessNight) {
    statusPill.textContent = "Danger";
  } else {
    statusPill.textContent = "Stable";
  }

  const now = performance.now();
  state.buffActive = now < state.doubleTapUntil || now < state.healBurstUntil;
  state.debuffActive = now < state.reverseTapsUntil || now < state.healBlockedUntil;
  buffLabel.style.display = state.buffActive ? "inline-flex" : "none";
  debuffLabel.style.display = state.debuffActive ? "inline-flex" : "none";
}

function triggerChaosEvent() {
  state.chaos = 0;
  const id = chaosEvents[Math.floor(Math.random() * chaosEvents.length)];
  const now = performance.now();

  switch (id) {
    case "reverse_taps":
      state.reverseTapsUntil = now + 9000;
      log("CHAOS: Reverse Flow – tapnięcia przez chwilę ranią zamiast leczyć!", "negative");
      break;
    case "heal_burst": {
      const healAmount = state.maxHp * 0.4;
      state.hp = clamp(state.hp + healAmount, 0, state.maxHp);
      state.healBurstUntil = now + 4000;
      log("CHAOS: Healing Surge – +40% HP, przez moment czujesz się nietykalny.", "event");
      break;
    }
    case "double_tap":
      state.doubleTapUntil = now + 8000;
      log("CHAOS: Overload Fingers – przez 8s leczenie z tapów x2.", "event");
      break;
    case "hp_lock":
      state.healBlockedUntil = now + 7000;
      log("CHAOS: Lockdown – przez 7s tapnięcia nie leczą.", "negative");
      break;
  }
}

function startNextWave() {
  state.wave += 1;
  state.drainPerSecond += 0.8;
  state.chaosPerSecond += 0.12;
  state.waveDuration += 2;
  state.waveTimeLeft = state.waveDuration;

  // lekka nagroda scrap za przetrwanie fali
  const waveReward = 1 + Math.floor(state.wave / 2);
  state.runScrap += waveReward;
  log(`Przetrwałeś falę ${state.wave - 1}. Bonus scrap: +${waveReward}.`, "event");

  log(`Nowa fala: ${state.wave}. Miasto jeszcze się nie poddało.`, "system");
  setTapButtonEnabled(true);
}

function endRun(reason) {
  if (state.runEnded) return;
  state.runEnded = true;
  setTapButtonEnabled(false);

  // końcowy bonus scrap: zależny od fali
  const finalBonus = Math.max(1, state.wave * 5);
  const totalRunScrap = state.runScrap + finalBonus;

  meta.scrap += totalRunScrap;
  updateMetaUI();

  let msg;
  if (reason === "bleed") {
    msg = "Wykrwawiłeś się gdzieś między ruinami. Wieża radiowa notuje tylko kolejną ciszę.";
  } else if (reason === "tap_death") {
    msg = "Zabiły cię własne tapnięcia. To też jakaś forma samorozwoju.";
  } else {
    msg = "Run zakończony. Popiół trochę opadł, ale miasto dalej pamięta.";
  }

  runEndMessage.textContent = msg;
  endWaveLabel.textContent = state.wave.toString();
  endScrapLabel.textContent = totalRunScrap.toString();
  endTotalScrapLabel.textContent = meta.scrap.toString();

  runEndOverlay.classList.add("visible");
}

// ===== INPUTS =====
tapButton.addEventListener("click", () => {
  if (!state.alive || state.inUpgradeChoice || state.runEnded) return;
  const now = performance.now();

  state.chaos += state.chaosPerTap;
  if (state.chaos >= 100) triggerChaosEvent();

  let power = state.tapPower;
  if (now < state.doubleTapUntil) power *= 2;

  if (now < state.reverseTapsUntil) {
    state.hp -= power;
    if (!state.endlessNight) {
      log(`Odwrotny przepływ: tap -${power.toFixed(0)} HP.`, "negative");
    } else {
      log("Tap czujesz w kościach, nie w pasku HP.", "negative");
    }
    if (state.hp <= 0) {
      state.hp = 0;
      state.alive = false;
      endRun("tap_death");
    }
  } else if (now < state.healBlockedUntil) {
    log("Lockdown: tap nie leczy. Ekran milczy, krew nie.", "negative");
  } else {
    state.hp = clamp(state.hp + power, 0, state.maxHp);
  }

  updateRunUI();
});

runRestartBtn.addEventListener("click", () => {
  startNewRunFromCity();
});

runBackBtn.addEventListener("click", () => {
  // przerwanie runa bez nagrody
  state.alive = false;
  state.runEnded = true;
  setTapButtonEnabled(false);
  log("Run przerwany. Miasto czeka na kolejny przypływ odwagi.", "system");
  showView("cityView");
});

endCityBtn.addEventListener("click", () => {
  runEndOverlay.classList.remove("visible");
  showView("cityView");
});

endRestartBtn.addEventListener("click", () => {
  runEndOverlay.classList.remove("visible");
  startNewRunFromCity();
});

function startNewRunFromCity() {
  configureRunFromMeta();
  logBox.innerHTML = "";
  log("SYSTEM: Nowy run. Tapnij, żeby utrzymać się przy życiu.", "system");
  if (meta.relicGlassActive) {
    log("Relikt aktywny: Glass Universe – wszystko jest ostrzejsze niż powinno.", "event");
  }
  if (meta.relicNightActive) {
    log("Relikt aktywny: Endless Night – nie widzisz HP, tylko konsekwencje.", "event");
  }
  setTapButtonEnabled(true);
  showView("runView");
}

// ===== GAME LOOP =====
function loop() {
  const now = performance.now();
  const dt = (now - state.lastTime) / 1000;
  state.lastTime = now;

  if (state.alive && !state.inUpgradeChoice && !state.runEnded) {
    // bleed
    state.hp -= state.drainPerSecond * dt;
    if (state.hp <= 0) {
      state.hp = 0;
      state.alive = false;
      endRun("bleed");
    }

    // chaos over time
    state.chaos += state.chaosPerSecond * dt;
    if (state.chaos >= 100) triggerChaosEvent();

    // wave timer
    state.waveTimeLeft -= dt;
    if (state.waveTimeLeft <= 0 && state.alive) {
      state.waveTimeLeft = 0;
      setTapButtonEnabled(false);
      log(`Fala ${state.wave} przetrwana.`, "event");
      // zamiast wyboru upgrade'ów runowych – od razu kolejna fala
      startNextWave();
    }
  }

  updateRunUI();
  requestAnimationFrame(loop);
}

// ===== INIT =====
updateMetaUI();
configureRunFromMeta();
updateRunUI();
showView("cityView");
log("SYSTEM: Miasto popiołu jest online. Wejdź do bunkra, kiedy będziesz gotów.", "system");

// start loop
requestAnimationFrame(loop);