let upPressed = false;
let downPressed = false;
let leftPressed = false;
let rightPressed = false;

const main = document.querySelector('main');

// Player = 2, Wall = 1, Enemy = 3, Point = 0
let maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

function randomizeEnemy() {
    let row = Math.floor(Math.random() * maze.length);
    let column = Math.floor(Math.random() * maze[row].length);
    if (maze[row][column] === 0) {
        maze[row][column] = 3;
    } else {
        randomizeEnemy();
    }
}
enemyAmount = 3;
function placeEnemies() {
    for (let i = 0; i < enemyAmount; i++) {
        randomizeEnemy();
    }
}

placeEnemies();

// Populates the maze in the HTML

let totalPoints = 0;

function populateMaze() {
    main.innerHTML = ''; // Clear existing blocks
    totalPoints = 0;

    for (let y of maze) {
        for (let x of y) {
            let block = document.createElement('div');
            block.classList.add('block');

            switch (x) {
                case 1:
                    block.classList.add('wall');
                    break;
                case 2:
                    block.id = 'player';
                    let mouth = document.createElement('div');
                    mouth.classList.add('mouth');
                    block.appendChild(mouth);
                    break;
                case 3:
                    block.classList.add('enemy');
                    break;
                default:
                    block.classList.add('point');
                    block.style.height = '1vh';
                    block.style.width = '1vh';
                    totalPoints++;
            }

            main.appendChild(block);
        }
    }
}

populateMaze();

// Player movement
function keyUp(event) {
    if (event.key === 'ArrowUp') {
        upPressed = false;
    } else if (event.key === 'ArrowDown') {
        downPressed = false;
    } else if (event.key === 'ArrowLeft') {
        leftPressed = false;
    } else if (event.key === 'ArrowRight') {
        rightPressed = false;
    }
}

function keyDown(event) {
    if (event.key === 'ArrowUp') {
        upPressed = true;
    } else if (event.key === 'ArrowDown') {
        downPressed = true;
    } else if (event.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (event.key === 'ArrowRight') {
        rightPressed = true;
    }
}

let player;
let playerMouth;
let playerTop;
let playerLeft;

let playerInterval;
let enemyIntervals = [];
let playerSpeed = 1;
function startGame() {
    player = document.querySelector('#player');
    playerMouth = player.querySelector('.mouth');
    playerTop = 0;
    playerLeft = 0;

    playerInterval = setInterval(function () {
        playerMovement();
        removingPts();

        // Check for collision with enemies
        if (collisionDetection(player.getBoundingClientRect(), 'enemy')) {
            handleCollision();
        }

    }, playerSpeed);

    moveEnemies();

    resumeBtn.addEventListener('click', resumeButton)
    pauseBtn.addEventListener('click', pauseButton)
    // const start_effect = new Audio('start_sound.mp3')
    // Audio.play();
}

// Start Button Toggle and Inability to move until Start Button is clicked
const startBtn = document.querySelector('.start');

function hideStartBtn() {
    startBtn.style.display = 'none';
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);
    startGame();
}

startBtn.addEventListener('click', hideStartBtn);

// Removing Points from Game
let score = 0;

function removingPts() {
    const position = player.getBoundingClientRect();
    const points = document.querySelectorAll('.point');

    for (let i = 0; i < points.length; i++) {
        let pos = points[i].getBoundingClientRect();

        if (
            position.right > pos.left &&
            position.left < pos.right &&
            position.bottom > pos.top &&
            position.top < pos.bottom
        ) {
            points[i].classList.remove('point');
            score++;
            let paragraph = document.querySelector('.score p');
            paragraph.firstChild.nodeValue = score;

            if (score === totalPoints) {
                increaseDifficulty();
                // alert('Congratulations! You collected all the points!');
                // window.location.reload();
            }
        }
    }
}

// Collision function
function collisionDetection(position, className) {
    const elements = document.querySelectorAll(`.${className}`);
    for (let i = 0; i < elements.length; i++) {
        let elementPositions = elements[i].getBoundingClientRect();
        if (
            position.right > elementPositions.left &&
            position.left < elementPositions.right &&
            position.bottom > elementPositions.top &&
            position.top < elementPositions.bottom
        ) {
            return true;
        }
    }
    return false;
}


// Show restart button
const restartBtn = document.querySelector('.restartDiv');

function showRestartBtn() {
    restartBtn.style.display = 'flex';
    resumeBtn.removeEventListener('click', resumeButton)
    pauseBtn.removeEventListener('click', pauseButton)
}
restartBtn.addEventListener('click', resetGame);

// Function to End Game
function gameOver() {

    // Clears intervals that handle both enemy and player movement
    clearInterval(playerInterval);
    enemyIntervals.forEach(interval => clearInterval(interval));
    showRestartBtn();

    // document.removeEventListener('keydown', keyDown);
    // document.removeEventListener('keyup', keyUp);

    player.classList.add('dead');

    let playerName = prompt('Game Over! Enter your name:')
    if (playerName) {
        saveScore(playerName, score);
        updateLeaderboard();
    }

    enemySpeed = 10;    // Returns game to its Original Difficulty
    enemyAmount = 3;    //
    difficultyCount = 1;//
}

// Adding Lives Using Javascript
let livesCount = 3;
const livesDisplay = document.querySelector('.lives ul');

function lives() {
    livesDisplay.innerHTML = '';
    for (let i = 0; i < livesCount; i++) {
        let li = document.createElement('li');
        livesDisplay.appendChild(li);
    }
}

lives();


// Handle collision

let collisionEnabled = true; // Flag to control collision detection


function handleCollision() {
    if (!collisionEnabled) return; // Skip if collision detection is disabled
    collisionEnabled = false; // Disable collision detection

    if (livesCount > 1) {
        livesCount--;
        lives();
        hit();
    } else {
        livesCount = 0;
        lives();
        gameOver();
    }

    // Reset player position or add a delay before re-enabling collision detection
    setTimeout(() => {
        resetPlayerPosition();
        collisionEnabled = true; // Re-enable collision detection
    }, 150); 
}

// Reset player position function
function resetPlayerPosition() {
    playerTop = 0;
    playerLeft = 0;
    player.style.top = playerTop + 'px';
    player.style.left = playerLeft + 'px';
}


// Hit animation function
function hit() {
    player.classList.add('hit');
    setTimeout(() => {
        player.classList.remove('hit');
    }, 1500);
}

function playerMovement() {
    if (downPressed) {
        let position = player.getBoundingClientRect();
        let newBottom = position.bottom + 1;

        let btmL = document.elementFromPoint(position.left, newBottom);
        let btmR = document.elementFromPoint(position.right, newBottom);

        if (!btmL.classList.contains('wall') && !btmR.classList.contains('wall')) {
            playerTop++;
            player.style.top = playerTop + 'px';
        }

        playerMouth.classList = 'down';
    }
    else if (upPressed) {
        let position = player.getBoundingClientRect();
        let newTop = position.top - 1;
        let topL = document.elementFromPoint(position.left, newTop);
        let topR = document.elementFromPoint(position.right, newTop);
        if (!topL.classList.contains('wall') && !topR.classList.contains('wall')) {
            playerTop--;
            player.style.top = playerTop + 'px';
        }
        playerMouth.classList = 'up';
    }
    else if (leftPressed) {
        let position = player.getBoundingClientRect();
        let newLeft = position.left - 1;
        let leftT = document.elementFromPoint(newLeft, position.top);
        let leftB = document.elementFromPoint(newLeft, position.bottom);

        if (!leftT.classList.contains('wall') && !leftB.classList.contains('wall')) {
            playerLeft--;
            player.style.left = playerLeft + 'px';
        }

        playerMouth.classList = 'left';
    }
    else if (rightPressed) {
        let position = player.getBoundingClientRect();
        let newRight = position.right + 1;
        let rightT = document.elementFromPoint(newRight, position.top);
        let rightB = document.elementFromPoint(newRight, position.bottom);

        if (!rightT.classList.contains('wall') && !rightB.classList.contains('wall')) {
            playerLeft++;
            player.style.left = playerLeft + 'px';
        }

        playerMouth.classList = 'right';
    }
}
// Enemy Movement
function moveEnemies() {
    const enemies = document.querySelectorAll('.enemy');
    for (let enemy of enemies) {
        let interval = moveEnemy(enemy);
        enemyIntervals.push(interval);
    }
}

function moveEnemy(enemy) {
    let enemyTop = 0;
    let enemyLeft = 0;
    let direction = Math.ceil(Math.random() * 4);

    return setInterval(function () {
        if (direction === 1) {
            const position = enemy.getBoundingClientRect();
            let newBottom = position.bottom + 1;

            let btmL = document.elementFromPoint(position.left, newBottom);
            let btmR = document.elementFromPoint(position.right, newBottom);

            if (!btmL.classList.contains('wall') && !btmR.classList.contains('wall')) {
                enemyTop++;
            } else {
                direction = Math.ceil(Math.random() * 4);
            }
        }

        if (direction === 2) {
            const position = enemy.getBoundingClientRect();
            let newTop = position.top - 1;

            let topL = document.elementFromPoint(position.left, newTop);
            let topR = document.elementFromPoint(position.right, newTop);

            if (!topL.classList.contains('wall') && !topR.classList.contains('wall')) {
                enemyTop--;
            } else {
                direction = Math.ceil(Math.random() * 4);
            }
        }
        if (direction === 3) {
            const position = enemy.getBoundingClientRect();
            let newLeft = position.left - 1;

            let topL = document.elementFromPoint(newLeft, position.top);
            let btmL = document.elementFromPoint(newLeft, position.bottom);

            if (!topL.classList.contains('wall') && !btmL.classList.contains('wall')) {
                enemyLeft--;
            } else {
                direction = Math.ceil(Math.random() * 4);
            }
        }

        if (direction === 4) {
            const position = enemy.getBoundingClientRect();
            let newRight = position.right + 1;

            let topR = document.elementFromPoint(newRight, position.top);
            let btmR = document.elementFromPoint(newRight, position.bottom);
            if (!topR.classList.contains('wall') && !btmR.classList.contains('wall')) {
                enemyLeft++;
            } else {
                direction = Math.ceil(Math.random() * 4);
            }
        }

        enemy.style.top = enemyTop + 'px';
        enemy.style.left = enemyLeft + 'px';

    }, enemySpeed);
}

// Function to reset the game
function resetGame() {
    // Reset variables
    upPressed = false;
    downPressed = false;
    leftPressed = false;
    rightPressed = false;

    // Reset score
    score = 0;
    let paragraph = document.querySelector('.score p');
    paragraph.firstChild.nodeValue = score;

    // Reset lives
    livesCount = 3;
    lives();

    // Clear intervals
    clearInterval(playerInterval);
    enemyIntervals.forEach(interval => clearInterval(interval));
    enemyIntervals = [];

    // Reset maze
    maze = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 0, 1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        [1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];

    placeEnemies();

    // Repopulate the maze
    populateMaze();

    // Hide restart button and show start button
    restartBtn.style.display = 'none';
    startBtn.style.display = 'flex';

    // Reset player 
    resetPlayerPosition();
    // Re-enable player movement
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);
}

restartBtn.addEventListener('click', resetGame);




document.querySelector('#lbttn').addEventListener('click', function () {
    leftPressed = true;
    upPressed = false;
    downPressed = false;
    rightPressed = false;
});

document.querySelector('#ubttn').addEventListener('click', function () {
    leftPressed = false;
    upPressed = true;
    downPressed = false;
    rightPressed = false;
});

document.querySelector('#rbttn').addEventListener('click', function () {
    leftPressed = false;
    upPressed = false;
    downPressed = false;[]
    rightPressed = true;
});

document.querySelector('#dbttn').addEventListener('click', function () {
    leftPressed = false;
    upPressed = false;
    downPressed = true;
    rightPressed = false;
});


// Save score to local storage
function saveScore(name, score) {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ name: name, score: score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 5); // Keep only top 5 scores
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

// Update leaderboard
function updateLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

    leaderboardList.innerHTML = '';
    for (let entry of leaderboard) {
        let listItem = document.createElement('li');
        listItem.textContent = `${entry.name}........${entry.score}`;
        leaderboardList.appendChild(listItem);
    }
}

// Initialize leaderboard on page load
updateLeaderboard();



// Increasing Difficulty
let enemySpeed = 10;

function increaseDifficulty() {
    enemyAmount = Math.min(10, enemyAmount + 1) // Add an extra Enemy and makes sure it doesnt go above 10


    enemySpeed = Math.max(1, enemySpeed - 1.25); // Increase the Enemy speed and ensure it doesn't go below 1

    upPressed = false;
    downPressed = false;
    leftPressed = false;
    rightPressed = false;

    clearInterval(playerInterval);
    enemyIntervals.forEach(interval => clearInterval(interval));
    enemyIntervals = [];

    placeEnemies();

    populateMaze();

    startGame();
    
    showPowerUp();
}



const pauseBtn = document.querySelector('.pauseDiv')
const resumeBtn = document.querySelector('.resumeDiv')
function pauseButton() {
    clearInterval(playerInterval);
    enemyIntervals.forEach(interval => clearInterval(interval));
    enemyIntervals = [];

    // document.removeEventListener('keydown', keydown)
    // document.removeEventListener('keyup', keyup);

    resumeBtn.style.display = 'flex'
    pauseBtn.style.display = 'none'
}


function resumeButton() {
    playerInterval = setInterval(function () {
        playerMovement();
        removingPts();

        // Check for collision with enemies
        if (collisionDetection(player.getBoundingClientRect(), 'enemy')) {
            handleCollision();
        }

    }, enemySpeed);

    // Restore enemy intervals
    moveEnemies();

    // Show pause button, hide resume button
    resumeBtn.style.display = 'none';
    pauseBtn.style.display = 'flex';
}


function powerUp(){
    // setTimeout(())
}
// powerUpBtn.addEventListener('click', powerUp);
const powerUpBtn = document.querySelector('.powerUpDiv');
function showPowerUp(){
    powerUpBtn.style.display = 'flex';
}
// showPowerUp();


function hidePowerUp(){
    powerUpBtn.style.display = 'none';
}
restartBtn.addEventListener('click',hidePowerUp);
