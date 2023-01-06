class Cannon{
    //context
    context;

    // position properties
    x;
    y;
    barrelX;
    barrelY;
    angle;

    uv;

    // cannon details
    color;
    size;
    body;
    barrel;

    // cannonball
    hasBall;
    firingVelocity;

    constructor(context, cannonX, cannonY, size) {
        this.context = context;
        this.init(cannonX, cannonY, size);
    }

    static deg_to_rad = Math.PI / 180;

    init(x, y, size) {
        this.angle = 0;
        this.size = size;
        this.firingVelocity = 10;
        this.color = '#32c937';

        this.x = x,
        this.y = y,
        this.barrelX = x + this.size * Math.sin(this.angle * Cannon.deg_to_rad);
        this.barrelY = y + this.size * Math.cos(this.angle * Cannon.deg_to_rad);

        this.body = new Path2D();
        this.body.ellipse(this.x, this.y, this.size, this.size, Math.PI / 4, 0, 2 * Math.PI);

        this.barrel = new Path2D();
        this.barrel.moveTo(this.x, this.y);
        this.barrel.lineTo(this.barrelX, this.barrelY);
    }

    draw() {
        this.context.fillStyle = this.color;
        this.context.fill(this.body);

        this.barrel = new Path2D();
        this.barrel.moveTo(this.x, this.y);
        this.barrel.lineTo(this.barrelX, this.barrelY);

        this.context.stroke(this.barrel);
    }

    move(delta) {
        if (Math.abs(this.angle + delta) > 90) {
            return;
        }
        this.angle += delta;
        this.barrelX = this.x + this.size * Math.sin(this.angle * Cannon.deg_to_rad);
        this.barrelY = this.y + this.size * Math.cos(this.angle * Cannon.deg_to_rad);
    }
}