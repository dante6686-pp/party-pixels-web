import type { GameAPI } from '../game/createGame'

export function wireUI(game: GameAPI) {
  const btnPlay = document.getElementById('btnPlay') as HTMLButtonElement
  const btnEnd = document.getElementById('btnEnd') as HTMLButtonElement
  const btnReact = document.getElementById('btnReact') as HTMLButtonElement
  const btnShare = document.getElementById('btnShare') as HTMLButtonElement

  const p1hp = document.getElementById('p1hp')!
  const p2hp = document.getElementById('p2hp')!
  const turn = document.getElementById('turn')!
  const handCard = document.getElementById('handCard')!
  const log = document.getElementById('log')!
  const toast = document.getElementById('toast')!

  const render = () => {
    const s = game.getState()
    p1hp.textContent = `P1 HP: ${s.players.p1.hp}`
    p2hp.textContent = `P2 HP: ${s.players.p2.hp}`
    turn.textContent = `Tura: ${s.turn}`
    handCard.textContent = s.hand[0] ?? '—'
  }

  const say = (msg: string) => {
    toast.textContent = msg
    setTimeout(() => { if (toast.textContent === msg) toast.textContent = '' }, 900)
  }

  btnPlay.onclick = () => { game.playCard(); say('Zagrano') }
  btnEnd.onclick = () => { game.endTurn(); say('Drama resolved') }
  btnReact.onclick = () => { game.react(); say('Hańba poszła w eter') }
  btnShare.onclick = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      say('Link skopiowany')
    } catch {
      say('Nie mogę skopiować — skopiuj ręcznie')
    }
  }

  game.events.on('state:changed', render)
  game.events.on('log:push', (s: string) => {
    log.textContent = `${s}\n${log.textContent ?? ''}`.slice(0, 2000)
  })

  render()
}
