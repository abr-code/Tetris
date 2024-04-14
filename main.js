const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d");
const score = document.getElementById("score");
const dialog = document.querySelector("dialog");
const dialogText = document.querySelector("dialog span");
const dialogButton = document.querySelector("dialog button");

dialog.showModal(); // Opens a modal
let moveDownIntervalId;
const CURRENT_TETROMINO = [];
dialogButton.addEventListener("click", () => {
  resetGame();
  setUpGame();
  moveDownIntervalId = setInterval(() => moveDown(CURRENT_TETROMINO[0]), 1000);
  dialog.close();
});
const CANVAS_SCALE = 20;
const CANVAS_SQUARES_WIDTH = 20;
const CANVAS_SQUARES_HEIGHT = 28;
const MOVEMENT = 1;
canvas.width = CANVAS_SCALE * CANVAS_SQUARES_WIDTH;
canvas.height = CANVAS_SCALE * CANVAS_SQUARES_HEIGHT + 2;
ctx.scale(CANVAS_SCALE, CANVAS_SCALE);
const STOPPED_TETROMINOES = Array(CANVAS_SQUARES_HEIGHT)
  .fill(0)
  .map(() => Array(CANVAS_SQUARES_WIDTH).fill(0));
// STOPPED_TETROMINOES[STOPPED_TETROMINOES.length - 1].fill(1, 2);
drawStoppedTetrominos();
const TETROMINOS = [
  // Square vector
  [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ],
  // L vector
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2],
  ],
  // T vector
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [1, 1],
  ],
  // Z vector
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
  ],
  // I vector
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
  ],
];

const pivot = [CANVAS_SQUARES_WIDTH / 2, 5];
const angle = 90; // Angle in degrees
let gameScore = 0;

function setUpGame() {
  draw();
}

function draw() {
  // ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Pocicione tetromino in the middle
  CURRENT_TETROMINO[0] = CURRENT_TETROMINO[0].map(([x, y]) => {
    return [x + CANVAS_SQUARES_WIDTH / 2, y];
  });
  drawTetromino(CURRENT_TETROMINO[0]);
}

function drawTetromino(tetromino) {
  ctx.fillStyle = "red";
  tetromino.forEach(([x, y]) => {
    ctx.fillRect(x, y, 1, 1);
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 0.1;
    ctx.strokeRect(x, y, 1, 1);
  });
}

function deleteTetromino(tetromino) {
  ctx.fillStyle = "black";
  ctx.strokeStyle = "black";
  tetromino.forEach(([x, y]) => {
    ctx.fillRect(x, y, 1, 1);
    ctx.strokeRect(x, y, 1, 1);
  });
}

// Motions
// Move Left
window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    if (
      checkArrowLeftWallCollision(CURRENT_TETROMINO[0]) ||
      checkTetrominoCollisionDown(CURRENT_TETROMINO[0]) ||
      checkTetrominoCollisionArrowLeft(CURRENT_TETROMINO[0])
    )
      return;
    deleteTetromino(CURRENT_TETROMINO[0]);

    //move tetromino left
    CURRENT_TETROMINO[0] = CURRENT_TETROMINO[0].map(([x, y]) => {
      return [x - MOVEMENT, y];
    });
    drawTetromino(CURRENT_TETROMINO[0]);
  }
});

// Move Right
window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    if (
      checkArrowRightWallCollision(CURRENT_TETROMINO[0]) ||
      checkTetrominoCollisionDown(CURRENT_TETROMINO[0]) ||
      checkTetrominoCollisionArrowRight(CURRENT_TETROMINO[0])
    )
      return;
    deleteTetromino(CURRENT_TETROMINO[0]);
    CURRENT_TETROMINO[0] = CURRENT_TETROMINO[0].map(([x, y]) => {
      return [x + MOVEMENT, y];
    });
    drawTetromino(CURRENT_TETROMINO[0]);
  }
});

// Move Down
window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") {
    if (
      checkDownCollision(CURRENT_TETROMINO[0]) ||
      checkTetrominoCollisionDown(CURRENT_TETROMINO[0])
    )
      return;
    deleteTetromino(CURRENT_TETROMINO[0]);
    CURRENT_TETROMINO[0] = CURRENT_TETROMINO[0].map(([x, y]) => {
      return [x, y + MOVEMENT];
    });
    drawTetromino(CURRENT_TETROMINO[0]);
  }
});

// Move Down interval
function moveDown(tetromino) {
  if (checkDownCollision(tetromino) || checkTetrominoCollisionDown(tetromino)) {
    newTetromino();
    return;
  }
  deleteTetromino(CURRENT_TETROMINO[0]);
  CURRENT_TETROMINO[0] = CURRENT_TETROMINO[0].map(([x, y]) => {
    return [x, y + MOVEMENT];
  });
  drawTetromino(CURRENT_TETROMINO[0]);
}

// Rotation
window.addEventListener("keydown", (event) => {
  let rotatedTetromino;
  if (event.key === "ArrowUp") {
    // tetromino colision down
    if (checkTetrominoCollisionDown(CURRENT_TETROMINO[0])) return;

    // Rotate tetromino
    rotatedTetromino = CURRENT_TETROMINO[0].map(([x, y]) => {
      return rotatePoint([x, y], CURRENT_TETROMINO[0][1], angle);
    });
    // check Top collision
    if (checkWallTopCollision(rotatedTetromino)) return;
    // collison left/right at the same time
    if (checkMultiplePointTetrominoCollision(rotatedTetromino)) return;

    // Solve left collision
    if (
      //check wall left collison
      checkWallLeftRotatedCollision(rotatedTetromino) ||
      checkTetrominoCollisionLeft(rotatedTetromino)
    ) {
      while (
        //check wall left collison
        checkWallLeftRotatedCollision(rotatedTetromino) ||
        checkTetrominoCollisionLeft(rotatedTetromino)
      ) {
        rotatedTetromino = rotatedTetromino.map(([x, y]) => {
          return [x + MOVEMENT, y];
        });

        if (checkTetrominoCollisionRight(rotatedTetromino)) return;
      }
    }

    //solve right collision
    if (
      checkWallRightRotatedCollision(rotatedTetromino) ||
      checkTetrominoCollisionRight(rotatedTetromino)
    ) {
      while (
        checkWallRightRotatedCollision(rotatedTetromino) ||
        checkTetrominoCollisionRight(rotatedTetromino)
      ) {
        rotatedTetromino = rotatedTetromino.map(([x, y]) => {
          return [x - MOVEMENT, y];
        });
        if (checkTetrominoCollisionLeft(rotatedTetromino)) return;
      }
    }
    deleteTetromino(CURRENT_TETROMINO[0]);
    CURRENT_TETROMINO[0] = rotatedTetromino;

    // rotateTetromino(CURRENT_TETROMINO[0]);
    drawTetromino(CURRENT_TETROMINO[0]);
  }
});

// collision wall rotated
function checkWallLeftRotatedCollision(tetromino) {
  return tetromino.some(([x, y]) => x < 0);
}
function checkWallRightRotatedCollision(tetromino) {
  return tetromino.some(([x, y]) => x > CANVAS_SQUARES_WIDTH - 1);
}
// Check tetromino left collision
function checkTetrominoCollisionLeft(tetromino) {
  let index = tetromino.findIndex(([x, y]) => STOPPED_TETROMINOES[y][x] === 1);
  return index >= 0 && index < 2;
}
// Check tetromino right checkDownCollision
function checkTetrominoCollisionRight(tetromino) {
  let index = tetromino.findIndex(([x, y]) => STOPPED_TETROMINOES[y][x] === 1);
  return index >= 2 && index < 4;
}

// Left collision
function checkArrowLeftWallCollision(tetromino) {
  return tetromino.some(([x, y]) => x - MOVEMENT < 0);
}
//right collision
function checkArrowRightWallCollision(tetromino) {
  return tetromino.some(([x, y]) => x + MOVEMENT > CANVAS_SQUARES_WIDTH - 1);
}

// top collision
function checkWallTopCollision(tetromino) {
  return tetromino.some(([x, y]) => y < 0);
}
//down collision
function checkDownCollision(tetromino) {
  return tetromino.some(([x, y]) => y + MOVEMENT > CANVAS_SQUARES_HEIGHT - 1);
}

// check any tetromino colission especialy used when rotate
function checkMultiplePointTetrominoCollision(tetromino) {
  //Check is ther is more than one collison
  let counter = 0;
  tetromino.forEach(([x, y]) => {
    if (STOPPED_TETROMINOES[y + MOVEMENT][x] === 1) {
      counter += 1;
    }
  });

  if (counter > 1) {
    return true;
  }
  return false;
}
//tetromino collision down arrow down
function checkTetrominoCollisionDown(tetromino) {
  return tetromino.some(([x, y]) => STOPPED_TETROMINOES[y + MOVEMENT][x] === 1);
}
// tetromino collision left with arrow left
function checkTetrominoCollisionArrowLeft(tetromino) {
  return tetromino.some(([x, y]) => STOPPED_TETROMINOES[y][x - MOVEMENT] === 1);
}
// tetromino collision right with arrow right
function checkTetrominoCollisionArrowRight(tetromino) {
  return tetromino.some(([x, y]) => STOPPED_TETROMINOES[y][x + MOVEMENT] === 1);
}

// Tetrominoes
function newTetromino() {
  saveSoppedTetromino(CURRENT_TETROMINO[0]);
  let completedLines = checkCompletedLines();
  if (completedLines) {
    gameScore += 10 * completedLines;
    score.textContent = `Score: ${gameScore}`;
  }
  drawStoppedTetrominos();

  CURRENT_TETROMINO[0] = [
    ...TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)],
    // ...TETROMINOS[4],
  ];
  // Pocicione tetromino in the middle
  CURRENT_TETROMINO[0] = CURRENT_TETROMINO[0].map(([x, y]) => {
    return [x + CANVAS_SQUARES_WIDTH / 2, y];
  });
  drawTetromino(CURRENT_TETROMINO[0]);
  if (checkTetrominoCollisionDown(CURRENT_TETROMINO[0])) {
    console.log("GAME OVER");
    dialogText.textContent = "GAME OVER";
    dialogButton.textContent = "Play Again";
    dialog.showModal();
    clearInterval(moveDownIntervalId);
    return;
  }
}

function saveSoppedTetromino(tetromino) {
  tetromino.forEach(([x, y]) => {
    STOPPED_TETROMINOES[y][x] = 1;
  });
}
function drawStoppedTetrominos() {
  STOPPED_TETROMINOES.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        ctx.fillStyle = "red";
        ctx.strokeStyle = "blue";
        ctx.fillRect(x, y, 1, 1);
        ctx.strokeRect(x, y, 1, 1);
      } else {
        ctx.fillStyle = "black";
        ctx.strokeStyle = "black";
        ctx.fillRect(x, y, 1, 1);
        ctx.strokeRect(x, y, 1, 1);
      }
    });
  });
}

function checkCompletedLines() {
  let completedLines = 0;
  STOPPED_TETROMINOES.forEach((row, y) => {
    if (row.every((value) => value === 1)) {
      STOPPED_TETROMINOES.splice(y, 1);
      STOPPED_TETROMINOES.unshift(Array(CANVAS_SQUARES_WIDTH).fill(0));
      completedLines++;
    }
  });
  return completedLines;
}

// Rotate Tetrominoes
function rotateTetromino(tetromino) {
  const newTetromino = tetromino.map(([x, y]) => {
    return [y, -x];
  });
  if (
    !checkArrowLeftWallCollision(newTetromino) &&
    !checkArrowRightWallCollision(newTetromino)
  ) {
    deleteTetromino(tetromino);
    tetromino = newTetromino;
    drawTetromino(tetromino);
  }
  return tetromino;
}

function rotatePoint(point, pivot, angle) {
  // Translate the point and pivot to the origin
  const translatedX = point[0] - pivot[0];
  const translatedY = point[1] - pivot[1];

  // Convert angle to radians
  const angleRad = (angle * Math.PI) / 180;

  // Perform rotation
  const rotatedX =
    translatedX * Math.cos(angleRad) - translatedY * Math.sin(angleRad);
  const rotatedY =
    translatedX * Math.sin(angleRad) + translatedY * Math.cos(angleRad);

  // Translate the rotated point back to its original position
  const newX = rotatedX + pivot[0];
  const newY = rotatedY + pivot[1];

  return [Math.round(newX), Math.round(newY)];
}

//Reset game
function resetGame() {
  clearInterval(moveDownIntervalId);
  CURRENT_TETROMINO[0] = [
    ...TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)],
  ];
  STOPPED_TETROMINOES.length = 0;
  let newStoppedTetrominos = Array(CANVAS_SQUARES_HEIGHT)
    .fill(0)
    .map(() => Array(CANVAS_SQUARES_WIDTH).fill(0));

  STOPPED_TETROMINOES.push(...newStoppedTetrominos);
  gameScore = 0;
}
