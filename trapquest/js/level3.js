class Level3 extends Phaser.Scene {
  constructor() {
    super("Level3");
  }

  create() {
    this.trapTiles = [];
    const map = this.make.tilemap({ tileWidth: 16, tileHeight: 16, width: 30, height: 17 });
    const tileset = map.addTilesetImage("tiles", null, 16, 16);
    const layer = map.createBlankLayer("Ground", tileset);

    // Two platform rows (2 tiles thick) - one upper, one lower
    const platformYTop = 5;
    const platformYBottom = 11;

    for (let y of [platformYTop, platformYTop + 1, platformYBottom, platformYBottom + 1]) {
      for (let x = 0; x < 30; x++) {
        const tile = layer.putTileAt(0, x, y);
        tile.setCollision(true);
      }
    }

    // Disappearing tile columns (3-wide in center) on both rows
    const trapCols = [13, 14, 15];
    for (let col of trapCols) {
      for (let y of [platformYTop, platformYTop + 1, platformYBottom, platformYBottom + 1]) {
        const tile = layer.putTileAt(0, col, y);
        tile.setCollision(true);
        this.trapTiles.push({ x: col, y, triggered: false });
      }
    }

    // Spikes group
    this.spikes = this.physics.add.staticGroup();

    // 🔽 Add spike row at the base of the screen
    for (let x = 0; x < 30; x++) {
      this.spikes.create(x * 16, 16 * 16, "spike").setOrigin(0).refreshBody();
    }

    // 🔽 Add 3 spikes in center of lower platform's trap column (columns 13–15)
    for (let col of [13, 14, 15]) {
      this.spikes.create(col * 16 + 8, (platformYBottom + 0.5) * 16, "spike")
        .setOrigin(0.5, 0.5).refreshBody();
    }

    // Portal: bottom row, 1 tile right and 1 tile up
    this.portal = this.physics.add.sprite(1 * 16, (platformYBottom - 1) * 16, "portal").setOrigin(0);
    this.portal.body.setAllowGravity(false);
    this.portal.setImmovable(true);

    // Player start at top row
    this.player = this.physics.add.sprite(16, platformYTop * 16 - 20, "player_idle");
    this.player.setCollideWorldBounds(true).setSize(12, 16).setOffset(2, 0);

    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("player_run", { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1
    });

    this.physics.add.collider(this.player, layer);
    this.physics.add.overlap(this.player, this.spikes, () => this.resetPlayer());
    this.physics.add.overlap(this.player, this.portal, () => this.scene.start("Level4"));

    this.cursors = this.input.keyboard.createCursorKeys();
    this.layer = layer;
  }

  resetPlayer() {
    this.player.setVelocity(0);
    this.player.setPosition(16, 64); // Reset at top row
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
        if (this.player.x > wx && this.player.x < wx + 16 &&
            this.player.y + this.player.height > wy && this.player.y < wy + 16) {

          trap.triggered = true;
          this.time.addEvent({
            delay: 100, repeat: 5,
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
