// Canvas definitions that will be passed as context to the board
const tetrisCanvas = document.getElementById('tetris');
const tetrisContext = tetrisCanvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');
const storageCanvas = document.getElementById('storage');
const storageContext = storageCanvas.getContext('2d');

const peggleCanvas = document.getElementById('peggle');
const peggleContext = peggleCanvas.getContext('2d');

// Initialise the tetrisBoard
let tetrisBoard = new TetrisBoard(tetrisContext, nextContext, storageContext);

let peggleBoard = new PeggleBoard(peggleContext, 660, 600);

// Tetronimo movement functions mapped to the movement keys
const eventKeyToMoves = {
    'ArrowLeft': TetrisBoard.movements['tetronimoLeft'],
    'ArrowRight': TetrisBoard.movements['tetronimoRight'],
    'ArrowDown': TetrisBoard.movements['tetronimoDown'],
    'ArrowUp': TetrisBoard.movements['tetronimoRotate'],
    'a': TetrisBoard.movements['tetronimoLeft'],
    'd': TetrisBoard.movements['tetronimoRight'],
    's': TetrisBoard.movements['tetronimoDown'],
    'w': TetrisBoard.movements['tetronimoRotate'],
    ' ': TetrisBoard.movements['tetronimoDown'],
};


// Initiate the score tracker (via proxy)
let accountValues = {
    score: 0,
    lines: 0,
    level: 0
}

// Ensures the var exists and is null to start
let requestId;

// updates account values for the in-browser elements with id name as key
function updateAccount(key, value) {
    let element  = document.getElementById(key);
    if (element) {
        element.textContent = value;
    }
}

// Proxy of the account details, to update both the in-code accountValues
// and the in-borwser elements of the same name.
let account = new Proxy(accountValues, {
    set: (target, key, value) => {
        target[key] = value;
        updateAccount(key, value);
        return true;
    }
})

// Controls listener for event driven actions
function eventListener() {
    document.removeEventListener('keydown', onKeyPress);
    document.addEventListener('keydown', onKeyPress);
}

function onKeyPress(event) {
    // Debug write the grid to the console
    if (event.key === 'c') {
        tetrisBoard.debug();
    }
    // End the game
    if (event.key === 'Escape') {
        gameOver();
    }
    // Store the tetronimo
    if (event.key === 'Shift'){
        tetrisBoard.switchTetronimos();
        peggleBoard.fire();
    }
    // Movement event
    if (eventKeyToMoves[event.key]) {
        // Stop event bubbling - learn what this means
        event.preventDefault();

        // peggle move test. TODO: Replace with move options and flip controls
        if (event.key === 'ArrowLeft'){
            peggleBoard.move(-5);
        }
        if (event.key === 'ArrowRight'){
            peggleBoard.move(5);
        }

        // get new tetronimo state
        let movedTetronimo = eventKeyToMoves[event.key](tetrisBoard.tetronimo);

        // Hard drop on space, while the movement is valid
        if (event.key === ' ') {
            // Hard drop
            while (tetrisBoard.valid(movedTetronimo)) {
                account.score += POINTS.HARD_DROP;
                tetrisBoard.tetronimo.move(movedTetronimo);
                movedTetronimo = eventKeyToMoves[event.key](tetrisBoard.tetronimo);
            }
        // Otherwise, check the validity of the movement
        } else if (tetrisBoard.valid(movedTetronimo)) {
            // If valid, we move the tetronimo
            tetrisBoard.tetronimo.move(movedTetronimo);
            if (event.key === 'ArrowDown') {
                account.score += POINTS.SOFT_DROP;
            }
        }
    }
}

// Resets the game
function resetGame() {
    account.score = 0;
    account.lines = 0;
    account.level = 0;
    tetrisBoard.reset();
    time = {
        start: performance.now(),
        elapsed: 0,
        level: LEVEL[account.level]
    };

    peggleBoard.reset();
}

// Entry point to play the game
function play() {
    // If we have an old game running then cancel it
    if (requestId) {
        cancelAnimationFrame(requestId);
    }
    // Reset the game stats
    resetGame();
    // Listen for events
    eventListener();
    // Begin the animation loop for the new game
    animate();
}

// Ends the game
function gameOver() {
    cancelAnimationFrame(requestId);
    tetrisContext.fillStyle = 'black';
    tetrisContext.fillRect(1, 3, 8, 1.2);
    tetrisContext.font = '1px Arial';
    tetrisContext.fillStyle = 'red';
    tetrisContext.fillText('GAME OVER', 1.8, 4);
}

// Animation controller, based on timer comparison
function animate(now = 0) {
    time.elapsed = now - time.start;
    if (time.elapsed > time.level) {
        time.start = now;
        if (!tetrisBoard.drop()) {
            gameOver();
            return;
        }
    }

    // Peggle physics
    peggleBoard.applyPhysics(0.25);
    peggleBoard.checkBallReset();

    // Redraw the board state, and request another animation
    tetrisBoard.draw();
    peggleBoard.draw();
    requestId = requestAnimationFrame(animate);
}