class Piece {
    x;
    y;
    color;
    edge;
    shape;
    name;
    typeId;
    context;

    constructor(context) {
        this.context = context;
        this.init();
    }

    // Initialise a new piece on construction
    init() {
        this.typeId = Piece.randomizeTetronimoType(COLORS.length)
        this.color = COLORS[this.typeId];
        this.shape = SHAPES[this.typeId];
        this.name = NAMES[this.typeId];
    
        // Starting position
        this.setDisplayPosition()
    }

    // Sets the main board position, for starting a drop
    setBoardPosition() {
        this.x = (this.name === 'O') ? 4 : 3;
        this.y = (this.name === 'I') ? -1 : 0;
    }

    // Sets teh display position for a swap
    setDisplayPosition() {
        this.x = (this.name === 'O') ? 1 :
            (this.name === 'I') ? 0 : 0.5;
        this.y = (this.name === 'I') ? 0.5 : 1;
    }

    // Draws the piece on the board grid
    draw() {
        this.context.fillStyle = this.color;
        this.shape.forEach((row, y) => {
            row.forEach((value,x) => {
                // This.x, this.y are the top left corner coords
                // x, y are the internal tetronimo positions (eg, 1-3, 1-3)
                // this.x + x is the position of the tetronimo block on the board
                if (value > 0) {
                    this.context.fillRect(this.x+x, this.y+y, 1, 1);
                    this.context.strokeRect(this.x+x, this.y+y, 1, 1);
                }
            });
        });
    }

    // Moves this piece to the 
    move(piece) {
        this.x = piece.x;
        this.y = piece.y;
        this.shape = piece.shape;
    }

    // Static method to return a tetronimo value from the options provided
    static randomizeTetronimoType(nOptions) {
        return Math.floor(Math.random() * nOptions);
    }

    static modifyColor(hexString) {
        let localColor = hexString.slice(1);
        let intColor = parseInt(localColor, 16);
        let r = (intColor >> 16)
        let b = ((intColor >> 8) & 0x00FF)
        let g = intColor & 0x0000FF

        if (r < 10) {
            r += 10;
        } else if (r < 128) {
            r = Math.ceil(r * 1.2);
        } else if (r > 240) {
            r -= 10;
        } else {
            r = Math.floor(r * 0.8);
        }
        
        r = (r < 0) ? 0 :
            (r > 255) ? 255 : r;

        if (g < 10) {
            g += 10;
        } else if (g < 128) {
            g = Math.ceil(g * 1.2);
        } else if (g > 240) {
            g -= 10;
        } else {
            g = Math.floor(g * 0.8);
        }
        
        g = (g < 0) ? 0 :
            (g > 255) ? 255 : g;

        if (b < 10) {
            b += 10;;
        } else if (b < 128) {
            b = Math.ceil(b * 1.2);
        } else if (b > 240) {
            b -= 10;
        } else {
            b = Math.floor(b * 0.8);
        }
        
        b = (b < 0) ? 0 :
            (b > 255) ? 255 : b;

        return '#' + (g | (b << 8) | (r << 16)).toString(16);
    }
}