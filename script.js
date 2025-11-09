// Falling Sand Cellular Automata Implementation

// Canvas setup
const canvas = document.getElementById('sandCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions to match viewport
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Initialize canvas size
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Grid system
const CELL_SIZE = 5; // Each cell is 5x5 pixels
let gridWidth = Math.floor(canvas.width / CELL_SIZE);
let gridHeight = Math.floor(canvas.height / CELL_SIZE);
let grid = [];
let nextGrid = [];

// Sand particle constants
const EMPTY = 0;
const SAND = 1;

// Colors
const SAND_COLOR = '#e6c229';
const BACKGROUND_COLOR = '#000000';

// Initialize grids
function initGrids() {
    grid = [];
    nextGrid = [];
    
    for (let y = 0; y < gridHeight; y++) {
        grid[y] = [];
        nextGrid[y] = [];
        for (let x = 0; x < gridWidth; x++) {
            grid[y][x] = EMPTY;
            nextGrid[y][x] = EMPTY;
        }
    }
}

// Convert screen coordinates to grid coordinates
function screenToGrid(x, y) {
    return {
        x: Math.floor(x / CELL_SIZE),
        y: Math.floor(y / CELL_SIZE)
    };
}

// Add sand at a specific grid position
function addSand(x, y) {
    if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
        grid[y][x] = SAND;
    }
}

// Add sand particles around a position to create a small cluster
function addSandCluster(screenX, screenY) {
    const gridPos = screenToGrid(screenX, screenY);
    
    // Add a 3x3 cluster of sand particles
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            addSand(gridPos.x + dx, gridPos.y + dy);
        }
    }
}

// Mouse interaction
canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Left mouse button
        addSandCluster(e.clientX, e.clientY);
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (e.buttons === 1) { // Left mouse button held down
        addSandCluster(e.clientX, e.clientY);
    }
});

// Physics update
function updatePhysics() {
    // Process grid from bottom to top for realistic falling behavior
    for (let y = gridHeight - 2; y >= 0; y--) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x] === SAND) {
                // Try to move sand down
                if (grid[y + 1][x] === EMPTY) {
                    grid[y][x] = EMPTY;
                    grid[y + 1][x] = SAND;
                } 
                // Try to move diagonally down-left or down-right
                else {
                    const canMoveLeft = x > 0 && grid[y + 1][x - 1] === EMPTY;
                    const canMoveRight = x < gridWidth - 1 && grid[y + 1][x + 1] === EMPTY;
                    
                    if (canMoveLeft && canMoveRight) {
                        // Randomly choose direction to avoid bias
                        if (Math.random() < 0.5) {
                            grid[y][x] = EMPTY;
                            grid[y + 1][x - 1] = SAND;
                        } else {
                            grid[y][x] = EMPTY;
                            grid[y + 1][x + 1] = SAND;
                        }
                    } else if (canMoveLeft) {
                        grid[y][x] = EMPTY;
                        grid[y + 1][x - 1] = SAND;
                    } else if (canMoveRight) {
                        grid[y][x] = EMPTY;
                        grid[y + 1][x + 1] = SAND;
                    }
                    // If cannot move, sand stays in place
                }
            }
        }
    }
}

// Continuous sand generation
function generateSand() {
    const centerX = Math.floor(gridWidth / 2);
    // Generate sand in a small area at the top center
    for (let i = -2; i <= 2; i++) {
        if (centerX + i >= 0 && centerX + i < gridWidth) {
            if (grid[0][centerX + i] === EMPTY) {
                grid[0][centerX + i] = SAND;
            }
        }
    }
}

// Render the grid to canvas
function render() {
    // Clear canvas
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw sand particles
    ctx.fillStyle = SAND_COLOR;
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x] === SAND) {
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

// Animation loop
let lastSandGeneration = 0;
const SAND_GENERATION_INTERVAL = 100; // milliseconds

function animate(timestamp) {
    // Update physics
    updatePhysics();
    
    // Generate sand periodically from top center
    if (timestamp - lastSandGeneration > SAND_GENERATION_INTERVAL) {
        generateSand();
        lastSandGeneration = timestamp;
    }
    
    // Render
    render();
    
    // Continue animation loop
    requestAnimationFrame(animate);
}

// Initialize and start simulation
initGrids();
requestAnimationFrame(animate);
