console.log("CatClicker JS loaded");

const tacAgg = document.getElementById("tacAgg");
const tacChaos = document.getElementById("tacChaos");
const tacDeescalate = document.getElementById("tacDeescalate");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const battlePanel = document.getElementById("battlePanel");
const endScreen = document.getElementById("endScreen");

const enemyNumber = document.getElementById("enemyNumber");
const catHpLabel = document.getElementById("catHpLabel");
const enemyHpLabel = document.getElementById("enemyHpLabel");
const catHpBar = document.getElementById("catHpBar");
const enemyHpBar = document.getElementById("enemyHpBar");
const enemyIcon = document.getElementById("enemyIcon");
const logBox = document.getElementById("logBox");

let tactic = null;
let currentEnemy = 0;
let gameLoop = null;

// Enemy pool
const enemies = [
  { name: "Mysz", icon: "🐭", hp: 25, dmg: 4 },
  { name: "Pies", icon: "🐶", hp: 60, dmg: 9 },
  { name: "Papuga", icon: "🦜", hp: 50, dmg: 7, dodge: 0.15 },
  { name: "Odkurzacz", icon: "🧹", hp: 90, dmg: 12 }
];

// Log helper
function log(msg) {
  const div = document.createElement("div");
  div.className = "log-line";
  div.textContent = msg;
  logBox.prepend(div);
  while (logBox.childElementCount > 4) {
    logBox.removeChild(logBox.lastChild);
  }
}

// Select tactic
function selectTactic(id) {
  tacAgg.classList.remove("active");
  tacChaos.classList.remove("active");
  tacDeescalate.classList.remove("active");

  document.getElementById(id).classList.add("active");
  tactic = id;
}

tacAgg.onclick = () => selectTactic("tacAgg");
tacChaos.onclick = () => selectTactic("tacChaos");
tacDeescalate.onclick = () => selectTactic("tacDeescalate");

// Start run
startBtn.onclick = () => {
  if (!tactic) {
    alert("Choose a tactic!");
    return;
  }
  startRun();
};

// Restart
restartBtn.onclick = () => {
  endScreen.classList.remove("visible");
  startRun();
};

// Run state
let cat = {};
let enemy = {};

function startRun() {
  endScreen.classList.remove("visible");
  logBox.innerHTML = "";

  currentEnemy = 0;
  setupCat();
  spawnEnemy();
  if (gameLoop) cancelAnimationFrame(gameLoop);
  gameLoop = requestAnimationFrame(loop);
}

// Setup cat stats
function setupCat() {
  cat = {
    baseHp: 100,
    baseAtk: 6,
    hp: 100,
    atk: 6,
    atkSpeed: 0.8,
    lastAtk: performance.now()
  };

  if (tactic === "tacAgg") {
    cat.hp *= 0.8;
    cat.atk *= 1.7;
  }
  if (tactic === "tacChaos") {
    // no stat change, chaos adds randomness
  }
  if (tactic === "tacDeescalate") {
    cat.hp *= 1.4;
    cat.atk *= 0.7;
  }
}

// Spawn enemy
function spawnEnemy() {
  if (currentEnemy >= 10) {
    endGame(true);
    return;
  }

  currentEnemy++;
  const e = enemies[Math.floor(Math.random() * enemies.length)];
  enemy = {
    name: e.name,
    icon: e.icon,
    hp: e.hp,
    maxHp: e.hp,
    dmg: e.dmg,
    dodge: e.dodge || 0,
    lastAtk: performance.now()
  };

  enemyIcon.textContent = enemy.icon;
  enemyNumber.textContent = currentEnemy;
  log(`Enemy #${currentEnemy}: ${enemy.name}`);
  updateBars();
}

// Attack helpers
function catAttack() {
  let dmg = cat.atk;

  if (tactic === "tacAgg" && Math.random() < 0.10) {
    dmg *= 2;
    log("Fury strike! (Aggression)");
  }

  if (tactic === "tacChaos") {
    const roll = Math.random();
    if (roll < 0.25) {
      dmg *= 2;
      log("Chaos Crit!");
    } else if (roll < 0.5) {
      cat.hp = Math.min(cat.baseHp, cat.hp + 5);
      log("Chaos Heal +5");
    } else if (roll < 0.75) {
      enemy.lastAtk = performance.now() + 1000;
      log("Chaos Stun!");
    } else {
      log("Chaos Miss!");
      return;
    }
  }

  enemy.hp -= dmg;
  log(`Cat hits for ${dmg}`);
}

function enemyAttack() {
  if (Math.random() < enemy.dodge) {
    log(`${enemy.name} dodged!`);
    return;
  }

  let dmg = enemy.dmg;
  if (tactic === "tacDeescalate" && Math.random() < 0.20) {
    log("Cat Dodge! (De-escalation)");
    return;
  }

  cat.hp -= dmg;
  log(`${enemy.name} hits for ${dmg}`);

  if (tactic === "tacDeescalate" && Math.random() < 0.15) {
    enemy.hp -= cat.atk;
    log("Counter attack!");
  }
}

function updateBars() {
  catHpLabel.textContent = Math.max(0, cat.hp.toFixed(0));
  enemyHpLabel.textContent = Math.max(0, enemy.hp.toFixed(0));

  catHpBar.style.width = (cat.hp / cat.baseHp) * 100 + "%";
  enemyHpBar.style.width = (enemy.hp / enemy.maxHp) * 100 + "%";
}

// Game loop
function loop() {
  const now = performance.now();

  if (cat.hp <= 0) {
    endGame(false);
    return;
  }
  if (enemy.hp <= 0) {
    spawnEnemy();
  }

  if (now - cat.lastAtk >= cat.atkSpeed * 1000) {
    catAttack();
    cat.lastAtk = now;
  }

  if (now - enemy.lastAtk >= 1200) {
    enemyAttack();
    enemy.lastAtk = now;
  }

  updateBars();
  gameLoop = requestAnimationFrame(loop);
}

// End game
function endGame(win) {
  endScreen.classList.add("visible");
  document.getElementById("endTitle").textContent = win ? "YOU WIN 😼🔥" : "CAT DIED 💀";
  document.getElementById("endDesc").textContent = win
    ? "Twój kot przeorał wszystkich 10 przeciwników."
    : "RIP kot. Następnym razem wybierz mądrzej.";

  cancelAnimationFrame(gameLoop);
  log(win ? "Victory!" : "Defeat.");
}