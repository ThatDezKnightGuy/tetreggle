class Ball {
    // context
    context;

    // position
    x;
    y;
    // velocity
    dx;
    dy;
    // accelleration
    gravity;

    // ball details
    color;
    size;
    path;

    // On the cannon
    canFire;

    constructor(context, cannonX, cannonY, size) {
        this.context = context;
        this.setCannonPosition(cannonX, cannonY)
        this.gravity = 1;
        this.init(size);
    }

    static movement(ball, t) {
        let temp = Ball.clone(ball);

        temp.x += temp.dx * t;
        temp.y += (temp.dy + 0.5 * temp.gravity * t) * t;
        temp.dy += temp.gravity * t;

        return temp;
    }

    static clone = (ball) => ({...ball})

    init(size) {
        this.canFire = true;
        this.size = size;
        this.color = '#404040';
        this.path = new Path2D();
        this.path.ellipse(this.x, this.y, this.size, this.size, Math.PI / 4, 0, 2 * Math.PI);
    }

    // Sets the ball to the cannon position (and zeroes velocity)
    setCannonPosition(cannonX, cannonY) {
        this.x = cannonX;
        this.y = cannonY;

        // Initialise no velocity
        this.dx = 0;
        this.dy = 0;
    }

    // Moves the ball to a position from a copied ball
    move(ball) {
        this.x = ball.x;
        this.y = ball.y;

        this.dx = ball.dx;
        this.dy = ball.dy;
    }

    draw() {
        this.context.fillStyle = this.color;
        this.path = new Path2D();
        this.path.ellipse(this.x, this.y, this.size, this.size, Math.PI / 4, 0, 2 * Math.PI);
        this.context.fill(this.path);
    }

    fire(dx, dy) {
        this.dx = dx;
        this.dy = dy;
        this.canFire = false;
    }
}