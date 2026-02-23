import Phaser from 'phaser'

export default class MatchScene extends Phaser.Scene {
  private eventsBus!: Phaser.Events.EventEmitter
  private state!: any
  private centerCard!: Phaser.GameObjects.Rectangle
  private centerText!: Phaser.GameObjects.Text

  constructor() {
    super('Match')
  }

  create() {
    this.state = this.game.registry.get('pp_state')
    this.eventsBus = this.game.registry.get('pp_events')

    const w = this.scale.width
    const h = this.scale.height

    // “stół”
    this.add.text(14, 12, 'HYPERBOLIC OSIEDLE ARENA', { fontSize: '14px' }).setAlpha(0.6)

    // karta centralnie (placeholder)
    this.centerCard = this.add.rectangle(w / 2, h / 2, 260, 360, 0xffffff, 0.10)
      .setStrokeStyle(2, 0xffffff, 0.18)

    this.centerText = this.add.text(w / 2, h / 2, this.state.hand[0] ?? '—', {
      fontSize: '26px',
      fontStyle: '700'
    }).setOrigin(0.5)

    // reactions pop (MVP)
    this.eventsBus.on('ui:react', (type: string) => {
      const pop = this.add.text(w / 2, h / 2 - 220, type === 'HAŃBA_STICKER' ? 'HAŃBA!' : '😈', {
        fontSize: '42px',
        fontStyle: '900'
      }).setOrigin(0.5)

      this.tweens.add({
        targets: pop,
        y: pop.y - 40,
        alpha: 0,
        duration: 650,
        ease: 'Cubic.easeOut',
        onComplete: () => pop.destroy()
      })
    })

    // play card
    this.eventsBus.on('ui:playCard', () => {
      const cardName = this.state.hand[0]
      if (!cardName) return

      this.log(`PLAY: ${cardName}`)
      // szybka animacja “WHAM”
      this.tweens.add({
        targets: [this.centerCard, this.centerText],
        scaleX: 1.04,
        scaleY: 1.04,
        yoyo: true,
        duration: 90,
        repeat: 1
      })

      // MVP: po zagraniu “zużyj kartę”
      this.state.hand.shift()
      this.centerText.setText(this.state.hand[0] ?? '—')
      this.eventsBus.emit('state:changed')
    })

    // end turn
    this.eventsBus.on('ui:endTurn', () => {
      this.state.turn += 1
      // MVP: dmg losowy (żeby było co oglądać)
      this.state.players.p2.hp = Math.max(0, this.state.players.p2.hp - 2)
      this.log(`END TURN → turn=${this.state.turn} (P2 -2hp)`)
      this.eventsBus.emit('state:changed')
    })

    // resize
    this.scale.on('resize', (size: Phaser.Structs.Size) => {
      const nw = size.width
      const nh = size.height
      this.centerCard.setPosition(nw / 2, nh / 2)
      this.centerText.setPosition(nw / 2, nh / 2)
    })
  }

  private log(s: string) {
    this.state.log.push(s)
    this.eventsBus.emit('log:push', s)
  }
}
