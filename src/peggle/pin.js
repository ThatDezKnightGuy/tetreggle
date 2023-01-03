class Pin {
    // ontext
    context;

    // position
    x;
    y;

    // pin details
    type;
    color;
    points;
    size;
    path;

    constructor(context, boardWidth, boardHeight, size) {
        this.context = context
        this.x = Math.floor(Math.random() * boardWidth);
        this.y = Math.floor(Math.random() * boardHeight);
        this.size = size;
        this.color = Pin.pinColors[Pin.randomizePinColor(Pin.pinColors.length)];
        this.points = 100;
        this.type = 'test';
        this.path = new Path2D();
        this.path.ellipse(this.x, this.y, this.size, this.size, Math.PI / 4, 0, 2 * Math.PI);
    }

    static pinColors = [
        '#00ffff',
        '#0000ff',
        '#ffa500',
        '#FFFF00',
        '#008000',
        '#800080',
        '#FF0000'
    ];
    
    static randomizePinColor(nOptions) {
        return Math.floor(Math.random() * nOptions);
    }

    draw() {
        this.context.fillStyle = this.color;
        this.context.fill(this.path);
    }
}