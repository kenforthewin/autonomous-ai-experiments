// Canvas and context setup
const canvas = document.getElementById('sandCanvas');
const ctx = canvas.getContext('2d');

// Grid configuration
const CELL_SIZE = 4;
let GRID_WIDTH, GRID_HEIGHT;
let grid = [];

// Colors
const SAND_COLOR = '#f4d03f';
const EMPTY_COLOR = '#0a0a0a';

// Mouse tracking
let mouseX = 0;
let mouseY = 0;
let isMouseDown = false;

// Performance tracking
let lastTime = 0;
let fps = 0;
let frameCount = 0;
let fpsInterval = 0;

// Initialize canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    GRID_WIDTH = Math.floor(canvas.width / CELL_SIZE);
    GRID_HEIGHT = Math.floor(canvas.height / CELL_SIZE);
    initGrid();
}

// Initialize grid
function initGrid() {
    grid = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
        grid[y] = [];
        for (let x = 0; x < GRID_WIDTH; x++) {
            grid[y][x] = 0; // 0 = empty, 1 = sand
        }
    }
}

// Sand generation from top center
function generateSand() {
    const centerX = Math.floor(GRID_WIDTH / 2);
    const spread = 5; // Width of sand generation area
    
    for (let i = -spread; i <= spread; i++) {
        const x = centerX + i;
        if (x >= 0 && x < GRID_WIDTH && Math.random() > 0.3) {
            if (grid[0][x] === 0) {
                grid[0][x] = 1;
            }
        }
    }
}

// Physics update for sand particles
function updatePhysics() {
    // Process from bottom to top for proper falling behavior
    for (let y = GRID_HEIGHT - 2; y >= 0; y--) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (grid[y][x] === 1) { // If cell contains sand
                // Try to fall straight down
                if (y + 1 < GRID_HEIGHT && grid[y + 1][x] === 0) {
                    grid[y + 1][x] = 1;
                    grid[y][x] = 0;
                }
                // Try to fall diagonally left
                else if (y + 1 < GRID_HEIGHT && x - 1 >= 0 && grid[y + 1][x - 1] === 0) {
                    grid[y + 1][x - 1] = 1;
                    grid[y][x] = 0;
                }
                // Try to fall diagonally right
                else if (y + 1 < GRID_HEIGHT && x + 1 < GRID_WIDTH && grid[y + 1][x + 1] === 0) {
                    grid[y + 1][x + 1] = 1;
                    grid[y][x] = 0;
                }
            }
        }
    }
}

// Render the grid to canvas
function render() {
    // Clear canvas
    ctx.fillStyle = EMPTY_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw sand particles
    ctx.fillStyle = SAND_COLOR;
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (grid[y][x] === 1) {
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

// Add sand at mouse position
function addSandAtMouse(x, y) {
    const gridX = Math.floor(x / CELL_SIZE);
    const gridY = Math.floor(y / CELL_SIZE);
    const radius = 3; // Radius of sand spawn area
    
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= radius && Math.random() > 0.2) {
                const gx = gridX + dx;
                const gy = gridY + dy;
                if (gx >= 0 && gx < GRID_WIDTH && gy >= 0 && gy < GRID_HEIGHT) {
                    grid[gy][gx] = 1;
                }
            }
        }
    }
}

// Animation loop
function animate(currentTime) {
    // Calculate FPS
    frameCount++;
    if (currentTime - fpsInterval > 1000) {
        fps = frameCount;
        frameCount = 0;
        fpsInterval = currentTime;
    }
    
    // Generate new sand periodically
    if (Math.random() > 0.7) {
        generateSand();
    }
    
    // Update physics
    updatePhysics();
    
    // Render
    render();
    
    // Add sand at mouse if pressed
    if (isMouseDown) {
        addSandAtMouse(mouseX, mouseY);
    }
    
    requestAnimationFrame(animate);
}

// Mouse event handlers
canvas.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    mouseX = e.clientX;
    mouseY = e.clientY;
});

canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
});

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

canvas.addEventListener('mouseleave', () => {
    isMouseDown = false;
});

// Touch support for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isMouseDown = true;
    const touch = e.touches[0];
    mouseX = touch.clientX;
    mouseY = touch.clientY;
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    isMouseDown = false;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    mouseX = touch.clientX;
    mouseY = touch.clientY;
});

// Window resize handler
window.addEventListener('resize', resizeCanvas);

// Initialize and start
resizeCanvas();
requestAnimationFrame(animate);
