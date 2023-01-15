class PeggleBoard {
    // board context
    context;
    width;
    height;

    // physics
    dt

    // board reqs
    pinSize;
    cannon;
    ball;
    ballCount;
    bucket;

    // pegs
    pinsOnBoard;
    pinsInQueue;

    // Obstacles
    obstaclesOnBoard;

    // TODO: Create super class for boardObjects

    constructor(context, width, height, dt) {
        this.context = context;
        this.init(this.context, width, height, dt);
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
        // NOTE: This is just for sphere-sphere physics
        buffer = !buffer ? 0 : buffer;  // Used for pin overlaps
        let totalX = ball1.x - ball2.x;
        let totalY = ball1.y - ball2.y;
        let compRad = ball1.size + ball2.size;
        return (totalX * totalX + totalY * totalY <= compRad * compRad);
    }

    init(context, width, height, dt) {
        this.width = width;
        this.height = height;
        this.pinSize = 10;
        this.dt = dt
        context.canvas.width = width;
        context.canvas.height = height;
    }

    // Reset the peggle board
    reset() {
        this.pinsOnBoard = [];
        this.pinsInQueue = [];
        this.obstaclesOnBoard = [];
        let mid = this.width/2;
        this.cannon = new Cannon(this.context, mid, 10, 30, 0);
        this.bucket = new Bucket(this.context, mid-80, this.height-25, 160, 30);
        // this.obstaclesOnBoard.push(new Edge(this.context, mid-60, mid-60, 120, 120))
        this.addPinsToBoard(25);
        this.ballCount = 10;
        this.resetBall(this.pinSize);
    }

    addPinsToBoard(nPins) {
        nPins = nPins < 1 ? 1 : nPins;
        for (var i=0; i<nPins; ++i) {
            // TODO: Generate the board as a series of blocks of pins, then generate the typing
            this.pinsOnBoard.push(this.generatePin(i));
        }
    }

    resetBall(size) {
        this.ball = new Ball(this.context, this.cannon.barrelX, this.cannon.barrelY, size);
    }

    // Draw the peggle board, ball, and cannon for animation
    draw() {
        // Clear the board for rerendering
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        // Render the board
        this.drawPeggleBoard();
    }

    // draws just the board and pins
    drawPeggleBoard() {
        this.pinsOnBoard.forEach(pin => {
            pin.draw();
        });
        this.obstaclesOnBoard.forEach(obs => {
            obs.draw();
        });
        this.cannon.draw();
        this.bucket.draw();
        this.ball.draw();
    }

    fire() {
        if (this.ball.canFire) {
            let dx = this.cannon.firingVelocity * Math.sin(this.cannon.angle * PeggleBoard.deg_to_rad);
            let dy = this.cannon.firingVelocity * Math.cos(this.cannon.angle * PeggleBoard.deg_to_rad);
            this.ball.fire(dx, dy);
        }
    }

    applyPhysics() {
        this.applyBallPhysics(this.dt);
        this.applyBucketPhysics(this.dt);
    }

    applyBucketPhysics(t) {
        let minX = 0;
        let maxX = this.width - this.bucket.width;
        this.bucket.applyPhysics(t, minX, maxX)
    }

    applyBallPhysics(t){
        // TODO: Refactor this to have more ball-related functions
        if (this.ball.canFire){
            return;
        }

        // Walls
        this.ball.applyRectPhysics(0, 0, this.width, this.height, false, false)

        // Check cannon hit
        if (PeggleBoard.checkContact(this.ball, this.cannon)) {
            this.ball.applySpherePhysics(this.cannon);
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
            this.ball.applySpherePhysics(this.pinsOnBoard[i]);
        }

        this.bucket.bucketEdge.forEach(edge => {
            this.ball.applyRectPhysics(edge.x, edge.y, edge.width, edge.height, true)
        })
        this.obstaclesOnBoard.forEach(edge => {
            this.ball.applyRectPhysics(edge.x, edge.y, edge.width, edge.height, true)
        })

        this.ball.move(t);
    }

    checkBallReset() {
        // TODO: Add pin removal to ball reset
        // TODO: Add ball counter logic to ball reset
        if (this.ball.y > this.height + this.ball.size * 2){
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