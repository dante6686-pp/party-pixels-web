import './style.css'
import { createGame } from './game/createGame'
import { wireUI } from './ui/wireUI'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="page">
    <header class="topbar">
      <div class="brand">Party Pixels • Wojna na Osiedlu</div>
      <div class="status">
        <span id="p2hp">P2 HP: 15</span>
        <span class="dot">•</span>
        <span id="turn">Tura: 1</span>
        <span class="dot">•</span>
        <span id="p1hp">P1 HP: 15</span>
      </div>
    </header>

    <main class="layout">
      <section class="gameWrap">
        <div id="gameRoot" class="gameRoot"></div>

        <!-- DOM overlay: przyciski/reakcje -->
        <div class="hud">
          <div class="hudRow">
            <button id="btnPlay" class="btn primary">ZAGRAJ</button>
            <button id="btnEnd" class="btn">END TURN</button>
          </div>

          <div class="hudRow">
            <button id="btnReact" class="btn ghost">😈 Reakcja</button>
            <button id="btnShare" class="btn ghost">🔗 Share</button>
          </div>

          <div id="toast" class="toast" aria-live="polite"></div>
        </div>
      </section>

      <aside class="side">
        <div class="panel">
          <div class="panelTitle">Karta w ręce</div>
          <div id="handCard" class="handCard">—</div>
          <div class="panelHint">MVP: 1 karta widoczna, reszta później.</div>
        </div>

        <div class="panel">
          <div class="panelTitle">Log</div>
          <div id="log" class="log"></div>
        </div>
      </aside>
    </main>
  </div>
`

const game = createGame(document.getElementById('gameRoot')!)
wireUI(game)
