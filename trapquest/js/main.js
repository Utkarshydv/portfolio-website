const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 270,
  backgroundColor: "#000000",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 1000 }, debug: false }
  },
  scene: [Level1, Level2, Level3, Level4, Level5]
};

new Phaser.Game(config);
