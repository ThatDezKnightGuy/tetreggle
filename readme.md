# TETREGGLE
Tetreggle is my attempt to:
1. Learn a new language: JavaScript (js)
1. Create a Proof of Concept for my nightmare game, Tetrs X Peggle

----

## Tetris

This is a tetris implementation in js, based on this [tutorial from Michael Karen, on Medium](https://michael-karen.medium.com/learning-modern-javascript-with-tetris-92d532bcd057), with full [git implementation of that tutorial here](https://github.com/melcor76/js-tetris). It's an exploration of the syntax and implementation, and some attempts to extend the basic implementation of the tutorial.

### Tetris: Unique implementations

1. Piece storage and swapping via `shift` key
1. Controls overlay
1. Grid rendering
1. Hidden grid print to console on `c` click

### Tetris: Planned features

1. Coloured edges for pieces
1. B/W mode
1. Colourblind mode
1. Tile counter for tetronimo generation
  i. This is for the peggle integration
1. Multiple piece drop
1. Pause
1. Render on single `canvas`
  i. This requires deeper understanding of the `canvas` environment 

### Tetris: Known bugs

1. Swapping in `O` and `I` blocks can clip a block through the edge of the board and it will get trapped on rerender
  i. Need to check the rotation and reposition the piece `x` position so it's not clipping

----

## Peggle

TBC

----

## Notes

