const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const cellSize = 4;
let grid, gridWidth, gridHeight;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initGrid();
}

function initGrid() {
    gridWidth = Math.ceil(canvas.width / cellSize);
    gridHeight = Math.ceil(canvas.height / cellSize);
    grid = new Array(gridHeight).fill().map(() => new Array(gridWidth).fill(0));
}

resizeCanvas();

window.addEventListener('resize', resizeCanvas);

function animate() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add sand at top center if empty
    const centerX = Math.floor(gridWidth / 2);
    if (grid[0][centerX] === 0) grid[0][centerX] = 1;

    // Update grid from bottom to top
    for (let y = gridHeight - 2; y >= 0; y--) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x] === 1) {
                if (grid[y + 1][x] === 0) {
                    grid[y + 1][x] = 1;
                    grid[y][x] = 0;
                } else {
                    const left = x - 1 >= 0 && grid[y + 1][x - 1] === 0;
                    const right = x + 1 < gridWidth && grid[y + 1][x + 1] === 0;
                    if (left && right) {
                        if (Math.random() < 0.5) {
                            grid[y + 1][x - 1] = 1;
                        } else {
                            grid[y + 1][x + 1] = 1;
                        }
                        grid[y][x] = 0;
                    } else if (left) {
                        grid[y + 1][x - 1] = 1;
                        grid[y][x] = 0;
                    } else if (right) {
                        grid[y + 1][x + 1] = 1;
                        grid[y][x] = 0;
                    }
                }
            }
        }
    }

    // Render
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x] === 1) {
                ctx.fillStyle = '#C2B280';
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }

    requestAnimationFrame(animate);
}

animate();
