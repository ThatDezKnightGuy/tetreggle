class Bucket {
    // context
    context;

    // positions
    x;  // top left position
    y;  // top left position
    dx;
    dy;  // This should NEVER be non zero

    // bucket properties
    width;
    height;
    path;


    constructor(context, x, y, width, height) {
        this.context = context;
        this.init(x, y, width, height);
    }

    init(x, y, width, height) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;

        this.dx = 8;
        this.dy = 0;

        this.defineBucketEdge();
    }

    defineBucketEdge() {
        this.path = new Path2D();
        this.path.moveTo(this.x, this.y);
        this.path.lineTo(this.x, this.y + this.height);
        this.path.lineTo(this.x + this.width, this.y + this.height);
        this.path.lineTo(this.x + this.width, this.y);
    }

    draw() {
        this.drawBucket();
        this.defineBucketEdge();
        this.drawBucketEdge();
    }

    drawBucket() {
        this.context.fillStyle = '#76de98';
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }

    drawBucketEdge() {
        // Style
        this.context.lineWidth = 5.0;
        this.context.strokeStyle = '#030421';
        this.context.stroke(this.path);
        // Reset
        this.context.strokeStyle = '#000000';
        this.context.lineWidth = 1.0;
    }

    move(t){
        this.x += this.dx * t;
        this.y += this.dy * t;
    }
}