// Falling Sand Cellular Automata Simulation

// Configuration
const CELL_SIZE = 4; // Size of each cell in pixels (4-8 recommended)
const SAND_COLOR = '#C2B280'; // Golden/tan color for sand
const EMPTY_COLOR = '#0d0d0d'; // Dark background color
const SPAWN_RATE = 5; // Number of sand particles to spawn per frame
const GRAVITY_SPEED = 1; // How many pixels sand falls per frame

// Get canvas and context
const canvas = document.getElementById('sandCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas to fill the window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Calculate grid dimensions
let gridWidth = Math.ceil(canvas.width / CELL_SIZE);
let gridHeight = Math.ceil(canvas.height / CELL_SIZE);

// Initialize the grid (0 = empty, 1 = sand)
let grid = createEmptyGrid();

function createEmptyGrid() {
    return Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(0));
}

// Update grid dimensions on resize
window.addEventListener('resize', () => {
    gridWidth = Math.ceil(canvas.width / CELL_SIZE);
    gridHeight = Math.ceil(canvas.height / CELL_SIZE);
    grid = createEmptyGrid();
});

// Convert pixel coordinates to grid coordinates
function pixelToGrid(pixelX, pixelY) {
    return {
        x: Math.floor(pixelX / CELL_SIZE),
        y: Math.floor(pixelY / CELL_SIZE)
    };
}

// Check if grid position is valid and empty
function isValidAndEmpty(x, y) {
    if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) {
        return false;
    }
    return grid[y][x] === 0;
}

// Check if grid position is valid
function isValid(x, y) {
    return x >= 0 && x < gridWidth && y >= 0 && y < gridHeight;
}

// Spawn sand at a specific grid position
function spawnSandAtGrid(gridX, gridY, radius = 1) {
    for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
            const x = gridX + dx;
            const y = gridY + dy;
            if (isValid(x, y) && Math.random() < 0.7) {
                grid[y][x] = 1;
            }
        }
    }
}

// Spawn sand from the top center continuously
function spawnFromTop() {
    const centerX = Math.floor(gridWidth / 2);
    const spawnX = centerX + Math.floor((Math.random() - 0.5) * 3); // Small variation
    
    for (let i = 0; i < SPAWN_RATE; i++) {
        const x = spawnX + Math.floor((Math.random() - 0.5) * 2);
        if (isValid(x, 0)) {
            grid[0][x] = 1;
        }
    }
}

// Update the cellular automata for one frame
function updateSimulation() {
    // Create a new grid for this frame
    const newGrid = createEmptyGrid();
    
    // Iterate through cells from bottom to top (important for gravity)
    for (let y = gridHeight - 1; y >= 0; y--) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x] === 1) {
                // Sand particle found, apply physics
                let settled = false;
                
                // Try to fall straight down
                if (y + 1 < gridHeight) {
                    if (grid[y + 1][x] === 0 && newGrid[y + 1][x] === 0) {
                        // Space below is empty, sand falls
                        newGrid[y + 1][x] = 1;
                        settled = true;
                    }
                } else {
                    // Bottom boundary - sand settles here
                    settled = true;
                }
                
                // If can't fall straight down, try diagonal
                if (!settled && y + 1 < gridHeight) {
                    const leftDiag = Math.random() < 0.5; // Randomly choose left or right
                    
                    if (leftDiag) {
                        // Try left diagonal first
                        if (x - 1 >= 0 && grid[y + 1][x - 1] === 0 && newGrid[y + 1][x - 1] === 0) {
                            newGrid[y + 1][x - 1] = 1;
                            settled = true;
                        } else if (x + 1 < gridWidth && grid[y + 1][x + 1] === 0 && newGrid[y + 1][x + 1] === 0) {
                            // Try right diagonal
                            newGrid[y + 1][x + 1] = 1;
                            settled = true;
                        }
                    } else {
                        // Try right diagonal first
                        if (x + 1 < gridWidth && grid[y + 1][x + 1] === 0 && newGrid[y + 1][x + 1] === 0) {
                            newGrid[y + 1][x + 1] = 1;
                            settled = true;
                        } else if (x - 1 >= 0 && grid[y + 1][x - 1] === 0 && newGrid[y + 1][x - 1] === 0) {
                            // Try left diagonal
                            newGrid[y + 1][x - 1] = 1;
                            settled = true;
                        }
                    }
                }
                
                // If still can't fall, keep at current position (settle)
                if (!settled) {
                    newGrid[y][x] = 1;
                }
            }
        }
    }
    
    grid = newGrid;
}

// Render the grid to the canvas
function render() {
    // Clear canvas with background color
    ctx.fillStyle = EMPTY_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw sand particles
    ctx.fillStyle = SAND_COLOR;
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x] === 1) {
                const pixelX = x * CELL_SIZE;
                const pixelY = y * CELL_SIZE;
                ctx.fillRect(pixelX, pixelY, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

// Mouse click handler for spawning sand at cursor
function handleMouseClick(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const gridPos = pixelToGrid(mouseX, mouseY);
    
    // Spawn sand in a small radius around click position
    spawnSandAtGrid(gridPos.x, gridPos.y, 2);
}

canvas.addEventListener('click', handleMouseClick);

// Animation loop
function animate() {
    // Spawn sand from top center
    spawnFromTop();
    
    // Update simulation
    updateSimulation();
    
    // Render
    render();
    
    // Continue animation loop
    requestAnimationFrame(animate);
}

// Start the animation loop
animate();

