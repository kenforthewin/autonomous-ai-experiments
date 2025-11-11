// Configuration constants
const CELL_SIZE = 5;
const SAND_COLOR = '#c2b280';
const BACKGROUND_COLOR = '#000000';
const SPAWN_RATE = 2; // Spawn sand every N frames

// Global variables
let canvas, ctx, cols, rows, grid;
let frameCounter = 0;

// Initialize function
function init() {
    // Get canvas and 2D context
    canvas = document.getElementById('sandCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size to 800x600px
    canvas.width = 800;
    canvas.height = 600;
    
    // Calculate grid dimensions
    cols = Math.floor(canvas.width / CELL_SIZE);
    rows = Math.floor(canvas.height / CELL_SIZE);
    
    // Create 2D grid array filled with zeros
    grid = createGrid(cols, rows);
    
    // Add event listeners
    canvas.addEventListener('click', handleClick);
    
    // Start animation loop
    animate();
}

// Create 2D array filled with zeros
function createGrid(cols, rows) {
    const newGrid = [];
    for (let x = 0; x < cols; x++) {
        newGrid[x] = [];
        for (let y = 0; y < rows; y++) {
            newGrid[x][y] = 0;
        }
    }
    return newGrid;
}

// Check if position is valid and within grid bounds
function isValidPosition(x, y) {
    return x >= 0 && x < cols && y >= 0 && y < rows;
}

// Check if a cell is empty (value is 0)
function isEmpty(x, y) {
    if (!isValidPosition(x, y)) {
        return false;
    }
    return grid[x][y] === 0;
}

// Add sand at grid position
function addSand(x, y) {
    if (isValidPosition(x, y)) {
        grid[x][y] = 1;
    }
}

// Update physics - process grid bottom-to-top
function updateGrid() {
    // Create a new grid to track movements
    const newGrid = createGrid(cols, rows);
    
    // Copy existing grid
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            newGrid[x][y] = grid[x][y];
        }
    }
    
    // Process from bottom to top (y increases downward)
    for (let y = rows - 1; y >= 0; y--) {
        for (let x = 0; x < cols; x++) {
            if (newGrid[x][y] === 1) {
                // Sand particle found
                let moved = false;
                
                // Check if cell directly below is empty
                if (isEmpty(x, y + 1)) {
                    newGrid[x][y] = 0;
                    newGrid[x][y + 1] = 1;
                    moved = true;
                } else {
                    // Check diagonal left-down
                    if (isEmpty(x - 1, y + 1)) {
                        newGrid[x][y] = 0;
                        newGrid[x - 1][y + 1] = 1;
                        moved = true;
                    } else {
                        // Check diagonal right-down
                        if (isEmpty(x + 1, y + 1)) {
                            newGrid[x][y] = 0;
                            newGrid[x + 1][y + 1] = 1;
                            moved = true;
                        }
                    }
                }
                // If not moved, sand stays in place (settled)
            }
        }
    }
    
    grid = newGrid;
}

// Render current state
function render() {
    // Clear canvas with background color
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw sand particles
    ctx.fillStyle = SAND_COLOR;
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            if (grid[x][y] === 1) {
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

// Convert mouse coordinates to grid coordinates
function getGridCoords(mouseX, mouseY) {
    const rect = canvas.getBoundingClientRect();
    const canvasX = mouseX - rect.left;
    const canvasY = mouseY - rect.top;
    
    const gridX = Math.floor(canvasX / CELL_SIZE);
    const gridY = Math.floor(canvasY / CELL_SIZE);
    
    return { x: gridX, y: gridY };
}

// Mouse click handler - spawn 3x3 cluster of sand
function handleClick(event) {
    const coords = getGridCoords(event.clientX, event.clientY);
    
    // Spawn a 3x3 cluster of sand particles
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            addSand(coords.x + dx, coords.y + dy);
        }
    }
}

// Main animation loop
function animate() {
    frameCounter++;
    
    // Auto-spawn sand from top center every SPAWN_RATE frames
    if (frameCounter % SPAWN_RATE === 0) {
        const centerX = Math.floor(cols / 2);
        addSand(centerX, 0);
    }
    
    // Update physics and render
    updateGrid();
    render();
    
    // Schedule next frame
    requestAnimationFrame(animate);
}

// Start on page load
window.addEventListener('load', init);

