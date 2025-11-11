# Technical Specification: Falling Sand Cellular Automata

## System Architecture

### Grid System
- **Data Structure**: 2D array `grid[x][y]` where each cell contains a state value
- **Cell States**: 
  - `0` = Empty
  - `1` = Sand particle
- **Grid Dimensions**: Configurable via cell size (e.g., 5px cells)

### Physics Engine

#### Update Algorithm
The simulation processes the grid from bottom to top, right to left to ensure proper falling behavior:

```
For each cell (x, y) from bottom to top:
  If cell contains sand:
    Check cell below (y+1):
      - If empty: Move sand down
      - Else check diagonal-left (x-1, y+1):
        - If empty: Move sand diagonally left-down
        - Else check diagonal-right (x+1, y+1):
          - If empty: Move sand diagonally right-down
          - Else: Sand stays in place (settled)
```

#### Rendering
- Use Canvas 2D context `fillRect()` to draw each sand particle
- Clear canvas each frame before redrawing
- Color: Sand particles rendered in tan/brown color
- Background: Dark/black for contrast

### User Interaction

#### Automatic Sand Generation
- Spawn sand particles at top center of canvas every few frames
- Position: `x = canvas.width / 2`, `y = 0`

#### Click-to-Spawn
- Listen for `mousedown` or `click` events on canvas
- Convert mouse coordinates to grid coordinates
- Create sand particle(s) at clicked location
- Optional: Create small cluster of sand particles for better visibility

### Animation Loop
- Use `requestAnimationFrame()` for smooth 60 FPS rendering
- Update cycle:
  1. Process physics (update grid)
  2. Clear canvas
  3. Render all sand particles
  4. Schedule next frame

## Implementation Requirements

### HTML Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Falling Sand Simulation</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <canvas id="sandCanvas"></canvas>
    <script src="script.js"></script>
</body>
</html>
```

### CSS Requirements
- Full viewport canvas
- Remove default margins/padding
- Center canvas
- Cursor feedback on hover

### JavaScript Components

1. **Configuration**
   - Canvas size
   - Cell size
   - Grid dimensions
   - Colors

2. **Initialization**
   - Get canvas context
   - Create grid array
   - Setup event listeners
   - Start animation loop

3. **Core Functions**
   - `updateGrid()`: Apply physics rules
   - `render()`: Draw current state
   - `addSand(x, y)`: Add sand at position
   - `getGridCoords(mouseX, mouseY)`: Convert pixels to grid
   - `isValidPosition(x, y)`: Boundary checking
   - `isEmpty(x, y)`: Check if cell is empty

4. **Event Handlers**
   - Mouse click handler
   - Automatic spawn timer/counter

## Performance Considerations
- Process only active cells when possible
- Use typed arrays if performance issues arise
- Optimize rendering by only drawing changed regions (future enhancement)
- Limit spawn rate to prevent grid overflow

## Browser Compatibility
- Requires HTML5 Canvas support (all modern browsers)
- ES6 JavaScript features acceptable
- No polyfills needed for modern browser targets

