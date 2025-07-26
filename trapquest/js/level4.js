class Level4 extends Phaser.Scene {
  constructor() {
    super("Level4");
  }

  create() {
    this.trapTiles = [];
    const map = this.make.tilemap({ tileWidth: 16, tileHeight: 16, width: 30, height: 17 });
    const tileset = map.addTilesetImage("tiles", null, 16, 16);
    const layer = map.createBlankLayer("Ground", tileset);

    const topRow = 5;
    const bottomRow = 11;

    // Build platform tiles
    for (let y of [topRow, topRow + 1, bottomRow, bottomRow + 1]) {
      for (let x = 0; x < 30; x++) {
        const tile = layer.putTileAt(0, x, y);
        tile.setCollision(true);

        // Only top row of each platform has disappearing tiles
        if (y === topRow || y === bottomRow) {
          this.trapTiles.push({ x, y, triggered: false });
        }
      }
    }

    this.spikes = this.physics.add.staticGroup();

    // Add spike line at the bottom of the screen (base)
    for (let x = 0; x < 30; x++) {
      this.spikes.create(x * 16, 16 * 16, "spike").setOrigin(0).refreshBody();
    }

    // Spike row aligned with top tile row (row 5), skipping last 2 columns
    for (let x = 0; x < 28; x++) {
      this.spikes.create(x * 16 + 8, (topRow + 0.5) * 16, "spike").setOrigin(0.5).refreshBody();
    }

    // Spike row aligned with bottom tile row (row 11), skipping last 2 columns
    for (let x = 0; x < 28; x++) {
      this.spikes.create(x * 16 + 8, (bottomRow + 0.5) * 16, "spike").setOrigin(0.5).refreshBody();
    }

    // Portal on bottom platform (left side)
    this.portal = this.physics.add.sprite(1 * 16, (bottomRow - 1) * 16, "portal").setOrigin(0);
    this.portal.body.setAllowGravity(false);
    this.portal.setImmovable(true);

    // Player spawn at top row
    this.player = this.physics.add.sprite(16, topRow * 16 - 20, "player_idle");
    this.player.setCollideWorldBounds(true).setSize(12, 16).setOffset(2, 0);

    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("player_run", { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1
    });

    this.physics.add.collider(this.player, layer);
    this.physics.add.overlap(this.player, this.spikes, () => this.resetPlayer());
    this.physics.add.overlap(this.player, this.portal, () => this.scene.start("Level5"));

    this.cursors = this.input.keyboard.createCursorKeys();
    this.layer = layer;
  }

  resetPlayer() {
    this.player.setVelocity(0);
    this.player.setPosition(16, 64); // Top platform spawn
  }

  update() {
    const { left, right, up } = this.cursors;

    if (left.isDown) {
      this.player.setVelocityX(-160).anims.play("run", true).setFlipX(true);
    } else if (right.isDown) {
      this.player.setVelocityX(160).anims.play("run", true).setFlipX(false);
    } else {
      this.player.setVelocityX(0).setTexture("player_idle");
    }

    if (up.isDown && this.player.body.onFloor()) {
      this.player.setVelocityY(-400).setTexture("player_jump");
    }

    if (this.player.y > 270) this.resetPlayer();

    // Disappearing top tiles
    this.trapTiles.forEach(trap => {
      if (!trap.triggered) {
        const wx = trap.x * 16, wy = trap.y * 16;
        if (
          this.player.x > wx &&
          this.player.x < wx + 16 &&
          this.player.y + this.player.height > wy &&
          this.player.y < wy + 16
        ) {
          trap.triggered = true;

          this.time.addEvent({
            delay: 100,
            repeat: 5,
            callback: () => {
              const tile = this.layer.getTileAt(trap.x, trap.y);
              if (tile) tile.alpha = tile.alpha === 1 ? 0.3 : 1;
            }
          });

          this.time.delayedCall(700, () => this.layer.removeTileAt(trap.x, trap.y));
          this.time.delayedCall(5000, () => {
            const t = this.layer.putTileAt(0, trap.x, trap.y);
            t.setCollision(true);
            trap.triggered = false;
          });
        }
      }
    });
  }
}