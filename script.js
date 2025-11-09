// Falling Sand Cellular Automata
const canvas = document.getElementById('sandCanvas');
const ctx = canvas.getContext('2d');

// Configuration
const CELL_SIZE = 3; // Grid cell size in pixels
const GRAVITY = 1; // How fast sand falls
const SAND_SPAWN_RATE = 3; // How many sand particles spawn per frame from top

// Sand colors for visual variety
const SAND_COLORS = [
    '#f4e4bc', // Light sand
    '#e8d4a0', // Medium sand
    '#d4a76a', // Golden sand
    '#c19a6b', // Sandy brown
    '#daa520', // Goldenrod
    '#cd853f', // Peru
];

// Grid dimensions
let gridWidth, gridHeight;
let grid = [];
let isMouseDown = false;
let mouseX = 0, mouseY = 0;

// Initialize canvas and grid
function init() {
    resizeCanvas();
    initGrid();
    
    // Event listeners
    window.addEventListener('resize', () => {
        resizeCanvas();
        initGrid();
    });
    
    canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        updateMousePosition(e);
    });
    
    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        updateMousePosition(e);
        if (isMouseDown) {
            spawnSandAtMouse();
        }
    });
    
    canvas.addEventListener('mouseleave', () => {
        isMouseDown = false;
    });
    
    // Touch support for mobile
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isMouseDown = true;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        mouseX = touch.clientX - rect.left;
        mouseY = touch.clientY - rect.top;
    });
    
    canvas.addEventListener('touchend', () => {
        isMouseDown = false;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (isMouseDown) {
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            mouseX = touch.clientX - rect.left;
            mouseY = touch.clientY - rect.top;
            spawnSandAtMouse();
        }
    });
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gridWidth = Math.ceil(canvas.width / CELL_SIZE);
    gridHeight = Math.ceil(canvas.height / CELL_SIZE);
}

function initGrid() {
    grid = [];
    for (let y = 0; y < gridHeight; y++) {
        grid[y] = [];
        for (let x = 0; x < gridWidth; x++) {
            grid[y][x] = null;
        }
    }
}

function updateMousePosition(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
}

function spawnSandAtMouse() {
    const gridX = Math.floor(mouseX / CELL_SIZE);
    const gridY = Math.floor(mouseY / CELL_SIZE);
    
    // Spawn sand in a small area around the mouse
    for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
            const x = gridX + dx;
            const y = gridY + dy;
            
            if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
                if (Math.random() > 0.3 && !grid[y][x]) { // 70% chance to spawn
                    grid[y][x] = {
                        color: SAND_COLORS[Math.floor(Math.random() * SAND_COLORS.length)],
                        velocity: 0
                    };
                }
            }
        }
    }
}

function spawnSandFromTop() {
    // Spawn sand from the top center of the screen
    const centerX = Math.floor(gridWidth / 2);
    const spawnWidth = 10; // Width of spawn area
    
    for (let i = 0; i < SAND_SPAWN_RATE; i++) {
        const x = centerX + Math.floor(Math.random() * spawnWidth) - Math.floor(spawnWidth / 2);
        if (x >= 0 && x < gridWidth && !grid[0][x]) {
            grid[0][x] = {
                color: SAND_COLORS[Math.floor(Math.random() * SAND_COLORS.length)],
                velocity: 0
            };
        }
    }
}

function updateSand() {
    // Update sand physics from bottom to top to avoid double processing
    for (let y = gridHeight - 2; y >= 0; y--) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x]) {
                const sand = grid[y][x];
                
                // Apply gravity
                sand.velocity = Math.min(sand.velocity + GRAVITY, 3); // Max velocity
                
                // Calculate new position
                let newY = y + Math.floor(sand.velocity);
                let newX = x;
                
                // Check if we hit the bottom
                if (newY >= gridHeight) {
                    newY = gridHeight - 1;
                    sand.velocity = 0;
                }
                
                // Check collision with other sand
                if (grid[newY][newX]) {
                    // Try to slide left or right
                    const canSlideLeft = newX > 0 && !grid[newY][newX - 1];
                    const canSlideRight = newX < gridWidth - 1 && !grid[newY][newX + 1];
                    
                    if (canSlideLeft && canSlideRight) {
                        // Randomly choose direction
                        newX += Math.random() > 0.5 ? -1 : 1;
                    } else if (canSlideLeft) {
                        newX--;
                    } else if (canSlideRight) {
                        newX++;
                    } else {
                        // Can't move, stay in place
                        newY = y;
                        sand.velocity = 0;
                    }
                }
                
                // Move sand if position changed
                if (newY !== y || newX !== x) {
                    grid[newY][newX] = sand;
                    grid[y][x] = null;
                }
            }
        }
    }
}

function render() {
    // Clear canvas with dark background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw sand particles
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x]) {
                ctx.fillStyle = grid[y][x].color;
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

function gameLoop() {
    spawnSandFromTop();
    updateSand();
    render();
    requestAnimationFrame(gameLoop);
}

// Start the simulation
init();
gameLoop();
