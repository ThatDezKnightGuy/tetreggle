class Bucket {
    // context
    context;

    // positions
    x;  // top left position
    y;  // top left position
    dx;
    dy;  // This should NEVER be non zero

    // bucket properties
    width; // outer boundaries of the bucket
    height; // outer boundaries of the bucket
    bucketEdge;

    constructor(context, x, y, width, height) {
        this.context = context;
        this.init(x, y, width, height);
    }

    static edgeWidth = 30.0;

    init(x, y, width, height) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;

        this.dx = 8;  // Should this be passed through from constructor?
        this.dy = 0;

        this.defineBucketEdge();
    }

    defineBucketEdge() {
        this.bucketEdge = [];
        // this.bucketEdge.push(new Edge(
        //     this.context,
        //     this.x,
        //     this.y,
        //     this.width,
        //     this.height
        // ))
        this.bucketEdge.push(new Edge(
            this.context,
            this.x,
            this.y,
            Bucket.edgeWidth,
            this.height
        ))
        this.bucketEdge.push(new Edge(
            this.context,
            this.x + this.width - Bucket.edgeWidth,
            this.y,
            Bucket.edgeWidth,
            this.height
        ))
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
        this.bucketEdge.forEach(edge => {
            edge.draw();
        });
    }

    move(t){
        this.x += this.dx * t;
        this.y += this.dy * t;
    }

    applyPhysics(t, minX, maxX) {
        if (
            this.x < minX
        ) {
            this.x = minX;
            this.dx = -1 * this.dx;
        }

        if (
            this.x > maxX
        ) {
            this.x = maxX;
            this.dx = -1 * this.dx;
        }

        this.move(t)
    }
}