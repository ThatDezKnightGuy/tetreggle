class PeggleBoard {
    // board context
    context;
    width;
    height;

    // board reqs
    cannon;
    ball;
    bucket;

    // pegs
    pinsOnBoard;
    pinsInQueue;

    constructor(context) {
        this.width = 600;
        this.height = 600;
        this.context = context;
        this.init_context(this.context, this.width, this.height);
    }

    static deg_to_rad = Math.PI / 180;

    static unitVector(ball) {
        let mag = Math.sqrt(ball.x * ball.x + ball.y + ball.y);
        return{
            x: Math.abs(ball.x) < 0.0001 ? 0 : ball.x / mag,
            y: Math.abs(ball.y) < 0.0001 ? 0 : ball.y / mag
        }
    }

    init_context(context, width, height) {
        context.canvas.width = width;
        context.canvas.height = height;
    }

    // Reset the peggle board
    reset() {
        this.pinsOnBoard = [];
        for (var i=0; i<25; ++i) {
            this.pinsOnBoard.push(new Pin(this.context, this.width, this.height, 5));
        }
        console.log(this.pinsOnBoard);
    }

    // Draw the peggle board, ball, and cannon for animation
    draw() {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.drawPeggleBoard();
    }

    // draws just the board and pins
    drawPeggleBoard() {
        this.pinsOnBoard.forEach(pin => {
            pin.draw();
        });
    }
}