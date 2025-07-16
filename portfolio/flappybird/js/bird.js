export default class Bird {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'bird').setScale(1.3);

    scene.anims.create({
      key: 'flap',
      frames: scene.anims.generateFrameNumbers('bird', { start: 0, end: 2 }),
      frameRate: 10,
      repeat: -1
    });

    this.sprite.play('flap');

    scene.input.keyboard.on('keydown-SPACE', () => {
      if (!scene.gameOver) {
        this.sprite.setVelocityY(-250);
      }
    });
  }
}