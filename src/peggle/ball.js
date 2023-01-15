class Ball {
    // context
    context;

    // position
    initialX;
    initialY;
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

    // fire tracker
    positions;
    posPath;

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
        this.positions = [];
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
        this.initialX = cannonX;
        this.initialY = cannonY;

        // Initialise no velocity
        this.dx = 0;
        this.dy = 0;
    }

    // Moves the ball
    move(t) {
        if (!this.canFire) {
            this.positions.push([this.x, this.y])
        }
        this.x += (this.dx) * t;
        this.y += (this.dy + 0.5 * this.gravity * t) * t;

        this.dx += 0;
        this.dy += this.gravity * t;
    }

    draw() {
        this.context.fillStyle = this.color;
        this.path = new Path2D();
        this.path.ellipse(this.x, this.y, this.size, this.size, Math.PI / 4, 0, 2 * Math.PI);
        this.context.fill(this.path);

        // TODO: Add a debug flag to the extra draw
        if (!this.canFire) {
            this.posPath = new Path2D();
            this.posPath.moveTo(this.initialX, this.initialY);

            for (var i=0; i<this.positions.length; ++i) {
                let m = this.positions[i]
                this.posPath.lineTo(m[0], m[1]);

                let dot = new Path2D()
                let j = i < this.positions.length - 5 ? 0 : 100 * (this.positions.length - i)/ 5;
                this.context.strokeStyle = 'rgba(' + [100, 100, 200, j] +')';
                dot.ellipse(m[0], m[1], this.size, this.size, Math.PI / 4, 0, 2 * Math.PI);
                this.context.stroke(dot);
            }
            this.context.strokeStyle = '#76de98';
            this.context.stroke(this.posPath);
            this.context.strokeStyle = '#000000';
        }
    }

    fire(dx, dy) {
        if (this.canFire) {
            this.dx = dx;
            this.dy = dy;
            this.canFire = false;
        }
    }

    applyRectPhysics(x, y, width, height, isExternal, applyFloor) {
        isExternal = !isExternal ? false : true // Ensures it's real, I don't trust null is false
        applyFloor = !applyFloor ? false : true // Ensures it's real, I don't trust null is false

        if (isExternal) {
            this.applyExternalRectanglePhysics(x, y, width, height)
        } else {
            this.applyInternalRectPhysics(x, y, width, height, applyFloor)
        }
    }

    applyInternalRectPhysics(x, y, width, height, applyFloor) {
        // Check if the ball hits a wall
        if (
            (this.x < x + this.size)
        ) {
            this.x = x + this.size;
            this.y = this.y;
            this.dx = -1 * this.dx;
            this.dy = this.dy;
        }

        if (
            (this.x > x + width - this.size)
        ) {
            this.x = x + width - this.size;
            this.y = this.y;
            this.dx = -1 * this.dx;
            this.dy = this.dy;
        }

        // Check if the ball hits the roof
        if (this.y < y + this.size) {
            this.x = this.x;
            this.y = y + this.size;
            this.dx = this.dx;
            this.dy = -1 * this.dy;
        }

        if (applyFloor && (this.y > y + height + this.size)) {
            this.x = this.x;
            this.y = y + height + this.size;
            this.dx = this.dx;
            this.dy = -1 * this.dy;
        }
    }

    applyExternalRectanglePhysics(x, y, width, height) {
        // TODO: Figure out why the external rectangle physics isn't working on the edges of a box
        if ( // Will collide with block
            this.x > x - this.size &&
            this.x < x + width + this.size &&
            this.y > y - this.size &&
            this.y < y + height + this.size
        ) {
            let m = this.lastPosition();
            // top
            if (
                m[1] < y &&
                this.x > x + this.size &&
                this.x < x + width - this.size
            ){
                this.x = this.x;
                this.y = this.y;
                this.dx = this.dx;
                this.dy = -1 * this.dy;
                return ;
            }

            // bottom
            if (
                m[1] > y + height &&
                this.x > x + this.size &&
                this.x < x + width - this.size
            ){
                this.x = this.x;
                this.y = this.y;
                this.dx = this.dx;
                this.dy = -1 * this.dy;
                return ;
            }

            // left
            if (
                m[0] < x &&
                this.y > y + this.size &&
                this.y < y + height + this.size
            ){
                this.x = this.x;
                this.y = this.y;
                this.dx = -1 * this.dx;
                this.dy = this.dy;
                return ;
            }

            // right
            if (
                m[0] > x + width &&
                this.y > y + this.size &&
                this.y < y + height + this.size
            ){
                this.x = this.x;
                this.y = this.y;
                this.dx = -1 * this.dx;
                this.dy = this.dy;
                return ;
            }
        }

    }

    applySpherePhysics(boardObject) {
        let deltaX = this.x - boardObject.x;
        let deltaY = this.y - boardObject.y;
        let compRad = this.size + boardObject.size;
        let uv = PeggleBoard.unitVector(
            (deltaX * this.size / compRad),
            (deltaY * this.size / compRad)
        );

        boardObject.uv = uv;
        let dot = PeggleBoard.dotProduct(this.dx, this.dy, uv.x, uv.y);
        this.x = boardObject.x + uv.x * compRad;
        this.y = boardObject.y + uv.y * compRad;
        this.dx = (this.dx - 2 * uv.x * dot) * 0.9;
        this.dy = (this.dy - 2 * uv.y * dot) * 0.9;
        return this;
    }

    lastPosition() {
        if (this.positions.length == 0) {
            return [this.initialX, this.initialY];
        }
        return this.positions[this.positions.length-1];
    }
}