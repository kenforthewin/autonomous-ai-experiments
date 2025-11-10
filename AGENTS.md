# Falling Sand Cellular Automata Project

## Project Overview
This project implements a falling sand cellular automata simulation using vanilla HTML, JavaScript, and CSS. The simulation creates realistic sand physics where particles fall due to gravity, stack at the bottom, and respond to user interaction.

## Technical Implementation

### Architecture
- **Grid-based cellular automata**: 2D array system for tracking sand particles
- **Physics engine**: Gravity simulation with diagonal sliding mechanics
- **Canvas rendering**: HTML5 Canvas for efficient particle visualization
- **Event handling**: Mouse and touch interaction for spawning sand

### Key Features
- Continuous sand generation from top center
- Gravity-based particle physics
- Sand stacking and slope sliding
- Mouse/touch interaction to spawn sand
- Responsive full-screen canvas
- Optimized animation using requestAnimationFrame

### File Structure
```
├── index.html      # Main HTML structure with canvas element
├── style.css       # Styling for full-screen canvas and dark theme
└── script.js       # Complete physics engine and rendering logic
```

## Development Commands

### Local Development
```bash
# Start local web server
python3 -m http.server 8000

# Open in browser
# Navigate to http://localhost:8000
```

### Testing
- Open index.html in a web browser
- Verify sand falls from top center continuously
- Test mouse click interaction to spawn sand
- Check responsive behavior on window resize
- Test touch functionality on mobile devices

## Technical Specifications

### Grid Configuration
- Cell size: 4x4 pixels
- Dynamic grid dimensions based on viewport
- Binary state system (0 = empty, 1 = sand)

### Physics Rules
1. Sand falls straight down if space available
2. Falls diagonally left if blocked below and left-down is empty
3. Falls diagonally right if blocked below and right-down is empty
4. Processes from bottom to top for accurate simulation

### Performance Optimizations
- Efficient grid-based collision detection
- Single canvas rendering pass per frame
- requestAnimationFrame for smooth 60fps animation
- Minimal DOM manipulation

## Browser Compatibility
- Modern browsers with HTML5 Canvas support
- Touch-enabled devices supported
- Responsive design adapts to any screen size

## Usage Instructions
1. Open the web page in a browser
2. Watch sand continuously fall from the top center
3. Click anywhere to spawn sand at that location
4. Hold and drag mouse to create sand streams
5. Resize window to see responsive adaptation
