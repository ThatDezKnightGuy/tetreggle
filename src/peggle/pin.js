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
    isHit;

    uv;
    proj;

    constructor(context, pinX, pinY, size) {
        this.context = context;
        this.init(pinX, pinY, size);
    }

    static pinColors = [
        '#ffa500',  // Orange
        '#0000ff',  // Blue
        '#008000',  // Green
        '#800080'   // Purple
    ];
    
    static randomizePinColor(nOptions) {
        return Math.floor(Math.random() * nOptions);
    }

    static generateLegalPosition(boardHeight, size, roofOffset, baseOffset){
        let range = boardHeight - 2 * size - roofOffset - baseOffset;
        return Math.floor(Math.random() * range) + size + roofOffset;
    }

    init(pinX, pinY, size) {
        this.y = pinY;
        this.x = pinX;
        this.size = size;

        this.isHit = false;
        this.color = Pin.pinColors[Pin.randomizePinColor(Pin.pinColors.length)];
        this.points = 100;
        this.type = 'test';
        this.path = new Path2D();
        this.path.ellipse(this.x, this.y, this.size, this.size, Math.PI / 4, 0, 2 * Math.PI);
    }

    draw() {
        this.context.fillStyle = this.color;
        this.context.fill(this.path);

        if (this.isHit) {
            this.context.lineWidth = 3.0;
            this.context.strokeStyle = '#7ee0e6';
            this.context.stroke(this.path);
            this.context.strokeStyle = '#000000';
            this.context.lineWidth = 1.0;
        }

        if (this.uv) {
            this.proj = new Path2D();
            this.proj.moveTo(this.x, this.y);
            this.proj.lineTo(this.x + this.uv.x * this.size * 2, this.y + this.uv.y * this.size * 2);
            this.context.stroke(this.proj);
        }
    }
}