// Canvas definitions that will be passed as context to the board
const canvas = document.getElementById('board');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');
const storageCanvas = document.getElementById('storage');
const storageContext = storageCanvas.getContext('2d');

// Initialise the board
let board = new Board(context, nextContext, storageContext);

// Piece movement functions mapped to the movement keys
const eventKeyToMoves = {
    'ArrowLeft': Board.movements['pieceLeft'],
    'ArrowRight': Board.movements['pieceRight'],
    'ArrowDown': Board.movements['pieceDown'],
    'ArrowUp': Board.movements['pieceRotate'],
    'a': Board.movements['pieceLeft'],
    'd': Board.movements['pieceRight'],
    's': Board.movements['pieceDown'],
    'w': Board.movements['pieceRotate'],
    ' ': Board.movements['pieceDown'],
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
        board.debug();
    }
    // End the game
    if (event.key === 'Escape') {
        gameOver();
    }
    // Store the piece
    if (event.key === 'Shift'){
        board.switchPieces();
    }
    // Movement event
    if (eventKeyToMoves[event.key]) {
        // Stop event bubbling - learn what this means
        event.preventDefault();

        // get new piece state
        let movedPiece = eventKeyToMoves[event.key](board.piece);

        // Hard drop on space, while the movement is valid
        if (event.key === ' ') {
            // Hard drop
            while (board.valid(movedPiece)) {
                account.score += POINTS.HARD_DROP;
                board.piece.move(movedPiece);
                movedPiece = eventKeyToMoves[event.key](board.piece);
            }
        // Otherwise, check the validity of the movement
        } else if (board.valid(movedPiece)) {
            // If valid, we move the piece
            board.piece.move(movedPiece);
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
    board.reset();
    time = {
        start: performance.now(),
        elapsed: 0,
        level: LEVEL[account.level]
    };
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
    context.fillStyle = 'black';
    context.fillRect(1, 3, 8, 1.2);
    context.font = '1px Arial';
    context.fillStyle = 'red';
    context.fillText('GAME OVER', 1.8, 4);
}

// Animation controller, based on timer comparison
function animate(now = 0) {
    time.elapsed = now - time.start;
    if (time.elapsed > time.level) {
        time.start = now;
        if (!board.drop()) {
            gameOver();
            return;
        }
    }

    // Clear the game board context, draw the board state, and request another animation
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    board.draw();
    requestId = requestAnimationFrame(animate);
}