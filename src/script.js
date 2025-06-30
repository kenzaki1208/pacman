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
let pacman;

const direction = ['U', 'D', 'L', 'R'];
let score = 0;
let lives = 3;
let gameOver = false;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    loadImages();
    loadMap();
    // console.log(walls.size)
    // console.log(foods.size)
    // console.log(ghosts.size)
    for (let ghost of ghosts.values()) {
        const newDirection = direction[Math.floor(Math.random() * 4)];
        ghost.updateDirection(newDirection);
    }
    update();
    document.addEventListener("keyup", movePacman)
}

function update() {
    if (gameOver) {
        return;
    }
    //move
    move();
    draw();
    setTimeout(update, 50);
}

function draw() {
    context.clearRect(0, 0, boardWidth, boardHeight);
    context.drawImage(pacman.image, pacman.x, pacman.y, pacman.width, pacman.height);
    for (let ghost of ghosts.values()) {
        context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height);
    }

    for (let wall of walls.values()) {
        context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);
    }
    context.fillStyle = "white";

    for (let food of foods.values()) {
        context.fillRect(food.x, food.y, food.width, food.height);
    }

    //score
    context.fillStyle = "white";
    context.font = "14px sans-serif";
    if (gameOver) {
        context.fillText("Game Over: " + String(score), titleSize/2, titleSize/2);
    } else {
        context.fillText("x" + String(lives) + " " + String(score), titleSize/2, titleSize/2);
    }
}

function movePacman(e) {
    if (gameOver) {
        loadMap();
        resetPosition();
        lives = 3;
        score = 0;
        gameOver = false;
        update();
        return;
    }
    if (e.code == 'ArrowUp' || e.code == 'KeyW') {
        pacman.updateDirection('U');
    }
    else if (e.code == 'ArrowDown' || e.code == 'KeyS') {
        pacman.updateDirection('D');
    }
    else if (e.code == 'ArrowLeft' || e.code == 'KeyA') {
        pacman.updateDirection('L');
    }
    else if (e.code == 'ArrowRight' || e.code == 'KeyD') {
        pacman.updateDirection('R');
    }

    if (pacman.direction == 'U') {
        pacman.image = pacmanUpImage;
    }
    else if (pacman.direction == 'D') {
        pacman.image = pacmanDownImage;
    }
    else if (pacman.direction == 'L') {
        pacman.image = pacmanLeftImage;
    }
    else if (pacman.direction == 'R') {
        pacman.image = pacmanRightImage;
    }
}

function move() {
    pacman.x += pacman.velocityX;
    pacman.y += pacman.velocityY;

    for (let wall of walls.values()) {
        if(collision(pacman, wall)) {
            pacman.x -= pacman.velocityX;
            pacman.y -= pacman.velocityY;
            break;
        }
    }

    for (let ghost of ghosts.values()) {
        if (collision(ghost, pacman)) {
            lives -= 1;
            if (lives == 0) {
                gameOver = true;
                return;
            }
            resetPosition();
        }

        if (ghost.y == titleSize*9 && ghost.direction != 'U' && ghost.direction != 'D') {
            ghost.updateDirection('U');
        }

        ghost.x += ghost.velocityX;
        ghost.y += ghost.velocityY;
        for (let wall of walls.values()) {
            if(collision(ghost, wall) || ghost.x <= 0 || ghost.x + ghost.width >= boardWidth) {
                ghost.x -= ghost.velocityX;
                ghost.y -= ghost.velocityY;
                const newDirection = direction[Math.floor(Math.random() * 4)];
                ghost.updateDirection(newDirection);
            }
        }
    }

    //check food collision
    let foodEaten = null;
    for (let food of foods.values()) {
        if (collision(pacman, food)) {
            foodEaten = food;
            score += 10;
            break;
        }
    }
    foods.delete(foodEaten);

    if (foods.size == 0) {
        loadMap();
        resetPosition();
    }
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

    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < columnCount; j++) {
            const row = tileMap[i];
            const titleMapChar = row[j];

            const x = j * titleSize;
            const y = i * titleSize;

            //block wall
            if (titleMapChar == 'X') {
                const wall = new Block(wallImage, x, y, titleSize, titleSize);
                walls.add(wall);
            }
            //blue ghost
            else if (titleMapChar == 'b') {
                const ghost = new Block(blueGhostImage, x, y, titleSize, titleSize);
                ghosts.add(ghost);
            }
            //orange ghost
            else if (titleMapChar == 'o') {
                const ghost = new Block(orangeGhostImage, x, y, titleSize, titleSize);
                ghosts.add(ghost);
            }
            //pink ghost
            else if (titleMapChar == 'p') {
                const ghost = new Block(pinkGhostImage, x, y, titleSize, titleSize);
                ghosts.add(ghost);
            }
            //red ghost
            else if (titleMapChar == 'r') {
                const ghost = new Block(redGhostImage, x, y, titleSize, titleSize);
                ghosts.add(ghost);
            }
            else if (titleMapChar == 'P') { //pacman
                pacman = new Block(pacmanRightImage, x, y, titleSize, titleSize);
            }
            else if (titleMapChar == ' ') { //empty is food
                const food = new Block(null, x + 14, y + 14, 4, 4);
                foods.add(food);
            }
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
    }

    updateVelocity() {
        if (this.direction == 'U') {
            this.velocityX = 0;
            this.velocityY = -titleSize/4;
        }
        else if (this.direction == 'D') {
            this.velocityX = 0;
            this.velocityY = titleSize/4;
        }
        else if (this.direction == 'L') {
            this.velocityX = -titleSize/4;
            this.velocityY = 0;
        }
        else if (this.direction == 'R') {
            this.velocityX = titleSize/4;
            this.velocityY = 0;
        }
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
    }
}