# Falling Sand Cellular Automata

## Project Overview
A vanilla HTML/CSS/JavaScript implementation of a falling sand cellular automata simulation. Sand particles fall from the top center of the canvas and collect at the bottom. Users can left-click anywhere on the canvas to spawn sand particles at the cursor location.

## Purpose
Educational and interactive demonstration of cellular automata physics simulation using only browser-native technologies (no external packages or libraries).

## Technology Stack
- **HTML5**: Canvas element for rendering
- **Vanilla JavaScript**: Simulation logic, particle physics, and user interaction
- **CSS**: Basic styling

## Project Structure
```
/
├── index.html          # Main HTML file with canvas element
├── style.css           # Styling for the page and canvas
├── script.js           # Cellular automata simulation logic
├── AGENTS.md           # This file
└── docs/              # Detailed documentation
    └── technical-spec.md
```

## Technical Architecture

### Cellular Automata Approach
- **Grid-based system**: 2D array representing the simulation space
- **Cell states**: Empty (0) or Sand (1)
- **Update rules**: Process grid bottom-to-top to simulate falling
- **Physics**: Sand falls down, can fall diagonally if blocked

### Implementation Details
- Canvas element for rendering
- 2D array for grid state management
- Animation loop using `requestAnimationFrame`
- Mouse event listeners for interactive sand spawning
- Pixel-based rendering (each cell = small square)

## Key Features
1. **Continuous sand spawn**: Sand falls from top center automatically
2. **Interactive spawning**: Left-click to create sand at cursor position
3. **Physics simulation**: Gravity and collision detection
4. **Real-time rendering**: Smooth animation at 60 FPS

## Common Commands
Since this is a vanilla JavaScript project, simply open `index.html` in a web browser.

For development:
- Use any HTTP server to serve files locally (e.g., `python -m http.server`)
- Open browser developer tools for debugging

## Development Notes
- No build process required
- No package manager or dependencies
- Cross-browser compatible (modern browsers with HTML5 Canvas support)

