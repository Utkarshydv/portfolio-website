const TILE_SIZE = 16;
const GRID_SIZE = 16;
const TOTAL_BOMBS = 8;

let bombCountText;
let gameOver = false;
let tilesClicked = 0;

const config = {
  type: Phaser.AUTO,
  width: GRID_SIZE * TILE_SIZE,
  height: GRID_SIZE * TILE_SIZE + 30,
  parent: 'game-container',
  backgroundColor: '#000000',
  scene: {
    preload,
    create
  }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image('tileset', 'assets/tileset.png');
  this.load.image('tileclicked', 'assets/tileclicked.png');
  this.load.image('bomb', 'assets/bomb.png');
}

function create() {
  setupGame.call(this);
}

function setupGame() {
  this.grid = [];
  this.bombPositions = generateBombPositions();
  tilesClicked = 0;
  gameOver = false;

  this.children.removeAll(); // Clear old tiles and text

  bombCountText = this.add.text(4, GRID_SIZE * TILE_SIZE + 5, `Bombs: ${TOTAL_BOMBS}`, {
    fontSize: '14px',
    fill: '#ff5555'
  });

  for (let row = 0; row < GRID_SIZE; row++) {
    this.grid[row] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;
      const tile = this.add.image(x, y, 'tileset').setOrigin(0);
      tile.setInteractive();
      tile.row = row;
      tile.col = col;
      tile.isRevealed = false;
      tile.hasBomb = this.bombPositions.some(pos => pos.row === row && pos.col === col);
      tile.on('pointerdown', () => {
        if (!tile.isRevealed) {
          if (gameOver) {
            setupGame.call(this); // Restart if game is over
          } else {
            handleTileClick.call(this, tile);
          }
        }
      });
      this.grid[row][col] = tile;
    }
  }
}

function generateBombPositions() {
  const positions = [];
  while (positions.length < TOTAL_BOMBS) {
    const row = Phaser.Math.Between(0, GRID_SIZE - 1);
    const col = Phaser.Math.Between(0, GRID_SIZE - 1);
    if (!positions.some(p => p.row === row && p.col === col)) {
      positions.push({ row, col });
    }
  }
  return positions;
}

function handleTileClick(tile) {
  tile.isRevealed = true;

  if (tile.hasBomb) {
    tile.setTexture('bomb');
    tile.setTint(0xff0000);
    gameOver = true;
    bombCountText.setText('💥 Game Over');
    revealAllBombs.call(this);
    return;
  }

  tile.setTexture('tileclicked');
  tilesClicked++;

  const safeTiles = GRID_SIZE * GRID_SIZE - TOTAL_BOMBS;
  if (tilesClicked === safeTiles) {
    gameOver = true;
    bombCountText.setText('🏆 You Win!');
    revealAllBombs.call(this, true);
  }
}

function revealAllBombs(win = false) {
  for (const pos of this.bombPositions) {
    const tile = this.grid[pos.row][pos.col];
    if (!tile.isRevealed) {
      tile.setTexture('bomb');
      tile.setTint(win ? 0x00ff00 : 0xff0000);
    }
  }
}