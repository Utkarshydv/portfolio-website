import Bird from './bird.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.load.image('ground', 'assets/ground.png');
    this.load.image('pipe', 'assets/pipe.png');
    this.load.spritesheet('bird', 'assets/bird.png', {
      frameWidth: 16,
      frameHeight: 16
    });
  }

  create() {
    this.score = 0;
    this.gameOver = false;

    this.bird = new Bird(this, 80, 200);
    this.ground = this.physics.add.staticGroup();

    // ✅ Fixed: create pipes group with gravity off
    this.pipes = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    // Build solid ground at bottom
    for (let x = 0; x < 288; x += 16) {
      this.ground.create(x + 8, 512 - 8, 'ground');
    }

    this.scoreText = this.add.text(8, 8, 'Score: 0', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#fff',
      stroke: '#000',
      strokeThickness: 3
    });

    this.gameOverText = this.add.text(144, 256, 'Game Over\nPress SPACE', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ff4c4c',
      align: 'center',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5).setVisible(false);

    // Spawn pipes on interval
    this.pipeTimer = this.time.addEvent({
      delay: 1500,
      callback: this.spawnPipes,
      callbackScope: this,
      loop: true
    });

    this.physics.add.collider(this.bird.sprite, this.pipes, this.triggerGameOver, null, this);
    this.physics.add.collider(this.bird.sprite, this.ground, this.triggerGameOver, null, this);
  }

  spawnPipes() {
    if (this.gameOver) return;

    const gapBlocks = 5;
    const totalBlocks = 32;
    const gapStart = Phaser.Math.Between(6, totalBlocks - gapBlocks - 6);

    for (let y = 0; y < totalBlocks; y++) {
      if (y < gapStart || y > gapStart + gapBlocks) {
        const pipeY = y * 16 + 8;
        
        // ✅ Create pipe that scrolls and doesn't fall
        const pipe = this.pipes.create(288, pipeY, 'pipe');
        pipe.setVelocityX(-100);
        pipe.setImmovable(true);
        pipe.body.allowGravity = false;
      }
    }

    this.score += 1;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  triggerGameOver() {
    if (this.gameOver) return;

    this.gameOver = true;
    this.physics.pause();
    this.bird.sprite.setTint(0xff0000);
    this.gameOverText.setVisible(true);

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart();
    });
  }
}