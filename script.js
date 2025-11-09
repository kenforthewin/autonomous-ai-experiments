// Get canvas and context
const canvas = document.getElementById('sandCanvas');
const ctx = canvas.getContext('2d');

// Constants
const CELL_SIZE = 4;
const SAND_COLOR = '#C2B280';
const EMPTY = 0;
const SAND = 1;

// Grid dimensions
const GRID_WIDTH = Math.floor(canvas.width / CELL_SIZE);
const GRID_HEIGHT = Math.floor(canvas.height / CELL_SIZE);

// Create two grids for double buffering
let grid = createEmptyGrid();
let nextGrid = createEmptyGrid();

// Simulation state
let frameCount = 0;
let mouseDown = false;
let mouseX = 0;
let mouseY = 0;

/**
 * Create an empty grid
 */
function createEmptyGrid() {
    const newGrid = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
        newGrid[y] = [];
        for (let x = 0; x < GRID_WIDTH; x++) {
            newGrid[y][x] = EMPTY;
        }
    }
    return newGrid;
}

/**
 * Initialize next grid as a copy of current grid
 */
function initializeNextGrid() {
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            nextGrid[y][x] = grid[y][x];
        }
    }
}

/**
 * Swap grids for next frame
 */
function swapGrids() {
    const temp = grid;
    grid = nextGrid;
    nextGrid = temp;
}

/**
 * Add sand at a specific grid position
 */
function addSandAt(gridX, gridY) {
    if (gridX >= 0 && gridX < GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT) {
        grid[gridY][gridX] = SAND;
    }
}

/**
 * Set sand at next grid position
 */
function setSandInNextGrid(gridX, gridY) {
    if (gridX >= 0 && gridX < GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT) {
        nextGrid[gridY][gridX] = SAND;
    }
}

/**
 * Check if a cell is empty in the next grid
 */
function isEmptyInNextGrid(gridX, gridY) {
    if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) {
        return false;
    }
    return nextGrid[gridY][gridX] === EMPTY;
}

/**
 * Apply cellular automata rules
 */
function updateGrid() {
    initializeNextGrid();

    // Process grid from bottom to top for natural falling behavior
    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (grid[y][x] === SAND) {
                let moved = false;

                // Try to move down
                if (y + 1 < GRID_HEIGHT) {
                    if (isEmptyInNextGrid(x, y + 1)) {
                        setSandInNextGrid(x, y + 1);
                        nextGrid[y][x] = EMPTY;
                        moved = true;
                    }
                }

                // If can't move down, try to slide diagonally
                if (!moved && y + 1 < GRID_HEIGHT) {
                    // Randomly choose left or right
                    if (Math.random() < 0.5) {
                        // Try left first, then right
                        if (isEmptyInNextGrid(x - 1, y + 1)) {
                            setSandInNextGrid(x - 1, y + 1);
                            nextGrid[y][x] = EMPTY;
                            moved = true;
                        } else if (isEmptyInNextGrid(x + 1, y + 1)) {
                            setSandInNextGrid(x + 1, y + 1);
                            nextGrid[y][x] = EMPTY;
                            moved = true;
                        }
                    } else {
                        // Try right first, then left
                        if (isEmptyInNextGrid(x + 1, y + 1)) {
                            setSandInNextGrid(x + 1, y + 1);
                            nextGrid[y][x] = EMPTY;
                            moved = true;
                        } else if (isEmptyInNextGrid(x - 1, y + 1)) {
                            setSandInNextGrid(x - 1, y + 1);
                            nextGrid[y][x] = EMPTY;
                            moved = true;
                        }
                    }
                }

                // Sand stays in place if it couldn't move
            }
        }
    }

    swapGrids();
}

/**
 * Render the grid to canvas
 */
function render() {
    // Clear canvas with black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw sand particles
    ctx.fillStyle = SAND_COLOR;
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (grid[y][x] === SAND) {
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

/**
 * Spawn sand at top center continuously
 */
function spawnContinuousSand() {
    const centerX = Math.floor(GRID_WIDTH / 2);
    
    // Spawn sand at top center every frame (creates a continuous stream)
    for (let i = -1; i <= 1; i++) {
        if (centerX + i >= 0 && centerX + i < GRID_WIDTH) {
            addSandAt(centerX + i, 0);
        }
    }
}

/**
 * Spawn sand at mouse cursor
 */
function spawnSandAtMouse(canvasX, canvasY) {
    const gridX = Math.floor(canvasX / CELL_SIZE);
    const gridY = Math.floor(canvasY / CELL_SIZE);

    // Spawn a small cluster of sand at mouse position
    const radius = 2;
    for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
            const x = gridX + dx;
            const y = gridY + dy;
            if (Math.random() < 0.7) {
                addSandAt(x, y);
            }
        }
    }
}

/**
 * Main game loop
 */
function gameLoop() {
    // Spawn continuous sand at top center
    spawnContinuousSand();

    // Spawn sand at mouse if pressed
    if (mouseDown) {
        spawnSandAtMouse(mouseX, mouseY);
    }

    // Update physics
    updateGrid();

    // Render
    render();

    // Continue loop
    frameCount++;
    requestAnimationFrame(gameLoop);
}

/**
 * Mouse event handlers
 */
document.addEventListener('mousedown', (event) => {
    mouseDown = true;
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
});

document.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
});

document.addEventListener('mouseup', () => {
    mouseDown = false;
});

// Start the game loop
gameLoop();

