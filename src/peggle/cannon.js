class Cannon{
    //context
    context;

    // position properties
    x;
    y;
    angle;
    
    // cannon details
    color;
    size;
    path;
    
    // cannonball
    hasBall;
    firingVelocity;

    constructor(context, cannonX, cannonY) {
        this.context = context;
        this.init(cannonX, cannonY);
    }

    init(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 45;
        this.firingVelocity = 1;
        this.size = 30;
        this.color = '#32c937';
        this.path = new Path2D();
        this.path.ellipse(this.x, this.y, this.size, this.size, Math.PI / 4, 0, 2 * Math.PI);
    }

    draw() {
        this.context.fillStyle = this.color;
        this.context.fill(this.path);
    }
}