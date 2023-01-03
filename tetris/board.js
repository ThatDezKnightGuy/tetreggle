class Board {
    // board contexts
    context;
    nextContext;
    storageContext;
    // board grid
    grid;
    // pieces accessible to the board
    piece;
    nextPiece;
    storedPiece;

    constructor(context, nextContext, storageContext) {
        this.context = context;
        this.nextContext = nextContext;
        this.storageContext = storageContext;
        this.init_context(this.context, Board.COLS, Board.ROWS, Board.BLOCK_SIZE);
        this.init_context(this.nextContext, 4, 4, Board.BLOCK_SIZE);
        this.init_context(this.storageContext, 4, 4, Board.BLOCK_SIZE);
    }

    // General piece movements, controlled by the board
    static movements = {
        "pieceRotate": piece => Board.rotate(piece),
        "pieceRight": piece => ({ ...piece, x: piece.x + 1 }),
        "pieceLeft": piece => ({ ...piece, x: piece.x - 1 }),
        "pieceDown": piece => ({ ...piece, y: piece.y + 1 })
    }

    static COLS = 10;  // width of game board, in BLOCK_SIZEs
    static ROWS = 20;  // length of game board, in BLOCK_SIZEs
    static BLOCK_SIZE = 30;  // Size of a comonent tetronimo block, in pixels
    static gridColor = '#262626'
    static gridLineWidth = 0.01

    // Get a zeroes matrix, which represents the board
    // For each row, we run the map function which returns
    // a col width array of zeroes
    static getEmptyBoard() {
        return Array.from(
            {length: Board.ROWS}, () => Array(Board.COLS).fill(0)
        );
    }

    // Rotates the active piece
    static rotate(piece) {
        // Create a clone to modify
        let rot_piece = JSON.parse(JSON.stringify(piece));

        // Transpose matrix with a 90 deg rotation
        for (let y = 0; y < rot_piece.shape.length; ++y) {
            for (let x = 0; x < y; ++  x) {
                [rot_piece.shape[x][y], rot_piece.shape[y][x]] =
                [rot_piece.shape[y][x], rot_piece.shape[x][y]];
            }
        }
        // Reverse colum order
        rot_piece.shape.forEach(row => row.reverse());

        //  Rotated piece is returned to be implicitly updated into the active piece
        // through the move method of Piece
        return rot_piece;
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
        context.lineWidth = Board.gridLineWidth;
        context.strokeStyle = Board.gridColor;
    }

    // Resets the board and adds a new piece
    reset() {
        this.grid = Board.getEmptyBoard();
        this.piece = new Piece(this.context);
        this.piece.setBoardPosition();
        this.getNextPiece();
        this.getStoredPiece();
    }

    // Draws all board items that must update from animation
    draw() {
        this.drawBoard();
        this.piece.draw();
    }

    // Draw the current board state
    drawBoard() {
        this.context.strokeStyle = Board.gridColor;
        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    // Indexes on 0
                    this.context.fillStyle = Piece.COLORS[value-1];
                    this.context.fillRect(x, y, 1, 1);
                    this.context.lineWidth = Piece.gridLineWidth;
                    this.context.strokeStyle = Piece.gridColor;
                } else {
                    this.context.lineWidth = Board.gridLineWidth;
                    this.context.strokeStyle = Board.gridColor;
                }
                this.context.strokeRect(x, y, 1, 1);
            });
        });
    }

    // Animation entry for pieces slowly dropping
    drop() {
        let pos = Board.movements['pieceDown'](this.piece);
        if (this.valid(pos)) {
            this.piece.move(pos)
        } else {
            if (this.piece.y === 0){
                return false;  // Exit early as it's game over.
            }
            this.freeze()
            this.clearLines()

            // Get the next piece
            this.piece = this.nextPiece;
            this.piece.context = this.context;
            this.piece.setBoardPosition();
            this.getNextPiece();
        }
        return true;
    }

    // To check the table state through event
    debug() {
        console.table(this.grid);
    }

    // Freezes the block in a valid location, which then occupies the board
    freeze() {
        this.piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0){
                    this.grid[y + this.piece.y][x + this.piece.x] = value;
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
                this.grid.unshift(Array(Board.COLS).fill(0));
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

    // Gets the next piece for display
    getNextPiece() {
        this.nextPiece = new Piece(this.nextContext);
        this.nextContext.clearRect(0, 0, this.nextContext.canvas.width, this.nextContext.canvas.height)
        this.nextPiece.draw()
    }

    // Gets the stored piece for display
    getStoredPiece() {
        this.storedPiece = new Piece(this.storageContext);
        this.storageContext.clearRect(0, 0, this.storageContext.canvas.width, this.storageContext.canvas.height)
        this.storedPiece.draw()
    }

    // Switchs the current piece with the stored piece
    switchPieces() {
        // Store the current piece in a temp variable
        let temp = this.piece;
        let tx = this.piece.x;
        let ty = this.piece.y;

        // Replace the current piece with the stored piece
        this.piece = this.storedPiece;
        this.piece.context = this.context;
        this.piece.x = tx;
        this.piece.y = ty;

        // Replace the stored piece with the temp and then redraw it
        // Must force redraw storage as it's not updated in draw step
        this.storedPiece = temp;
        this.storedPiece.context = this.storageContext
        this.storedPiece.setDisplayPosition();

        this.storageContext.clearRect(0, 0, this.storageContext.canvas.width, this.storageContext.canvas.height);
        this.storedPiece.draw();
    }

    // Checks the validity of the piece in the next piece position
    valid(piece) {
        return piece.shape.every((row, dy) => {
            return row.every((value, dx) => {
                let nx = piece.x + dx;
                let ny = piece.y + dy;
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
        return x >= 0 && x < Board.COLS;
    }

    aboveFloor(y) {
        return y < Board.ROWS;
    }

    canFreeze(x, y) {
        return this.grid[y][x] === 0
    }
}