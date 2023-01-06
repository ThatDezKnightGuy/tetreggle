class Bucket {
    // context
    context;

    // positions
    x;
    y;
    dx;
    dy;  // This should NEVER be non zero

    // bucket properties
    width;
    height;
    edgeSize;

    constructor(context, width, edgeSize) {
        this.context = context;
        this.init(width, edgeSize);
    }

    init(width, edgeSize) {
        // how x, y????
        this.width = width;
        this.height = 20;
    }

}