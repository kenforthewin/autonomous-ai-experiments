# Falling Sand Cellular Automata Project

## Project Overview
This project implements a falling sand cellular automata simulation using vanilla HTML, JavaScript, and CSS. The simulation features:
- Sand particles that fall from the top center of the page
- Sand collection at the bottom of the page
- Interactive sand generation via left-click
- Real-time physics simulation

## Technical Architecture
- **Frontend**: Vanilla HTML5, CSS3, and JavaScript (ES6+)
- **Rendering**: Canvas API for efficient particle rendering
- **Physics**: Simple cellular automata rules for sand behavior
- **Interaction**: Mouse event handlers for user input

## File Structure
```
/
├── index.html          # Main HTML file
├── style.css           # CSS styling
├── script.js           # JavaScript simulation logic
├── AGENTS.md           # This file
└── docs/              # Documentation folder
```

## Development Guidelines
- Use only vanilla web technologies (no external packages)
- Implement efficient canvas rendering for smooth animation
- Follow responsive design principles
- Ensure cross-browser compatibility

## Common Commands
- Open `index.html` in a web browser to run the simulation
- Use browser developer tools for debugging

## Implementation Details
The simulation uses a grid-based cellular automata approach where each cell can be empty or contain sand. Sand particles follow simple physics rules:
- Fall down if the cell below is empty
- Slide diagonally if directly below is blocked
- Stay in place if movement is blocked
