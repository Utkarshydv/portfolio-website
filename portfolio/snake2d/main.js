const TILE_SIZE = 16;
const GRID_WIDTH = 35;
const GRID_HEIGHT = 15;
const TOP_PADDING_TILES = 1;
const BOTTOM_PADDING_TILES = 2;

const TOTAL_HEIGHT = (TOP_PADDING_TILES + GRID_HEIGHT + BOTTOM_PADDING_TILES) * TILE_SIZE;

const config = {
  type: Phaser.AUTO,
  width: GRID_WIDTH * TILE_SIZE,
  height: TOTAL_HEIGHT,
  backgroundColor: '#000000',
  parent: 'game',
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

let snake = [];
let apple;
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let moveTimer = 0;
let speed = 150;
let isDead = false;
let deadText;

function preload() {
  this.load.image('snake', 'assets/snake.png');
  this.load.image('apple', 'assets/apple.png');
}

function create() {
  this.input.keyboard.addCapture(['LEFT', 'RIGHT', 'UP', 'DOWN']);

  // Red border around playable area
  const graphics = this.add.graphics();
  graphics.lineStyle(2, 0xffffff);
  graphics.strokeRect(
    0,
    TOP_PADDING_TILES * TILE_SIZE,
    config.width,
    GRID_HEIGHT * TILE_SIZE
  );

  // Snake start position in middle of grid
  const startY = (TOP_PADDING_TILES + Math.floor(GRID_HEIGHT / 2)) * TILE_SIZE;
  snake.push(this.add.image(8 * TILE_SIZE, startY, 'snake').setOrigin(0));
  snake.push(this.add.image(7 * TILE_SIZE, startY, 'snake').setOrigin(0));
  snake.push(this.add.image(6 * TILE_SIZE, startY, 'snake').setOrigin(0));

  placeApple(this);

  this.input.keyboard.on('keydown', (e) => {
    if (isDead) location.reload();
    if (e.key === 'ArrowLeft' && direction !== 'RIGHT') nextDirection = 'LEFT';
    if (e.key === 'ArrowRight' && direction !== 'LEFT') nextDirection = 'RIGHT';
    if (e.key === 'ArrowUp' && direction !== 'DOWN') nextDirection = 'UP';
    if (e.key === 'ArrowDown' && direction !== 'UP') nextDirection = 'DOWN';
  });
}

function update(time) {
  if (isDead) return;
  if (time > moveTimer) {
    moveSnake(this);
    moveTimer = time + speed;
  }
}

function moveSnake(scene) {
  direction = nextDirection;
  const head = snake[0];
  let newX = head.x;
  let newY = head.y;

  switch (direction) {
    case 'LEFT': newX -= TILE_SIZE; break;
    case 'RIGHT': newX += TILE_SIZE; break;
    case 'UP': newY -= TILE_SIZE; break;
    case 'DOWN': newY += TILE_SIZE; break;
  }

  // Horizontal wrapping
  if (newX < 0) newX = (GRID_WIDTH - 1) * TILE_SIZE;
  else if (newX >= config.width) newX = 0;

  // Vertical wrapping within playable area
  const minY = TOP_PADDING_TILES * TILE_SIZE;
  const maxY = minY + (GRID_HEIGHT - 1) * TILE_SIZE;
  if (newY < minY) newY = maxY;
  else if (newY > maxY) newY = minY;

  // Collision with self
  if (snake.some(segment => segment.x === newX && segment.y === newY)) {
    gameOver(scene);
    return;
  }

  const newHead = scene.add.image(newX, newY, 'snake').setOrigin(0);
  snake.unshift(newHead);

  if (apple.x === newX && apple.y === newY) {
    placeApple(scene);
  } else {
    const tail = snake.pop();
    tail.destroy();
  }
}

function placeApple(scene) {
  let x, y, collides;
  do {
    x = Phaser.Math.Between(0, GRID_WIDTH - 1) * TILE_SIZE;
    y = Phaser.Math.Between(0, GRID_HEIGHT - 1) * TILE_SIZE + TOP_PADDING_TILES * TILE_SIZE;
    collides = snake.some(segment => segment.x === x && segment.y === y);
  } while (collides);

  if (apple) {
    apple.setPosition(x, y);
  } else {
    apple = scene.add.image(x, y, 'apple').setOrigin(0);
  }
}

function gameOver(scene) {
  isDead = true;
  deadText = scene.add.text(
    config.width / 2, config.height / 2,
    'DEAD',
    { fontSize: '32px', fill: '#ff0000ff', fontFamily: 'monospace' }
  ).setOrigin(0.5);
}