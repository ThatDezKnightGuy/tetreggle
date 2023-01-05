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

    static checkContact(ball1, ball2){
        let totalX = ball1.x - ball2.x;
        let totalY = ball1.y - ball2.y;
        let compRad = ball1.size + ball2.size;
        return (totalX * totalX + totalY * totalY <= compRad * compRad);
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
        this.cannon = new Cannon(this.context, this.width/2, 10);
        this.resetBall();
    }

    resetBall() {
        this.ball = new Ball(this.context, this.cannon.x, this.cannon.y, 5);
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

        // Check if the ball hits a pin
        for (let i=0; i<this.pinsOnBoard.length; ++i){
            if (!PeggleBoard.checkContact(pos, this.pinsOnBoard[i])) {
                continue;
            }
            let pin = this.pinsOnBoard[i];
            console.log(pin)
            console.log(this.ball);
            // Ball contacts, so we update pin properties

            // Then we update ball properties
            let dx = this.ball.x - pin.x;
            let dy = this.ball.y - pin.y;
            let compRad = this.ball.size + pin.size;
            let uv = PeggleBoard.unitVector(
                (dx * this.ball.size / compRad),
                (dy * this.ball.size / compRad)
            );

            pin.uv = uv;
            let dot = PeggleBoard.dotProduct(this.ball.dx, this.ball.dy, uv.x, uv.y);
            pos.x = pin.x + uv.x * compRad;
            pos.y = pin.y + uv.y * compRad;
            pos.dx = (this.ball.dx - 2 * uv.x * dot);
            pos.dy = (this.ball.dy - 2 * uv.y * dot);
            modified = true;
            console.log(pos);
        }
        // Otherwise, in freefall
        if (modified) {
            pos = Ball.movement(pos, t);
        }
        this.ball.move(pos);
    }

    checkBallReset() {
        if (this.ball.y > this.height){
            this.resetBall();
        }
    }

    move(delta) {
        this.cannon.move(delta);
        if (this.ball.canFire){
            this.ball.setCannonPosition(this.cannon.x, this.cannon.y)
        }
    }
}