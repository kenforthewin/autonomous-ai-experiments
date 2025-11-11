# Falling Sand Cellular Automata

## Project Overview
A vanilla HTML/CSS/JavaScript implementation of a falling sand cellular automata simulation. Sand particles fall from the top center of the canvas and collect at the bottom. Users can left-click anywhere on the canvas to spawn sand particles at the cursor location.

## Purpose
Educational and interactive demonstration of cellular automata physics simulation using only browser-native technologies (no external packages or libraries).

## Technology Stack
- **HTML5**: Canvas element for rendering
- **Vanilla JavaScript**: Simulation logic, particle physics, and user interaction
- **CSS**: Basic styling with Flexbox

## Project Structure
```
/
├── index.html          # Main HTML file with canvas element (14 lines)
├── style.css           # Styling for the page and canvas (21 lines)
├── script.js           # Cellular automata simulation logic (175 lines)
├── AGENTS.md           # This file
└── docs/              # Detailed documentation
    └── technical-spec.md
```

## Technical Architecture

### Cellular Automata Approach
- **Grid-based system**: 2D array (160 cols × 120 rows) representing the simulation space
- **Cell size**: 5 pixels per cell
- **Canvas size**: 800×600 pixels
- **Cell states**: Empty (0) or Sand (1)
- **Update rules**: Process grid bottom-to-top to simulate falling
- **Physics**: Sand falls down, can fall diagonally left/right if blocked

### Implementation Details
- **Canvas**: 800×600px HTML5 canvas element centered on black background
- **Grid storage**: 2D JavaScript array `grid[x][y]`
- **Animation loop**: `requestAnimationFrame()` targeting 60 FPS
- **Auto-spawn**: 1 sand particle every 2 frames from top center
- **Interactive spawn**: 3×3 cluster of sand on mouse click
- **Rendering**: `fillRect()` draws tan-colored (#c2b280) sand particles
- **Physics processing**: Bottom-to-top iteration prevents duplicate movements

### Core Functions
- `init()`: Initialize canvas, grid, and event listeners
- `createGrid(cols, rows)`: Create 2D array filled with zeros
- `updateGrid()`: Apply cellular automata physics rules
- `render()`: Draw current grid state to canvas
- `addSand(x, y)`: Place sand at grid coordinates
- `getGridCoords(mouseX, mouseY)`: Convert mouse to grid position
- `isValidPosition(x, y)`: Check grid boundaries
- `isEmpty(x, y)`: Check if cell is empty
- `handleClick(event)`: Mouse click event handler
- `animate()`: Main animation loop

## Key Features
1. **Continuous sand spawn**: Sand falls from top center automatically (1 particle/2 frames)
2. **Interactive spawning**: Left-click to create 3×3 sand cluster at cursor position
3. **Physics simulation**: Gravity and cascading behavior with collision detection
4. **Real-time rendering**: Smooth animation at 60 FPS
5. **Visual design**: Tan sand on black background with subtle border

## How to Use
1. Open `index.html` in any modern web browser
2. Watch sand automatically spawn from the top center and fall
3. Click anywhere on the canvas to spawn sand at that location
4. Sand will accumulate and create natural-looking piles

## Common Commands
Since this is a vanilla JavaScript project, simply open `index.html` in a web browser.

For development/testing:
```bash
# Start local HTTP server (optional, but recommended)
python3 -m http.server 8080

# Then open browser to:
http://localhost:8080
```

For debugging:
- Open browser developer tools (F12)
- Check Console tab for any errors
- Use Performance tab to monitor FPS

## Development Notes
- **No build process required** - runs directly in browser
- **No package manager or dependencies** - 100% vanilla code
- **Cross-browser compatible** - works in all modern browsers with HTML5 Canvas support
- **Performance**: Handles 160×120 grid (19,200 cells) at 60 FPS
- **Mobile-friendly**: Responsive design with proper viewport settings

## Implementation Highlights
- **Efficient physics**: Two-buffer system prevents particle duplication during updates
- **Boundary checking**: All grid accesses validated to prevent errors
- **Event handling**: Proper coordinate transformation from screen to grid space
- **Code organization**: Clear separation of concerns (init, physics, rendering, interaction)

