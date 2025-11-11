# Falling Sand Cellular Automata Project

## Project Overview
This project implements a falling sand cellular automata simulation using only vanilla HTML, CSS, and JavaScript. The simulation features realistic sand physics with gravity, particle stacking, and interactive sand placement.

## Technical Architecture

### Core Components
- **HTML Structure**: Single-page application with canvas element and info overlay
- **CSS Styling**: Full-screen responsive design with dark theme
- **JavaScript Engine**: Grid-based cellular automaton with optimized rendering

### Key Features
- Continuous sand generation from top center
- Realistic gravity-based sand physics
- Sand stacking and collision detection
- Mouse/touch interaction for sand placement
- Smooth 60fps animation using requestAnimationFrame
- Mobile-responsive with touch support

### File Structure
```
/
├── index.html          # Main application file (HTML + CSS + JS)
├── AGENTS.md          # Project documentation (this file)
└── .gitignore         # Git ignore file
```

## Implementation Details

### Grid System
- **Cell Size**: 2x2 pixels per sand particle
- **Grid Dimensions**: Dynamically calculated based on viewport size
- **Data Structure**: 2D arrays for current and next grid states

### Sand Physics
- Particles fall due to gravity (downward movement)
- Diagonal falling when blocked (left/right preference)
- Sliding behavior at the bottom with random probability
- Stacking when particles collide with obstacles

### Performance Optimizations
- Double buffering technique for grid updates
- Efficient canvas rendering with batch drawing
- Optimized collision detection algorithms

## Development Guidelines

### Testing
- Open `index.html` in any modern web browser
- Test mouse click interactions for sand placement
- Verify continuous sand generation from top center
- Check mobile touch functionality

### Common Commands
Since this is a vanilla HTML project, no build commands are required:
- Open `index.html` directly in browser to run
- Use browser developer tools for debugging
- Test responsiveness by resizing browser window

### Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Touch support for mobile devices
- Responsive design adapts to different screen sizes

## Future Enhancement Ideas
- Different particle types (water, stone, etc.)
- Temperature simulation
- Wind effects
- Particle color variations
- Performance settings for larger simulations
- Save/load simulation states
