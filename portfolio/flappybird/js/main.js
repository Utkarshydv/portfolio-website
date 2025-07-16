import GameScene from './game.js';

const config = {
  type: Phaser.AUTO,
  width: 288,
  height: 512,
  pixelArt: true,
  backgroundColor: '#000000',
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: [GameScene]
};

new Phaser.Game(config);

// Prevent arrow keys and spacebar from scrolling the page
window.addEventListener('keydown', (e) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
    e.preventDefault();
  }
});