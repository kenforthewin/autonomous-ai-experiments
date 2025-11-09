/**
 * Test suite for the falling sand cellular automata application
 */

import fs from 'fs';
import path from 'path';

console.log('=== Falling Sand Cellular Automata - Test Suite ===\n');

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

// Test 1: Verify all files exist
console.log('1. File Existence Tests:');
assert(fs.existsSync('./index.html'), 'index.html exists');
assert(fs.existsSync('./style.css'), 'style.css exists');
assert(fs.existsSync('./script.js'), 'script.js exists');

// Test 2: Verify HTML structure
console.log('\n2. HTML Structure Tests:');
const htmlContent = fs.readFileSync('./index.html', 'utf-8');
assert(htmlContent.includes('<!DOCTYPE html>'), 'HTML5 doctype present');
assert(htmlContent.includes('<canvas id="sandCanvas"'), 'Canvas element present');
assert(htmlContent.includes('width="800"'), 'Canvas width is 800');
assert(htmlContent.includes('height="600"'), 'Canvas height is 600');
assert(htmlContent.includes('link rel="stylesheet" href="style.css"'), 'CSS file linked');
assert(htmlContent.includes('script src="script.js"'), 'JS file linked');
assert(htmlContent.includes('<title>'), 'Page has title');

// Test 3: Verify CSS content
console.log('\n3. CSS Style Tests:');
const cssContent = fs.readFileSync('./style.css', 'utf-8');
assert(cssContent.includes('background'), 'Background style present');
assert(cssContent.includes('#sandCanvas'), 'Canvas styling present');
assert(cssContent.includes('border'), 'Canvas border styling present');
assert(cssContent.includes('cursor'), 'Canvas cursor style present');

// Test 4: Verify JavaScript syntax and structure
console.log('\n4. JavaScript Structure Tests:');
const jsContent = fs.readFileSync('./script.js', 'utf-8');
assert(jsContent.includes('const canvas = document.getElementById'), 'Canvas element selection present');
assert(jsContent.includes('const ctx = canvas.getContext'), 'Canvas 2D context present');
assert(jsContent.includes('CELL_SIZE'), 'Cell size constant defined');
assert(jsContent.includes('GRID_WIDTH'), 'Grid width calculation present');
assert(jsContent.includes('GRID_HEIGHT'), 'Grid height calculation present');

// Test 5: Verify key functions exist
console.log('\n5. Function Existence Tests:');
assert(jsContent.includes('function createEmptyGrid'), 'createEmptyGrid function exists');
assert(jsContent.includes('function updateGrid'), 'updateGrid function exists');
assert(jsContent.includes('function render'), 'render function exists');
assert(jsContent.includes('function gameLoop'), 'gameLoop function exists');
assert(jsContent.includes('function spawnContinuousSand'), 'spawnContinuousSand function exists');
assert(jsContent.includes('function spawnSandAtMouse'), 'spawnSandAtMouse function exists');

// Test 6: Verify cellular automata logic
console.log('\n6. Physics Implementation Tests:');
assert(jsContent.includes('// Try to move down'), 'Sand falling logic present');
assert(jsContent.includes('// If can\'t move down'), 'Diagonal sliding logic present');
assert(jsContent.includes('Math.random()'), 'Random number generation present');
assert(jsContent.includes('initializeNextGrid'), 'Grid initialization for double buffering present');
assert(jsContent.includes('swapGrids'), 'Grid swapping for double buffering present');

// Test 7: Verify mouse interaction
console.log('\n7. Mouse Interaction Tests:');
assert(jsContent.includes('mousedown'), 'Mouse down event listener present');
assert(jsContent.includes('mousemove'), 'Mouse move event listener present');
assert(jsContent.includes('mouseup'), 'Mouse up event listener present');
assert(jsContent.includes('getBoundingClientRect'), 'Mouse coordinate calculation present');

// Test 8: Verify double buffering system
console.log('\n8. Double Buffering System Tests:');
assert(jsContent.includes('let grid ='), 'Grid variable declared');
assert(jsContent.includes('let nextGrid ='), 'NextGrid variable declared');
assert(jsContent.includes('initializeNextGrid'), 'Next grid initialization function present');
assert(jsContent.includes('setSandInNextGrid'), 'Next grid sand setting function present');
assert(jsContent.includes('isEmptyInNextGrid'), 'Next grid empty check function present');

// Test 9: Verify rendering
console.log('\n9. Rendering Tests:');
assert(jsContent.includes('ctx.fillStyle'), 'Canvas fill style setting present');
assert(jsContent.includes('ctx.fillRect'), 'Canvas rectangle drawing present');
assert(jsContent.includes('requestAnimationFrame'), 'Animation frame loop present');

// Test 10: Verify constants
console.log('\n10. Constants and Configuration Tests:');
assert(jsContent.includes('const CELL_SIZE = 4'), 'Cell size set to 4 pixels');
assert(jsContent.includes('const SAND_COLOR = \'#C2B280\''), 'Sand color is sandy tan');
assert(jsContent.includes('const EMPTY = 0'), 'Empty cell constant defined');
assert(jsContent.includes('const SAND = 1'), 'Sand cell constant defined');

// Test 11: Verify processing order
console.log('\n11. Grid Processing Order Tests:');
assert(jsContent.includes('for (let y = GRID_HEIGHT - 1; y >= 0; y--)'), 'Grid processed bottom to top');
assert(jsContent.includes('for (let x = 0; x < GRID_WIDTH; x++)'), 'Grid processed left to right');

// Test 12: File sizes (reasonable check)
console.log('\n12. File Size Tests:');
const htmlSize = fs.statSync('./index.html').size;
const cssSize = fs.statSync('./style.css').size;
const jsSize = fs.statSync('./script.js').size;

assert(htmlSize > 100, `HTML file has reasonable size (${htmlSize} bytes)`);
assert(cssSize > 100, `CSS file has reasonable size (${cssSize} bytes)`);
assert(jsSize > 1000, `JavaScript file has substantial size (${jsSize} bytes)`);

// Summary
console.log('\n=== Test Summary ===');
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);
console.log(`Total Tests: ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
    console.log('\n✓ All tests passed! The application should be ready to use.');
    process.exit(0);
} else {
    console.log('\n✗ Some tests failed. Please review the application.');
    process.exit(1);
}

