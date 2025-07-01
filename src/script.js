//board
let board;
const rowCount = 21;
const columnCount = 19;
const titleSize = 32;
const boardWidth = columnCount*titleSize;
const boardHeight = rowCount*titleSize;
let context;

//image
let blueGhostImage;
let orangeGhostImage;
let pinkGhostImage;
let redGhostImage;
let pacmanUpImage;
let pacmanDownImage;
let pacmanLeftImage;
let pacmanRightImage;
let wallImage;

let ghostsEatenInPowerMode = 0;


//X = wall, O = skip, P = pac man, ' ' = food
//Ghosts: b = blue, o = orange, p = pink, r = red
const tileMap = [
    "XXXXXXXXXXXXXXXXXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X                 X",
    "X XX X XXXXX X XX X",
    "X    X       X    X",
    "XXXX XXXX XXXX XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXrXX X XXXX",
    "O       bpo       O",
    "XXXX X XXXXX X XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXXXX X XXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X  X     P     X  X",
    "XX X X XXXXX X X XX",
    "X    X   X   X    X",
    "X XXXXXX X XXXXXX X",
    "X                 X",
    "XXXXXXXXXXXXXXXXXXX"
];

const walls = new Set();
const foods = new Set();
const ghosts = new Set();
const powerFoods = new Set();
let pacman;

const direction = ['U', 'D', 'L', 'R'];
let score = 0;
let lives = 3;
let gameOver = false;
let isGameStarted = false;
let powerMode = false;
let powerModeTimer = 0;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    loadImages();
    // loadMap();

    for (let ghost of ghosts.values()) {
        const newDirection = direction[Math.floor(Math.random() * 4)];
        ghost.updateDirection(newDirection);
    }

    const startBtn = document.getElementById("startBtn");
    startBtn.addEventListener("click", startGame);

    update();
    document.addEventListener("keyup", movePacman)

    drawStartScreen();
}

function update() {
    if (!isGameStarted || gameOver) {
        return;
    }
    //move
    move();
    draw();

    if (!gameOver) {
        setTimeout(update, 50);
    } else {
        isGameStarted = false;
        document.getElementById("startBtn").style.display = "block";
        drawGameOverScreen();
    }
}

function startGame() {
    document.getElementById("startBtn").style.display = "none";

    loadMap();
    resetPosition();

    lives = 3;
    score = 0;
    gameOver = false;
    isGameStarted = true;
    powerMode = false;
    powerModeTimer = 0;
    ghostsEatenInPowerMode = 0;

    document.addEventListener("keyup", movePacman);

    update();
}

function drawStartScreen() {
    context.fillStyle = "black";
    context.fillRect(0, 0, boardWidth, boardHeight);

    context.fillStyle = "yellow";
    context.font = "28px sans-serif";
    context.fillText("PACMAN", boardWidth / 2 - 70, boardHeight / 2 - 40);
    context.font = "20px sans-serif";
    context.fillText("Nhấn nút 'Bắt đầu Game' để chơi", boardWidth / 2 - 120, boardHeight / 2);
}

function drawGameOverScreen() {
    context.fillStyle = "rgba(0, 0, 0, 0.8)";
    context.fillRect(0, 0, boardWidth, boardHeight);

    context.fillStyle = "red";
    context.font = "32px sans-serif";
    context.fillText("GAME OVER", boardWidth / 2 - 90, boardHeight / 2 - 20);

    context.fillStyle = "white";
    context.font = "20px sans-serif";
    context.fillText("Nhấn nút 'Bắt đầu Game' để chơi lại", boardWidth / 2 - 140, boardHeight / 2 + 20);
}

function draw() {
    context.clearRect(0, 0, boardWidth, boardHeight);

    context.drawImage(pacman.image, pacman.x, pacman.y, pacman.width, pacman.height);

    for (let ghost of ghosts.values()) {
        if (powerMode && !ghost.isEaten) {
            context.fillStyle = "blue";
            context.fillRect(ghost.x, ghost.y, ghost.width, ghost.height);
        } else if (ghost.isEaten) {
            context.fillStyle = "gray";
            context.fillRect(ghost.x, ghost.y, ghost.width, ghost.height);
        } else {
            context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height);
        }
    }

    for (let wall of walls.values()) {
        context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);
    }

    for (let food of foods.values()) {
        if (food.isAnimating) {
            context.fillStyle = "yellow";
            const size = 4 + (6 - food.animationFrame);
            context.fillRect(food.x - size / 2, food.y - size / 2, size, size);
            food.animationFrame--;
            if (food.animationFrame <= 0) {
                food.isAnimating = false;
            }
        } else {
            context.fillStyle = "white";
            context.fillRect(food.x, food.y, food.width, food.height);
        }
    }

    context.fillStyle = "purple";
    for (let power of powerFoods.values()) {
        context.beginPath();
        context.arc(power.x + power.width / 2, power.y + power.height / 2, 6, 0, Math.PI * 2);
        context.fill();
    }

    context.fillStyle = "white";
    context.font = "14px sans-serif";
    if (gameOver) {
        context.fillText("Game Over: " + String(score), titleSize / 2, titleSize / 2);
    } else {
        context.fillText("x" + String(lives) + " " + String(score), titleSize / 2, titleSize / 2);
    }

    if (powerMode) {
        context.fillStyle = "cyan";
        context.font = "14px sans-serif";
        context.fillText("Power: " + powerModeTimer, boardWidth - 100, titleSize / 2);
    }
}

function movePacman(e) {
    if (gameOver) return;

    if (e.code == 'ArrowUp' || e.code == 'KeyW') {
        pacman.pendingDirection = 'U';
    }
    else if (e.code == 'ArrowDown' || e.code == 'KeyS') {
        pacman.pendingDirection = 'D';
    }
    else if (e.code == 'ArrowLeft' || e.code == 'KeyA') {
        pacman.pendingDirection = 'L';
    }
    else if (e.code == 'ArrowRight' || e.code == 'KeyD') {
        pacman.pendingDirection = 'R';
    }
}


function move() {
    // Nếu có hướng chờ (pending) và có thể rẽ được, thì rẽ
    if (pacman.pendingDirection && pacman.canMove(pacman.pendingDirection)) {
        pacman.updateDirection(pacman.pendingDirection);
        pacman.pendingDirection = null;

        if (pacman.direction == 'U') pacman.image = pacmanUpImage;
        else if (pacman.direction == 'D') pacman.image = pacmanDownImage;
        else if (pacman.direction == 'L') pacman.image = pacmanLeftImage;
        else if (pacman.direction == 'R') pacman.image = pacmanRightImage;
    }

    pacman.x += pacman.velocityX;
    pacman.y += pacman.velocityY;

    for (let wall of walls.values()) {
        if (collision(pacman, wall)) {
            pacman.x -= pacman.velocityX;
            pacman.y -= pacman.velocityY;
            break;
        }
    }

    for (let ghost of ghosts) {
        if (collision(ghost, pacman)) {
            if (powerMode && !ghost.isEaten) {
                ghostsEatenInPowerMode++;
                ghost.isEaten = true;
                ghost.respawnTimer = 100;
                ghost.x = -1000;
                ghost.y = -1000;
                score += 100 * Math.pow(2, ghostsEatenInPowerMode - 1);
                continue;
            } else if (!ghost.isEaten) {
                lives -= 1;
                if (lives == 0) {
                    gameOver = true;
                    return;
                }
                resetPosition();
                return;
            }
        }

        if (ghost.x % titleSize === 0 && ghost.y % titleSize === 0) {
            // Tập hợp các hướng khả dĩ
            const options = [];
            for (let d of direction) {
                if (d === opposite(ghost.direction)) continue;
                // tạm thử di chuyển hướng đó
                if (ghost.canMove(d)) {
                    options.push(d);
                }
            }
            if (options.length === 0) {
                options.push(opposite(ghost.direction));
            }
            const choice = options[Math.floor(Math.random() * options.length)];
            ghost.updateDirection(choice);
        }


        ghost.x += ghost.velocityX;
        ghost.y += ghost.velocityY;

        for (let wall of walls.values()) {
            if (collision(ghost, wall) || ghost.x <= 0 || ghost.x + ghost.width >= boardWidth) {
                ghost.x -= ghost.velocityX;
                ghost.y -= ghost.velocityY;
                const back = opposite(ghost.direction);
                ghost.updateDirection(back);
                break;
            }
        }

        if (lives === 0) {
            document.getElementById("startBtn").style.display = "block";
        }

        if (ghost.isEaten) {
            ghost.respawnTimer--;
            if (ghost.respawnTimer <= 0) {
                ghost.reset();
                const newDirection = direction[Math.floor(Math.random() * 4)];
                ghost.updateDirection(newDirection);
                ghost.isEaten = false;
            }
        }
    }

    // Ăn food
    let foodEaten = null;
    for (let food of foods.values()) {
        if (collision(pacman, food)) {
            foodEaten = food;
            food.isAnimating = true;
            food.animationFrame = 5;
            score += 10;
            break;
        }
    }
    foods.delete(foodEaten);

    if (foods.size == 0) {
        loadMap();
        resetPosition();
    }

    // Ăn power pellet
    let powerEaten = null;
    for (let power of powerFoods.values()) {
        if (collision(pacman, power)) {
            powerEaten = power;
            powerMode = true;
            powerModeTimer = 100;
            ghostsEatenInPowerMode = 0;
            break;
        }
    }
    powerFoods.delete(powerEaten);

    if (powerMode) {
        powerModeTimer -= 1;
        if (powerModeTimer <= 0) {
            powerMode = false;
        }
    }
    if (!powerMode && ghostsEatenInPowerMode > 0) {
        ghostsEatenInPowerMode = 0;
    }
}

function opposite(dir) {
    if (dir === 'U') return 'D';
    if (dir === 'D') return 'U';
    if (dir === 'L') return 'R';
    if (dir === 'R') return 'L';
}

function collision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

function loadImages() {
    wallImage = new Image();
    wallImage.src = "./image/wall.png";

    blueGhostImage = new Image();
    orangeGhostImage = new Image();
    pinkGhostImage = new Image();
    redGhostImage = new Image();

    blueGhostImage.src = "./image/blueGhost.png";
    orangeGhostImage.src = "./image/orangeGhost.png";
    pinkGhostImage.src = "./image/pinkGhost.png";
    redGhostImage.src = "./image/redGhost.png";

    pacmanUpImage = new Image();
    pacmanDownImage = new Image();
    pacmanLeftImage = new Image();
    pacmanRightImage = new Image();

    pacmanUpImage.src = "./image/pacmanUp.png";
    pacmanDownImage.src = "./image/pacmanDown.png";
    pacmanLeftImage.src = "./image/pacmanLeft.png";
    pacmanRightImage.src = "./image/pacmanRight.png";
}

function loadMap() {
    walls.clear();
    foods.clear();
    ghosts.clear();
    powerFoods.clear();

    const emptyTiles = [];

    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < columnCount; j++) {
            const row = tileMap[i];
            const titleMapChar = row[j];

            const x = j * titleSize;
            const y = i * titleSize;

            if (titleMapChar === 'X') {
                const wall = new Block(wallImage, x, y, titleSize, titleSize);
                walls.add(wall);
            }
            else if (titleMapChar === 'b') {
                const ghost = new Block(blueGhostImage, x, y, titleSize, titleSize);
                ghosts.add(ghost);
            }
            else if (titleMapChar === 'o') {
                const ghost = new Block(orangeGhostImage, x, y, titleSize, titleSize);
                ghosts.add(ghost);
            }
            else if (titleMapChar === 'p') {
                const ghost = new Block(pinkGhostImage, x, y, titleSize, titleSize);
                ghosts.add(ghost);
            }
            else if (titleMapChar === 'r') {
                const ghost = new Block(redGhostImage, x, y, titleSize, titleSize);
                ghosts.add(ghost);
            }
            else if (titleMapChar === 'P') {
                pacman = new Block(pacmanRightImage, x, y, titleSize, titleSize);
            }
            else if (titleMapChar === ' ') {
                emptyTiles.push({ x: x, y: y });
            }
        }
    }

    const shuffled = emptyTiles.sort(() => Math.random() - 0.5);
    const powerCount = 4; // số lượng power pellet
    const selectedPower = shuffled.slice(0, powerCount);

    for (let pos of selectedPower) {
        const pellet = new Block(null, pos.x + 10, pos.y + 10, 12, 12);
        powerFoods.add(pellet);
    }

    for (let pos of emptyTiles) {
        if (!selectedPower.includes(pos)) {
            const food = new Block(null, pos.x + 14, pos.y + 14, 4, 4);
            foods.add(food);
        }
    }
}


function resetPosition() {
    pacman.reset();
    pacman.velocityX = 0;
    pacman.velocityY = 0;
    for (let ghost of ghosts.values()) {
        ghost.reset();
        const newDirection = direction[Math.floor(Math.random() * 4)];
        ghost.updateDirection(newDirection);
    }
}

class Block {
    constructor(image, x, y, width, height) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.startX = x;
        this.startY = y;

        this.direction = 'R';
        this.velocityX = 0;
        this.velocityY = 0;

        this.pendingDirection = null;
        this.moveCounter = 0;

        this.isEaten = false;
        this.respawnTimer = 0;

        this.isAnimating = false;
        this.animationFrame = 0;
    }

    updateDirection(direction) {
        const prevDirection = this.direction;
        this.direction = direction;
        this.updateVelocity();
        this.x += this.velocityX;
        this.y += this.velocityY;
        for (let wall of walls.values()) {
            if (collision(this, wall)) {
                this.x -= this.velocityX;
                this.y -= this.velocityY;
                this.direction = prevDirection;
                this.updateVelocity();
                return;
            }
        }
        this.x -= this.velocityX;
        this.y -= this.velocityY;
    }

    updateVelocity() {
        if (this.direction == 'U') {
            this.velocityX = 0;
            this.velocityY = -titleSize / 4;
        }
        else if (this.direction == 'D') {
            this.velocityX = 0;
            this.velocityY = titleSize / 4;
        }
        else if (this.direction == 'L') {
            this.velocityX = -titleSize / 4;
            this.velocityY = 0;
        }
        else if (this.direction == 'R') {
            this.velocityX = titleSize / 4;
            this.velocityY = 0;
        }
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
    }

    canMove(direction) {
        const oldX = this.x;
        const oldY = this.y;
        const oldDirection = this.direction;
        const oldVX = this.velocityX;
        const oldVY = this.velocityY;

        this.direction = direction;
        this.updateVelocity();
        this.x += this.velocityX;
        this.y += this.velocityY;

        for (let wall of walls.values()) {
            if (collision(this, wall)) {
                this.x = oldX;
                this.y = oldY;
                this.direction = oldDirection;
                this.velocityX = oldVX;
                this.velocityY = oldVY;
                return false;
            }
        }

        this.x = oldX;
        this.y = oldY;
        this.direction = oldDirection;
        this.velocityX = oldVX;
        this.velocityY = oldVY;
        return true;
    }
}
