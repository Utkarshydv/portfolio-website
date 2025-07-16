class Level5 extends Phaser.Scene {
  constructor() {
    super("Level5");
  }

  create() {
    this.trapTiles = [];
    const map = this.make.tilemap({ tileWidth: 16, tileHeight: 16, width: 30, height: 17 });
    const tileset = map.addTilesetImage("tiles", null, 16, 16);
    const layer = map.createBlankLayer("Ground", tileset);

    const rowYs = [3, 8, 13]; // y positions of top rows of each 2-tile-thick platform

    // Create platforms and trap tiles (top row of each platform disappears)
    rowYs.forEach(rowY => {
      for (let y = rowY; y <= rowY + 1; y++) {
        for (let x = 0; x < 30; x++) {
          const tile = layer.putTileAt(0, x, y);
          tile.setCollision(true);

          if (y === rowY) {
            this.trapTiles.push({ x, y, triggered: false });
          }
        }
      }
    });

    this.spikes = this.physics.add.staticGroup();

    // Adjusted spike rows, moved up by 1 tile
    // Between first and second platform: y = 4.5 (moved to 3.5)
    for (let x = 0; x < 28; x++) {
      this.spikes.create(x * 16 + 8, 3.5 * 16, "spike").setOrigin(0.5).refreshBody();
    }

    // Between second and third platform: y = 9.5 (moved to 8.5), skip first 2
    for (let x = 2; x < 30; x++) {
      this.spikes.create(x * 16 + 8, 8.5 * 16, "spike").setOrigin(0.5).refreshBody();
    }

    // Between third platform and floor: y = 14.5 (moved to 13.5)
    for (let x = 0; x < 28; x++) {
      this.spikes.create(x * 16 + 8, 13.5 * 16, "spike").setOrigin(0.5).refreshBody();
    }

    this.player = this.physics.add.sprite(16, 32, "player_idle");
    this.player.setCollideWorldBounds(true).setSize(12, 16).setOffset(2, 0);

    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("player_run", { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1
    });

    // Portal moved 1 tile to the right
    this.portal = this.physics.add.sprite(29 * 16, 15 * 16, "portal").setOrigin(0);
    this.portal.body.setAllowGravity(false);
    this.portal.setImmovable(true);

    this.physics.add.collider(this.player, layer);
    this.physics.add.overlap(this.player, this.spikes, () => this.resetPlayer());
    this.physics.add.overlap(this.player, this.portal, () => this.scene.start("Level1"));

    this.cursors = this.input.keyboard.createCursorKeys();
    this.layer = layer;
  }

  resetPlayer() {
    this.player.setVelocity(0);
    this.player.setPosition(16, 32);
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