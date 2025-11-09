/**
 * Debug logic tests
 */

const EMPTY = 0;
const SAND = 1;

function createTestGrid(width, height) {
    const grid = [];
    for (let y = 0; y < height; y++) {
        grid[y] = [];
        for (let x = 0; x < width; x++) {
            grid[y][x] = EMPTY;
        }
    }
    return grid;
}

function copyGrid(grid) {
    const newGrid = [];
    for (let y = 0; y < grid.length; y++) {
        newGrid[y] = [];
        for (let x = 0; x < grid[y].length; x++) {
            newGrid[y][x] = grid[y][x];
        }
    }
    return newGrid;
}

function simulateFrame(grid) {
    const nextGrid = copyGrid(grid);
    const height = grid.length;
    const width = grid[0].length;

    // Process from bottom to top
    for (let y = height - 1; y >= 0; y--) {
        for (let x = 0; x < width; x++) {
            if (grid[y][x] === SAND) {
                let moved = false;

                // Try to move down
                if (y + 1 < height && nextGrid[y + 1][x] === EMPTY) {
                    nextGrid[y + 1][x] = SAND;
                    nextGrid[y][x] = EMPTY;
                    moved = true;
                }

                // Try to slide diagonally if can't move down
                if (!moved && y + 1 < height) {
                    const tryLeft = Math.random() < 0.5;
                    if (tryLeft) {
                        if (x - 1 >= 0 && nextGrid[y + 1][x - 1] === EMPTY) {
                            nextGrid[y + 1][x - 1] = SAND;
                            nextGrid[y][x] = EMPTY;
                            moved = true;
                        } else if (x + 1 < width && nextGrid[y + 1][x + 1] === EMPTY) {
                            nextGrid[y + 1][x + 1] = SAND;
                            nextGrid[y][x] = EMPTY;
                            moved = true;
                        }
                    } else {
                        if (x + 1 < width && nextGrid[y + 1][x + 1] === EMPTY) {
                            nextGrid[y + 1][x + 1] = SAND;
                            nextGrid[y][x] = EMPTY;
                            moved = true;
                        } else if (x - 1 >= 0 && nextGrid[y + 1][x - 1] === EMPTY) {
                            nextGrid[y + 1][x - 1] = SAND;
                            nextGrid[y][x] = EMPTY;
                            moved = true;
                        }
                    }
                }
            }
        }
    }

    return nextGrid;
}

function printGrid(grid) {
    for (let y = 0; y < grid.length; y++) {
        let row = '';
        for (let x = 0; x < grid[y].length; x++) {
            row += grid[y][x] === SAND ? 'S' : '.';
        }
        console.log(row);
    }
    console.log('');
}

console.log('Test 3 Debug: Sand doesn\'t fall through solid ground');
let grid = createTestGrid(5, 5);
grid[0][2] = SAND;
grid[4][2] = SAND; // Create a wall
grid[4][3] = SAND;
console.log('Initial grid:');
printGrid(grid);

for (let i = 0; i < 5; i++) {
    grid = simulateFrame(grid);
    console.log(`After frame ${i + 1}:`);
    printGrid(grid);
}

console.log('\nTest 4 Debug: Sand particle slides diagonally');
grid = createTestGrid(7, 5);
grid[0][3] = SAND;
grid[4][2] = SAND; // Block underneath
grid[4][3] = SAND; // Block underneath
console.log('Initial grid:');
printGrid(grid);

for (let i = 0; i < 6; i++) {
    grid = simulateFrame(grid);
    console.log(`After frame ${i + 1}:`);
    printGrid(grid);
}

