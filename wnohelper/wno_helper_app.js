const STORAGE_KEY = "wno-helper-state-v1";

const setupScreen = document.getElementById("setupScreen");
const gameScreen = document.getElementById("gameScreen");
const playerCount = document.getElementById("playerCount");
const startingHp = document.getElementById("startingHp");
const playerNameFields = document.getElementById("playerNameFields");
const startGameBtn = document.getElementById("startGameBtn");
const loadSavedBtn = document.getElementById("loadSavedBtn");
const resetAllBtn = document.getElementById("resetAllBtn");
const roundValue = document.getElementById("roundValue");
const currentPlayerValue = document.getElementById("currentPlayerValue");
const turnBanner = document.getElementById("turnBanner");
const turnBannerText = document.getElementById("turnBannerText");
const playersContainer = document.getElementById("playersContainer");
const nextPlayerBtn = document.getElementById("nextPlayerBtn");
const newGameBtn = document.getElementById("newGameBtn");
const backBtn = document.getElementById("backBtn");
const attackTargetSelect = document.getElementById("attackTargetSelect");
const confirmAttackBtn = document.getElementById("confirmAttackBtn");
const attackResult = document.getElementById("attackResult");
const playerCardTemplate = document.getElementById("playerCardTemplate");

let state = null;
let historyStack = [];

function defaultNames(count) {
  return Array.from({ length: count }, (_, i) => `Gracz ${i + 1}`);
}

function renderNameFields() {
  const count = Number(playerCount.value);
  const names = defaultNames(count);
  playerNameFields.innerHTML = "";
  names.forEach((name, i) => {
    const wrap = document.createElement("div");
    wrap.className = "field-group";
    wrap.innerHTML = `
      <label for="playerName${i}">Imię gracza ${i + 1}</label>
      <input id="playerName${i}" type="text" value="${name}" maxlength="20" />
    `;
    playerNameFields.appendChild(wrap);
  });
}

function saveState() {
  if (!state) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function cloneState(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function pushHistory() {
  if (!state) return;
  historyStack.push(cloneState(state));
  if (historyStack.length > 50) historyStack.shift();
}

function createGameState() {
  const count = Number(playerCount.value);
  const hp = Math.max(1, Number(startingHp.value) || 12);
  const players = Array.from({ length: count }, (_, i) => {
    const nameInput = document.getElementById(`playerName${i}`);
    return {
      id: i,
      name: nameInput?.value?.trim() || `Gracz ${i + 1}`,
      hp,
      eliminated: false,
      hasDisgrace: false,
      disgracePendingTurn: false,
      attackMemory: {
        targetId: null,
        streak: 0
      }
    };
  });

  return {
    round: 1,
    currentPlayerIndex: 0,
    players,
    lastAttackMessage: "",
    version: 1
  };
}

function startNewGame() {
  historyStack = [];
  state = createGameState();
  saveState();
  showGame();
  renderGame();
}

function loadSavedGame() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    alert("Brak zapisu gry.");
    return;
  }
  try {
    state = JSON.parse(raw);
    historyStack = [];
    showGame();
    renderGame();
  } catch {
    alert("Nie udało się wczytać zapisu.");
  }
}

function showGame() {
  setupScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
}

function showSetup() {
  gameScreen.classList.add("hidden");
  setupScreen.classList.remove("hidden");
}

function getCurrentPlayer() {
  return state.players[state.currentPlayerIndex];
}

function alivePlayers() {
  return state.players.filter(p => !p.eliminated);
}

function updateTurnBanner() {
  const current = getCurrentPlayer();
  const isDisgracedTurn = current.disgracePendingTurn;
  turnBanner.classList.toggle("normal", !isDisgracedTurn);
  turnBanner.querySelector(".turn-banner-title").textContent = isDisgracedTurn
    ? "HAŃBA — ograniczona tura"
    : "Normalna tura";
  turnBannerText.textContent = isDisgracedTurn
    ? `${current.name} może tylko dobrać kartę. Nie zagrywa kart i nie atakuje.`
    : `${current.name} może dobrać kartę, zagrać 1 kartę i zaatakować.`;
}

function renderAttackTargets() {
  const current = getCurrentPlayer();
  attackTargetSelect.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Wybierz atakowanego gracza";
  attackTargetSelect.appendChild(placeholder);

  state.players
    .filter(p => p.id !== current.id && !p.eliminated)
    .forEach(player => {
      const opt = document.createElement("option");
      opt.value = String(player.id);
      opt.textContent = player.name;
      attackTargetSelect.appendChild(opt);
    });

  attackResult.textContent = state.lastAttackMessage || "";
  const disabled = current.disgracePendingTurn || alivePlayers().length <= 1;
  attackTargetSelect.disabled = disabled;
  confirmAttackBtn.disabled = disabled;
}

function playerStatusText(player) {
  const bits = [];
  if (player.hasDisgrace) bits.push("Jednostki: -1 siły");
  if (player.disgracePendingTurn) bits.push("Następna tura: tylko dobiera kartę");
  if (!bits.length) return "Brak statusów";
  return bits.join(" • ");
}

function renderPlayers() {
  playersContainer.innerHTML = "";
  const current = getCurrentPlayer();

  state.players.forEach(player => {
    const node = playerCardTemplate.content.firstElementChild.cloneNode(true);
    node.classList.toggle("active", player.id === current.id);
    node.classList.toggle("eliminated", player.eliminated);

    node.querySelector(".player-name").textContent = player.name;
    node.querySelector(".player-meta").textContent = playerStatusText(player);
    node.querySelector(".hp-value").textContent = player.hp;
    node.querySelector(".active-badge").classList.toggle("hidden", player.id !== current.id);
    node.querySelector(".disgrace-badge").classList.toggle("hidden", !player.hasDisgrace && !player.disgracePendingTurn);
    node.querySelector(".out-badge").classList.toggle("hidden", !player.eliminated);
    node.querySelector(".card-footer").textContent = `Atak z rzędu od tego gracza: ${player.attackMemory.streak} ${player.attackMemory.targetId !== null ? `(cel: ${state.players[player.attackMemory.targetId]?.name || "?"})` : ""}`;

    const minusBtn = node.querySelector(".minus");
    const plusBtn = node.querySelector(".plus");
    const disgraceBtn = node.querySelector(".disgrace-toggle");

    minusBtn.disabled = player.eliminated;
    plusBtn.disabled = false;
    disgraceBtn.disabled = player.eliminated;

    minusBtn.addEventListener("click", () => adjustHp(player.id, -1));
    plusBtn.addEventListener("click", () => adjustHp(player.id, 1));
    disgraceBtn.addEventListener("click", () => toggleDisgrace(player.id));

    playersContainer.appendChild(node);
  });
}

function renderGame() {
  if (!state) return;
  roundValue.textContent = state.round;
  currentPlayerValue.textContent = getCurrentPlayer().name;
  updateTurnBanner();
  renderAttackTargets();
  renderPlayers();
  saveState();
}

function adjustHp(playerId, amount) {
  pushHistory();
  const player = state.players[playerId];
  player.hp = Math.max(0, player.hp + amount);
  if (player.hp === 0) {
    player.eliminated = true;
    player.hasDisgrace = false;
    player.disgracePendingTurn = false;
  } else if (player.hp > 0) {
    player.eliminated = false;
  }
  renderGame();
}

function toggleDisgrace(playerId) {
  pushHistory();
  const player = state.players[playerId];
  if (!player.hasDisgrace && !player.disgracePendingTurn) {
    player.hasDisgrace = true;
    player.disgracePendingTurn = true;
  } else {
    player.hasDisgrace = false;
    player.disgracePendingTurn = false;
  }
  renderGame();
}

function registerAttack() {
  const current = getCurrentPlayer();
  const targetId = Number(attackTargetSelect.value);
  if (Number.isNaN(targetId)) return;

  pushHistory();
  if (current.attackMemory.targetId === targetId) {
    current.attackMemory.streak += 1;
  } else {
    current.attackMemory.targetId = targetId;
    current.attackMemory.streak = 1;
  }

  if (current.attackMemory.streak >= 2) {
    const target = state.players[targetId];
    state.lastAttackMessage = `${target.name} został zaatakowany 2 razy z rzędu — dobiera kartę.`;
  } else {
    state.lastAttackMessage = `${state.players[targetId].name} został oznaczony jako cel ataku.`;
  }

  renderGame();
}

function getNextAliveIndex(fromIndex) {
  let idx = fromIndex;
  const total = state.players.length;
  for (let i = 0; i < total; i += 1) {
    idx = (idx + 1) % total;
    if (!state.players[idx].eliminated) return idx;
  }
  return fromIndex;
}

function nextPlayer() {
  if (!state) return;
  pushHistory();

  const current = getCurrentPlayer();
  if (current.disgracePendingTurn) {
    current.disgracePendingTurn = false;
    current.hasDisgrace = false;
  }

  const prevIndex = state.currentPlayerIndex;
  state.currentPlayerIndex = getNextAliveIndex(state.currentPlayerIndex);
  if (state.currentPlayerIndex <= prevIndex) {
    state.round += 1;
  }

  state.lastAttackMessage = "";
  renderGame();
}

function undo() {
  if (!historyStack.length) return;
  state = historyStack.pop();
  renderGame();
}

function resetEverything() {
  if (!confirm("Na pewno zresetować wszystko?")) return;
  localStorage.removeItem(STORAGE_KEY);
  historyStack = [];
  state = null;
  showSetup();
}

playerCount.addEventListener("change", renderNameFields);
startGameBtn.addEventListener("click", startNewGame);
loadSavedBtn.addEventListener("click", loadSavedGame);
nextPlayerBtn.addEventListener("click", nextPlayer);
backBtn.addEventListener("click", undo);
newGameBtn.addEventListener("click", () => {
  if (!confirm("Zacząć nową grę?")) return;
  showSetup();
});
resetAllBtn.addEventListener("click", resetEverything);
confirmAttackBtn.addEventListener("click", registerAttack);

renderNameFields();
