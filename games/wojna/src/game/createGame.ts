import Phaser from 'phaser'
import BootScene from './scenes/BootScene'
import MatchScene from './scenes/MatchScene'

export type GameAPI = {
  phaser: Phaser.Game
  events: Phaser.Events.EventEmitter
  getState: () => any
  playCard: () => void
  endTurn: () => void
  react: () => void
}

export function createGame(parentEl: HTMLElement): GameAPI {
  const events = new Phaser.Events.EventEmitter()

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: parentEl,
    backgroundColor: '#0b0c10',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, MatchScene]
  })

  // mini state do MVP (potem podmienisz na prawdziwy model)
  const state = {
    turn: 1,
    players: { p1: { hp: 15, shame: 0 }, p2: { hp: 15, shame: 0 } },
    hand: ['Plotkara'],
    log: [] as string[]
  }

  const api: GameAPI = {
    phaser: game,
    events,
    getState: () => state,

    playCard: () => {
      events.emit('ui:playCard')
    },
    endTurn: () => {
      events.emit('ui:endTurn')
    },
    react: () => {
      events.emit('ui:react', 'HAŃBA_STICKER')
    }
  }

  // udostępniamy state dla scen przez registry (prosto i czysto)
  game.registry.set('pp_state', state)
  game.registry.set('pp_events', events)

  return api
}
