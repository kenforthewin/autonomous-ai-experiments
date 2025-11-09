# Falling Sand Cellular Automata

A beautiful, interactive falling sand cellular automata web application built with vanilla HTML, CSS, and JavaScript.

## Features

- **Realistic Sand Physics**: Sand particles fall, stack, and slide naturally using cellular automata rules
- **Continuous Sand Generation**: Sand continuously spawns from the top center of the canvas
- **Interactive Mouse Control**: Click and drag anywhere on the canvas to spawn sand
- **Smooth Animation**: 60 FPS animation loop for buttery smooth performance
- **No Dependencies**: Pure vanilla JavaScript, HTML, and CSS - no external libraries required
- **Double Buffering**: Prevents update artifacts and ensures consistent physics
- **Beautiful Visuals**: Dark theme with glowing canvas border and sandy tan particles

## How to Use

1. **Open in Browser**: Open `index.html` in any modern web browser
2. **Watch Sand Fall**: Sand automatically spawns at the top center and falls
3. **Add More Sand**: Click anywhere on the canvas to spawn sand at that location
4. **Create Structures**: Click and drag to paint with sand and create structures
5. **Observe Physics**: Watch how sand particles interact, pile up, and slide

## File Structure

```
├── index.html     - HTML5 document with canvas element
├── style.css      - CSS styling and layout
└── script.js      - JavaScript simulation engine
```

## Technical Implementation

### Grid System
- **Dimensions**: 200×150 cells (800×600 pixels divided by 4-pixel cells)
- **Double Buffering**: Separate read and write grids prevent update order issues
- **Efficient Processing**: Bottom-to-top iteration for natural sand falling

### Physics Rules

The simulation implements realistic sand physics:

1. **Gravity**: Sand moves down one cell per frame if empty below
2. **Sliding**: Sand slides diagonally when blocked directly below
   - Random choice between left-diagonal and right-diagonal
   - Attempts alternative diagonal if preferred direction blocked
3. **Stability**: Sand remains in place when completely surrounded

### Rendering

- **Canvas 2D API**: Efficient pixel-perfect rendering
- **Color**: Sandy tan (#C2B280) for natural appearance
- **Cell Size**: 4×4 pixels for good balance of performance and visibility

### Input Handling

- **Continuous Spawning**: Sand spawns at top center every frame
- **Mouse Click**: Click to spawn sand at cursor location
- **Mouse Drag**: Drag to continuously paint with sand
- **Coordinate Mapping**: Accurate pixel-to-grid conversion

## Performance

- **Frame Rate**: 60 FPS using `requestAnimationFrame`
- **Memory**: Minimal footprint with two 200×150 grids
- **Optimization**: Efficient grid processing and rendering

## Browser Support

Works in all modern browsers supporting:
- HTML5 Canvas API
- ES6+ JavaScript (const, let, arrow functions)
- CSS3 (Flexbox, gradients)

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Code Highlights

### Cellular Automata Core
```javascript
// Process from bottom to top for natural falling
for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
    for (let x = 0; x < GRID_WIDTH; x++) {
        if (grid[y][x] === SAND) {
            // Try to move down
            // Try to slide diagonally if blocked
            // Stay in place if completely surrounded
        }
    }
}
```

### Double Buffering Pattern
```javascript
// Initialize next grid as copy of current
initializeNextGrid();

// Process physics into next grid
updateGrid();

// Swap grids for next frame
swapGrids();
```

### Mouse Interaction
```javascript
// Track mouse position and button state
document.addEventListener('mousedown', (event) => {
    mouseDown = true;
    // Calculate grid coordinates from pixel position
});

// Spawn sand clusters at mouse location
function spawnSandAtMouse(canvasX, canvasY) {
    // Create 5×5 cluster with 70% fill probability
}
```

## Customization

You can easily modify the simulation:

- **Cell Size**: Change `CELL_SIZE` constant (currently 4)
- **Sand Color**: Modify `SAND_COLOR` constant (currently '#C2B280')
- **Spawn Rate**: Adjust `spawnContinuousSand()` function
- **Mouse Spawn Size**: Change `radius` in `spawnSandAtMouse()`

## Performance Tips

- For slower devices, increase `CELL_SIZE` to reduce grid complexity
- The simulation maintains 60 FPS even with canvas full of sand
- No memory leaks - grids are pre-allocated and reused

## License

This project is free to use and modify.

## Enjoy!

Open `index.html` in your browser and watch the sand fall! Click around to create your own sand structures. Have fun experimenting with the physics!

