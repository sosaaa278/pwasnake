

const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

const arena = createMatrix(10, 20);

const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
};

const colors = [
    null,
    '#9b59b6',
    '#f1c40f',
    '#e67e22',
    '#3498db',
    '#1abc9c',
    '#2ecc71',
    '#e74c3c'
];

let dropCounter = 0;
let dropInterval = 800;
let lastTime = 0;
let isPaused = false;
let gameOver = false;
let level = 1;

function createMatrix(w, h) {
    const matrix = [];
    while (h--) matrix.push(new Array(w).fill(0));
    return matrix;
}

function createPiece(type) {
    if (type === 'T') return [[0, 1, 0], [1, 1, 1], [0, 0, 0]];
    if (type === 'O') return [[2, 2], [2, 2]];
    if (type === 'L') return [[0, 3, 0], [0, 3, 0], [0, 3, 3]];
    if (type === 'J') return [[0, 4, 0], [0, 4, 0], [4, 4, 0]];
    if (type === 'I') return [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]];
    if (type === 'S') return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
    if (type === 'Z') return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = '#0b1f1a';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);

    context.fillStyle = '#eafff6';
    context.font = '1px Arial';
    context.textAlign = 'left';
    context.fillText(`Score: ${player.score}`, 0.2, 1);
    context.fillText(`Nivel: ${level}`, 0.2, 2);

    if (isPaused) overlayText('PAUSA');
    if (gameOver) overlayText('GAME OVER');
}

function overlayText(text) {
    context.fillStyle = 'rgba(0,0,0,0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#fff';
    context.font = '2px Arial';
    context.textAlign = 'center';
    context.fillText(text, canvas.width / 40, canvas.height / 40);
}

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; y++) {
        for (let x = 0; x < m[y].length; x++) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y >= 0; y--) {
        for (let x = 0; x < arena[y].length; x++) {
            if (arena[y][x] === 0) continue outer;
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        y++;
        player.score += rowCount * 100;
        rowCount *= 2;
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        arenaSweep();
        playerReset();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) player.pos.x -= dir;
}

function rotate(matrix) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < y; x++) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    matrix.forEach(row => row.reverse());
}

function playerRotate() {
    rotate(player.matrix);
    if (collide(arena, player)) rotate(player.matrix);
}

function playerReset() {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        gameOver = true;
    }
}

function updateLevel() {
    level = Math.floor(player.score / 500) + 1;
    dropInterval = Math.max(150, 800 - (level - 1) * 80);
}

function update(time = 0) {
    if (isPaused || gameOver) {
        draw();
        requestAnimationFrame(update);
        return;
    }

    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if (dropCounter > dropInterval) {
        playerDrop();
    }

    updateLevel();
    draw();
    requestAnimationFrame(update);
}

document.addEventListener('keydown', e => {
    if (gameOver && e.key === 'Enter') location.reload();
    if (e.key === 'ArrowLeft') playerMove(-1);
    if (e.key === 'ArrowRight') playerMove(1);
    if (e.key === 'ArrowDown') playerDrop();
    if (e.key === 'ArrowUp') playerRotate();
    if (e.key.toLowerCase() === 'p') isPaused = !isPaused;
});

playerReset();
update();

function moveLeft() {
    if (!isPaused && !gameOver) playerMove(-1);
}

function moveRight() {
    if (!isPaused && !gameOver) playerMove(1);
}

function drop() {
    if (!isPaused && !gameOver) playerDrop();
}

function rotatePiece() {
    if (!isPaused && !gameOver) playerRotate();
}

function togglePause() {
    isPaused = !isPaused;
}
document.getElementById('left').addEventListener('touchstart', e => {
    e.preventDefault();
    moveLeft();
});

document.getElementById('right').addEventListener('touchstart', e => {
    e.preventDefault();
    moveRight();
});

document.getElementById('down').addEventListener('touchstart', e => {
    e.preventDefault();
    drop();
});

document.getElementById('rotate').addEventListener('touchstart', e => {
    e.preventDefault();
    rotatePiece();
});

document.getElementById('pause').addEventListener('touchstart', e => {
    e.preventDefault();
    togglePause();
});
document.body.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
