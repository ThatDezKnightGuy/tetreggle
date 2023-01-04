class Cannon{
    //context
    context;

    // position properties
    originX;
    originY;
    x;
    y;
    angle;

    // cannon details
    color;
    size;
    body;
    barrel;

    // cannonball
    hasBall;
    firingVelocity;

    constructor(context, cannonX, cannonY) {
        this.context = context;
        this.init(cannonX, cannonY);
    }

    static deg_to_rad = Math.PI / 180;

    init(x, y) {
        this.angle = 0;
        this.size = 30;
        this.firingVelocity = 10;
        this.color = '#32c937';

        this.originX = x,
        this.originY = y,
        this.x = x + this.size * Math.sin(this.angle * Cannon.deg_to_rad);
        this.y = y + this.size * Math.cos(this.angle * Cannon.deg_to_rad);

        this.body = new Path2D();
        this.body.ellipse(this.originX, this.originY, this.size, this.size, Math.PI / 4, 0, 2 * Math.PI);

        this.barrel = new Path2D();
        this.barrel.moveTo(this.originX, this.originY);
        this.barrel.lineTo(this.x, this.y);
    }

    draw() {
        this.context.fillStyle = this.color;
        this.context.fill(this.body);

        this.barrel = new Path2D();
        this.barrel.moveTo(this.originX, this.originY);
        this.barrel.lineTo(this.x, this.y);

        this.context.stroke(this.barrel);
    }

    move(delta) {
        if (Math.abs(this.angle + delta) > 90) {
            return;
        }
        this.angle += delta;
        this.x = this.originX + this.size * Math.sin(this.angle * Cannon.deg_to_rad);
        this.y = this.originY + this.size * Math.cos(this.angle * Cannon.deg_to_rad);
    }
}