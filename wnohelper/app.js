const STORAGE_KEY = "wno-helper-fixed-v1";
const setupEl = document.getElementById("setup");
const gameEl = document.getElementById("game");
const playerCountEl = document.getElementById("playerCount");
const startHpEl = document.getElementById("startHP");
const playerNamesEl = document.getElementById("playerNames");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const roundEl = document.getElementById("round");
const currentPlayerEl = document.getElementById("currentPlayer");
const turnHintEl = document.getElementById("turnHint");
const playersEl = document.getElementById("players");
const nextTurnBtn = document.getElementById("nextTurn");
const undoBtn = document.getElementById("undo");
let state = null;
let historyStack = [];
function saveState(){ if(state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function loadState(){ try{ const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; }catch{return null;} }
function cloneState(v){ return JSON.parse(JSON.stringify(v)); }
function pushHistory(){ historyStack.push(cloneState(state)); if(historyStack.length>60) historyStack.shift(); }
function createNameFields(){
  const count = Number(playerCountEl.value);
  playerNamesEl.innerHTML = "";
  for(let i=0;i<count;i++){
    const label = document.createElement("label");
    label.className = "field";
    label.innerHTML = `<span>Gracz ${i+1}</span><input type="text" maxlength="20" value="Gracz ${i+1}">`;
    playerNamesEl.appendChild(label);
  }
}
function getLivingPlayers(){ return state.players.filter(p => !p.dead); }
function currentPlayer(){ return state.players[state.current]; }
function nextAliveIndex(from){
  let idx = from;
  const len = state.players.length;
  for(let i=0;i<len;i++){
    idx = (idx + 1) % len;
    if(!state.players[idx].dead) return idx;
  }
  return from;
}
function startGame(){
  const count = Number(playerCountEl.value);
  const hp = Math.max(1, Number(startHpEl.value) || 12);
  const inputs = [...playerNamesEl.querySelectorAll("input")];
  state = {
    round: 1,
    current: 0,
    players: inputs.slice(0,count).map((input,i)=>({
      id:i+1, name: input.value.trim() || `Gracz ${i+1}`, hp, disgrace:false, disgraceSkip:false, dead:false
    }))
  };
  historyStack = [];
  saveState();
  syncLayout();
  render();
}
function syncLayout(){
  const inGame = !!state;
  setupEl.classList.toggle("hidden", inGame);
  gameEl.classList.toggle("hidden", !inGame);
  resetBtn.classList.toggle("hidden", !inGame);
  if(inGame) playersEl.classList.toggle("multi", state.players.length > 2);
}
function adjustHp(index, amount){
  const p = state.players[index];
  if(!p || p.dead) return;
  pushHistory();
  p.hp += amount;
  if(p.hp <= 0){
    p.hp = 0;
    p.dead = true;
    p.disgrace = false;
    p.disgraceSkip = false;
    if(state.current === index) state.current = nextAliveIndex(index);
  }
  saveState();
  render();
}
function toggleDisgrace(index){
  const p = state.players[index];
  if(!p || p.dead) return;
  pushHistory();
  if(p.disgrace){
    p.disgrace = false;
    p.disgraceSkip = false;
  }else{
    p.disgrace = true;
    p.disgraceSkip = true;
  }
  saveState();
  render();
}
function nextTurn(){
  if(!state) return;
  const living = getLivingPlayers();
  if(living.length <= 1) return;
  pushHistory();
  const p = currentPlayer();
  if(p.disgrace && p.disgraceSkip){
    p.disgraceSkip = false;
    p.disgrace = false;
  }
  const prev = state.current;
  state.current = nextAliveIndex(prev);
  if(state.current <= prev) state.round += 1;
  saveState();
  render();
}
function undoMove(){
  if(!historyStack.length) return;
  state = historyStack.pop();
  saveState();
  syncLayout();
  render();
}
function resetGame(){
  localStorage.removeItem(STORAGE_KEY);
  historyStack = [];
  state = null;
  syncLayout();
}
function escapeHtml(str){
  return str.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function renderStatus(){
  const living = getLivingPlayers();
  roundEl.textContent = state.round;
  if(living.length === 1){
    currentPlayerEl.textContent = living[0].name;
    turnHintEl.classList.remove("haiba");
    turnHintEl.innerHTML = `<div class="turn-hint-icon">🏆</div><div><div class="turn-hint-title">Koniec gry</div><div class="turn-hint-text">Wygrywa ${escapeHtml(living[0].name)}.</div></div>`;
    return;
  }
  const p = currentPlayer();
  currentPlayerEl.textContent = p.name;
  if(p.disgrace && p.disgraceSkip){
    turnHintEl.classList.add("haiba");
    turnHintEl.innerHTML = `<div class="turn-hint-icon">😈</div><div><div class="turn-hint-title">Hańba</div><div class="turn-hint-text">Ten gracz może tylko dobrać kartę. Nie zagrywa kart i nie atakuje.</div></div>`;
  }else{
    turnHintEl.classList.remove("haiba");
    turnHintEl.innerHTML = `<div class="turn-hint-icon">🎯</div><div><div class="turn-hint-title">Normalna tura</div><div class="turn-hint-text">Gracz może dobrać kartę, zagrać kartę i zaatakować.</div></div>`;
  }
}
function renderPlayers(){
  playersEl.innerHTML = "";
  state.players.forEach((p, index) => {
    const card = document.createElement("article");
    card.className = "player";
    if(state.current === index) card.classList.add("active");
    const unitStatus = p.disgrace ? "Jednostki: -1 siły" : "Jednostki: normalnie";
    const disgraceLabel = p.disgrace ? "Usuń Hańbę" : "Daj Hańbę";
    card.innerHTML = `
      <div class="player-top">
        <div class="player-name">${escapeHtml(p.name)}</div>
        <div class="badges">
          ${p.disgrace ? '<span class="badge haiba">😈 Hańba</span>' : ""}
          ${p.dead ? '<span class="badge out">☠ Odpada</span>' : ""}
        </div>
      </div>
      <div class="stat-row">
        <div>
          <div class="hp">❤️ ${p.hp}</div>
          <div class="hp-label">punkty życia</div>
        </div>
        <div class="unit-status">${unitStatus}</div>
      </div>
      <div class="row-actions">
        <button class="btn btn-secondary btn-hp" data-hp="${index}" data-delta="-1">-1</button>
        <button class="btn btn-secondary btn-hp" data-hp="${index}" data-delta="1">+1</button>
        <button class="btn btn-secondary" data-disgrace="${index}">${disgraceLabel}</button>
      </div>
    `;
    playersEl.appendChild(card);
  });
  document.querySelectorAll("[data-hp]").forEach(btn => {
    btn.addEventListener("click", () => adjustHp(Number(btn.dataset.hp), Number(btn.dataset.delta)));
  });
  document.querySelectorAll("[data-disgrace]").forEach(btn => {
    btn.addEventListener("click", () => toggleDisgrace(Number(btn.dataset.disgrace)));
  });
}
function render(){
  if(!state) return;
  renderStatus();
  renderPlayers();
}
playerCountEl.addEventListener("change", createNameFields);
startBtn.addEventListener("click", startGame);
nextTurnBtn.addEventListener("click", nextTurn);
undoBtn.addEventListener("click", undoMove);
resetBtn.addEventListener("click", resetGame);
createNameFields();
const loaded = loadState();
if(loaded){
  state = loaded;
  syncLayout();
  render();
}
