class TetrisBoard {
    // board contexts
    context;
    nextContext;
    storageContext;
    // board grid
    grid;
    // tetronimos accessible to the board
    tetronimo;
    nextTetronimo;
    storedTetronimo;

    constructor(context, nextContext, storageContext) {
        this.context = context;
        this.nextContext = nextContext;
        this.storageContext = storageContext;
        this.init_context(this.context, TetrisBoard.COLS, TetrisBoard.ROWS, TetrisBoard.BLOCK_SIZE);
        this.init_context(this.nextContext, 4, 4, TetrisBoard.BLOCK_SIZE);
        this.init_context(this.storageContext, 4, 4, TetrisBoard.BLOCK_SIZE);
    }

    // General tetronimo movements, controlled by the board
    static movements = {
        "tetronimoRotate": tetronimo => TetrisBoard.rotate(tetronimo),
        "tetronimoRight": tetronimo => ({ ...tetronimo, x: tetronimo.x + 1 }),
        "tetronimoLeft": tetronimo => ({ ...tetronimo, x: tetronimo.x - 1 }),
        "tetronimoDown": tetronimo => ({ ...tetronimo, y: tetronimo.y + 1 })
    }

    static COLS = 10;  // width of game board, in BLOCK_SIZEs
    static ROWS = 20;  // length of game board, in BLOCK_SIZEs
    static BLOCK_SIZE = 30;  // Size of a comonent tetronimo block, in pixels
    static gridColor = '#262626'
    static gridLineWidth = 0.01

    // Get a zeroes matrix, which represents the board
    // For each row, we run the map function which returns
    // a col width array of zeroes
    static getEmptyTetrisBoard() {
        return Array.from(
            {length: TetrisBoard.ROWS}, () => Array(TetrisBoard.COLS).fill(0)
        );
    }

    // Rotates the active tetronimo
    static rotate(tetronimo) {
        // Create a clone to modify
        let rot_tetronimo = JSON.parse(JSON.stringify(tetronimo));

        // Transpose matrix with a 90 deg rotation
        for (let y = 0; y < rot_tetronimo.shape.length; ++y) {
            for (let x = 0; x < y; ++  x) {
                [rot_tetronimo.shape[x][y], rot_tetronimo.shape[y][x]] =
                [rot_tetronimo.shape[y][x], rot_tetronimo.shape[x][y]];
            }
        }
        // Reverse colum order
        rot_tetronimo.shape.forEach(row => row.reverse());

        //  Rotated tetronimo is returned to be implicitly updated into the active tetronimo
        // through the move method of Tetronimo
        return rot_tetronimo;
    }

    // Sets the size of the context based on passed column, row, and blocksize parameters
    init_context(context, cols, rows, blocks) {
        // Generate a canvas based on the `constants.js` content
        context.canvas.width = cols * blocks;
        context.canvas.height = rows * blocks;
        // Ensure that the scale is in BLOCK_SIZEs for simplicity
        // As tetronimos are made of squares, then x = y = BLOCKSIZE
        context.scale(blocks, blocks);
        // Set linewidth
        context.lineWidth = TetrisBoard.gridLineWidth;
        context.strokeStyle = TetrisBoard.gridColor;
    }

    // Resets the board and adds a new tetronimo
    reset() {
        this.grid = TetrisBoard.getEmptyTetrisBoard();
        this.tetronimo = new Tetronimo(this.context);
        this.tetronimo.setTetrisBoardPosition();
        this.getNextTetronimo();
        this.getStoredTetronimo();
    }

    // Draws all board items that must update from animation
    draw() {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.drawTetrisBoard();
        this.tetronimo.draw();
    }

    // Draw the current board state
    drawTetrisBoard() {
        this.context.strokeStyle = TetrisBoard.gridColor;
        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    // Indexes on 0
                    this.context.fillStyle = Tetronimo.COLORS[value-1];
                    this.context.fillRect(x, y, 1, 1);
                    this.context.lineWidth = Tetronimo.gridLineWidth;
                    this.context.strokeStyle = Tetronimo.gridColor;
                } else {
                    this.context.lineWidth = TetrisBoard.gridLineWidth;
                    this.context.strokeStyle = TetrisBoard.gridColor;
                }
                this.context.strokeRect(x, y, 1, 1);
            });
        });
    }

    // Animation entry for tetronimos slowly dropping
    drop() {
        let pos = TetrisBoard.movements['tetronimoDown'](this.tetronimo);
        if (this.valid(pos)) {
            this.tetronimo.move(pos)
        } else {
            if (this.tetronimo.y === 0){
                return false;  // Exit early as it's game over.
            }
            this.freeze()
            this.clearLines()

            // Get the next tetronimo
            this.tetronimo = this.nextTetronimo;
            this.tetronimo.context = this.context;
            this.tetronimo.setTetrisBoardPosition();
            this.getNextTetronimo();
        }
        return true;
    }

    // To check the table state through event
    debug() {
        console.table(this.grid);
    }

    // Freezes the block in a valid location, which then occupies the board
    freeze() {
        this.tetronimo.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0){
                    this.grid[y + this.tetronimo.y][x + this.tetronimo.x] = value;
                }
            });
        });
    }

    // Clear the line and increase the Tetris score
    clearLines() {
        let nLines = 0;
        this.grid.forEach((row, y) => {
            if (row.every(value => value > 0)) {
                nLines++;
                // Remove the row
                this.grid.splice(y, 1);

                // Add a new row of zeroes
                this.grid.unshift(Array(TetrisBoard.COLS).fill(0));
            }
        });
        if (nLines > 0) {
            account.score += this.getLineClearPoints(nLines) * (account.level+1);
            account.lines += nLines;

            if (account.lines >= LINES_PER_LEVEL) {
                account.level++;
                account.lines -= LINES_PER_LEVEL;
                time.level = LEVEL[account.level] ? LEVEL[account.level] : 20
            }
        };
    }

    // Gets the points for the number of clears
    getLineClearPoints(nLines) {
        return nLines === 1 ? POINTS.SINGLE :
            nLines === 2 ? POINTS.DOUBLE:
            nLines === 3 ? POINTS.TRIPLE:
            nLines === 4 ? POINTS.TETRIS:
            0;
    }

    // Gets the next tetronimo for display
    getNextTetronimo() {
        this.nextTetronimo = new Tetronimo(this.nextContext);
        this.nextContext.clearRect(0, 0, this.nextContext.canvas.width, this.nextContext.canvas.height)
        this.nextTetronimo.draw()
    }

    // Gets the stored tetronimo for display
    getStoredTetronimo() {
        this.storedTetronimo = new Tetronimo(this.storageContext);
        this.storageContext.clearRect(0, 0, this.storageContext.canvas.width, this.storageContext.canvas.height)
        this.storedTetronimo.draw()
    }

    // Switchs the current tetronimo with the stored tetronimo
    switchTetronimos() {
        // Store the current tetronimo in a temp variable
        let temp = this.tetronimo;
        let tx = this.tetronimo.x;
        let ty = this.tetronimo.y;

        // Replace the current tetronimo with the stored tetronimo
        this.tetronimo = this.storedTetronimo;
        this.tetronimo.context = this.context;
        this.tetronimo.x = tx;
        this.tetronimo.y = ty;

        // Replace the stored tetronimo with the temp and then redraw it
        // Must force redraw storage as it's not updated in draw step
        this.storedTetronimo = temp;
        this.storedTetronimo.context = this.storageContext
        this.storedTetronimo.setDisplayPosition();

        this.storageContext.clearRect(0, 0, this.storageContext.canvas.width, this.storageContext.canvas.height);
        this.storedTetronimo.draw();
    }

    // Checks the validity of the tetronimo in the next tetronimo position
    valid(tetronimo) {
        return tetronimo.shape.every((row, dy) => {
            return row.every((value, dx) => {
                let nx = tetronimo.x + dx;
                let ny = tetronimo.y + dy;
                return (
                    this.isEmpty(value) ||
                    (this.insideWalls(nx) && this.aboveFloor(ny) && this.canFreeze(nx, ny))
                );
            });
        });
    }

    isEmpty(value) {
        return value === 0;
    }

    insideWalls(x) {
        return x >= 0 && x < TetrisBoard.COLS;
    }

    aboveFloor(y) {
        return y < TetrisBoard.ROWS;
    }

    canFreeze(x, y) {
        return this.grid[y][x] === 0
    }
}