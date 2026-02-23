import Phaser from 'phaser'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot')
  }

  preload() {
    // tu później wrzucisz assety kart, sfx, UI itp.
  }

  create() {
    this.scene.start('Match')
  }
}
