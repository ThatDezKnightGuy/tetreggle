class PeggleBoard {
    // board context
    context;
    width;
    height;

    // board reqs
    pinSize;
    cannon;
    ball;
    ballCount;
    bucket;

    // pegs
    pinsOnBoard;
    pinsInQueue;

    constructor(context, width, height) {
        this.context = context;
        this.init(this.context, width, height);
    }

    static deg_to_rad = Math.PI / 180;

    static unitVector(x, y) {
        let mag = Math.sqrt(x * x + y * y);
        return {
            x: Math.abs(x) < 0.0001 ? 0 : x / mag,
            y: Math.abs(y) < 0.0001 ? 0 : y / mag
        };
    }

    static dotProduct(x1, y1, x2, y2){
        return x1 * x2 + y1 * y2;
    }

    static checkContact(ball1, ball2, buffer){
        buffer = !buffer ? 0 : buffer;  // Used for pin overlaps
        let totalX = ball1.x - ball2.x;
        let totalY = ball1.y - ball2.y;
        let compRad = ball1.size + ball2.size;
        return (totalX * totalX + totalY * totalY <= compRad * compRad);
    }

    init(context, width, height) {
        this.width = width;
        this.height = height;
        this.pinSize = 10;
        context.canvas.width = width;
        context.canvas.height = height;
    }

    // Reset the peggle board
    reset() {
        this.pinsOnBoard = [];
        this.pinsInQueue = [];
        this.cannon = new Cannon(this.context, this.width/2, 10, 30);
        for (var i=0; i<25; ++i) {
            // TODO: Generate the board as a series of blocks of pins, then generate the typing
            this.pinsOnBoard.push(this.generatePin(i));
        }
        this.ballCount = 10;
        this.resetBall(this.pinSize);
    }

    resetBall(size) {
        this.ball = new Ball(this.context, this.cannon.barrelX, this.cannon.barrelY, size);
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
        this.cannon.draw();
        this.ball.draw();
    }

    fire() {
        if (this.ball.canFire) {
            let dx = this.cannon.firingVelocity * Math.sin(this.cannon.angle * PeggleBoard.deg_to_rad);
            let dy = this.cannon.firingVelocity * Math.cos(this.cannon.angle * PeggleBoard.deg_to_rad);
            this.ball.fire(dx, dy);
        }
    }

    applyPhysics(t){
        if (this.ball.canFire){
            return;
        }
        let pos = Ball.movement(this.ball, t);
        let modified = false;

        // Check if the ball hits a wall
        if (
            (this.ball.x + this.ball.size > this.width) ||
            (this.ball.x - this.ball.size < 0)
        ) {
            pos.x = this.ball.x;
            pos.y = this.ball.y;
            pos.dx = -1 * this.ball.dx;
            pos.dy = this.ball.dy;
            modified = true;
        }

        // Check if the ball hits the roof
        if (this.ball.y - this.ball.size < 0) {
            pos.x = this.ball.x;
            pos.y = this.ball.y;
            pos.dx = this.ball.dx;
            pos.dy = -1 * this.ball.dy;
            modified = true;
        }

        if (PeggleBoard.checkContact(this.ball, this.cannon)) {
            pos = this.applyContact(pos, this.cannon);
            modified = true;
        }

        // Check if the ball hits a pin
        for (let i=0; i<this.pinsOnBoard.length; ++i){
            if (!PeggleBoard.checkContact(this.ball, this.pinsOnBoard[i])) {
                continue;
            }
            // Ball contacts, so we update pin properties
            if (!this.pinsOnBoard[i].isHit){
                this.pinsInQueue.push(i);
                this.pinsOnBoard[i].isHit = true;
            }

            // Then we update ball properties
            pos = this.applyContact(pos, this.pinsOnBoard[i]);
            modified = true;
        }
        // Otherwise, in freefall
        if (modified) {
            pos = Ball.movement(pos, t);
        }
        this.ball.move(pos);
    }

    applyContact(pos, boardObject) {
        let dx = this.ball.x - boardObject.x;
        let dy = this.ball.y - boardObject.y;
        let compRad = this.ball.size + boardObject.size;
        let uv = PeggleBoard.unitVector(
            (dx * this.ball.size / compRad),
            (dy * this.ball.size / compRad)
        );

        boardObject.uv = uv;
        let dot = PeggleBoard.dotProduct(this.ball.dx, this.ball.dy, uv.x, uv.y);
        pos.x = boardObject.x + uv.x * compRad;
        pos.y = boardObject.y + uv.y * compRad;
        pos.dx = (this.ball.dx - 2 * uv.x * dot) * 0.9;
        pos.dy = (this.ball.dy - 2 * uv.y * dot) * 0.9;
        return pos;
    }

    checkBallReset() {
        if (this.ball.y > this.height){
            this.resetBall(this.pinSize);
            this.ballCount -= 1;
        }
    }

    generatePin(currentPin) {
        let genPin;
        let canGen = true;
        do {
            canGen = true;
            genPin = new Pin(
                this.context,
                Pin.generateLegalPosition(
                    this.width,
                    this.pinSize,
                    0,
                    0
                ),
                Pin.generateLegalPosition(
                    this.height,
                    this.pinSize,
                    this.cannon.size + this.cannon.y + this.pinSize,
                    50
                ),
                this.pinSize
            );
            for (var i=0; i<currentPin; ++i) {
                canGen = (!PeggleBoard.checkContact(this.pinsOnBoard[i], genPin, 10));
                if (!canGen) {
                    break;
                }
            }
        } while (!canGen);

        return genPin;
    }

    move(delta) {
        this.cannon.move(delta);
        if (this.ball.canFire){
            this.ball.setCannonPosition(this.cannon.barrelX, this.cannon.barrelY)
        }
    }
}