class Edge{
    // Canvas context
    context;

    x;
    y;
    width;
    height;

    color;

    constructor(context, x, y, width, height) {
        this.context = context
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = '#000000'
    }

    draw() {
        this.context.fillStyle = this.color;
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }
}