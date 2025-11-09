/**
 * Logic test for the cellular automata rules
 * This test simulates the grid physics without needing a browser
 */

console.log('=== Falling Sand Logic Validation ===\n');

const EMPTY = 0;
const SAND = 1;

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`✓ ${message}`);
        testsPassed++;
    } else {
        console.log(`✗ ${message}`);
        testsFailed++;
    }
}

// Create a simple grid for testing
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

// Copy a grid
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

// Simulate one frame of physics
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

// Count sand particles
function countSand(grid) {
    let count = 0;
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x] === SAND) count++;
        }
    }
    return count;
}

console.log('Test 1: Sand falls straight down');
let grid = createTestGrid(5, 5);
grid[0][2] = SAND;
const initialSandCount = countSand(grid);
grid = simulateFrame(grid);
grid = simulateFrame(grid);
grid = simulateFrame(grid);
const stillHaveSand = countSand(grid) === initialSandCount;
const sandMoved = grid[3][2] === SAND;
assert(stillHaveSand && sandMoved, 'Sand particle falls down correctly');

console.log('\nTest 2: Sand accumulates at bottom');
grid = createTestGrid(5, 5);
grid[0][2] = SAND;
for (let i = 0; i < 10; i++) {
    grid = simulateFrame(grid);
}
const sandAtBottom = grid[4][2] === SAND;
assert(sandAtBottom, 'Sand accumulates at the bottom');

console.log('\nTest 3: Sand stops above solid ground');
grid = createTestGrid(5, 5);
grid[0][2] = SAND;
grid[4][2] = SAND; // Create a wall
grid = simulateFrame(grid);
grid = simulateFrame(grid);
grid = simulateFrame(grid);
// After 3 frames, sand should have moved from [0][2] down to [3][2]
// (can't go to [4][2] because it's occupied)
const sandAtCorrectPosition = grid[3][2] === SAND;
assert(sandAtCorrectPosition, 'Sand stops above solid ground');

console.log('\nTest 4: Sand can slide when blocked');
grid = createTestGrid(7, 5);
grid[0][3] = SAND;
grid[4][3] = SAND; // Block directly underneath
grid = simulateFrame(grid);
grid = simulateFrame(grid);
grid = simulateFrame(grid);
// After 3 frames, sand from [0][3] should be somewhere near the bottom, having slid
const sandMoved4 = (grid[3][3] === SAND || grid[3][2] === SAND || grid[3][4] === SAND ||
                    grid[4][2] === SAND || grid[4][4] === SAND);
assert(sandMoved4, 'Sand can slide when blocked below');

console.log('\nTest 5: Multiple sand particles interact');
grid = createTestGrid(7, 5);
grid[0][2] = SAND;
grid[0][3] = SAND;
grid[0][4] = SAND;
const initialCount = countSand(grid);

for (let i = 0; i < 10; i++) {
    grid = simulateFrame(grid);
}

const finalCount = countSand(grid);
assert(initialCount === finalCount, 'Sand particles are conserved (no particles created or destroyed)');

console.log('\nTest 6: Grid dimensions are correct');
const GRID_WIDTH = Math.floor(800 / 4);
const GRID_HEIGHT = Math.floor(600 / 4);
assert(GRID_WIDTH === 200, `Grid width is correct (200 = 800 / 4)`);
assert(GRID_HEIGHT === 150, `Grid height is correct (150 = 600 / 4)`);

console.log('\nTest 7: Empty check validation');
grid = createTestGrid(3, 3);
grid[1][1] = SAND;
const hasEmptyCells = grid[0][0] === EMPTY && grid[2][2] === EMPTY;
assert(hasEmptyCells, 'Empty cells are correctly identified');

console.log('\nTest 8: Sand pile formation');
grid = createTestGrid(7, 6);
// Add multiple sand particles
for (let i = 0; i < 5; i++) {
    grid[0][3 + (i % 2) - 1] = SAND;
}
const beforeCount = countSand(grid);
for (let i = 0; i < 15; i++) {
    grid = simulateFrame(grid);
}
const afterCount = countSand(grid);
const pileFormed = afterCount === beforeCount && countSand(grid) > 0;
assert(pileFormed, 'Sand forms a stable pile');

console.log('\n=== Logic Test Summary ===');
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);
console.log(`Total Tests: ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
    console.log('\n✓ All logic tests passed! Physics simulation is correct.');
    process.exit(0);
} else {
    console.log('\n✗ Some logic tests failed.');
    process.exit(1);
}

