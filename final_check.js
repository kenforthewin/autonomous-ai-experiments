import fs from 'fs';
import { execSync } from 'child_process';

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║   FALLING SAND CELLULAR AUTOMATA - FINAL VERIFICATION   ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

let allPass = true;

// Check 1: Files exist
console.log('✓ File Structure:');
const files = ['index.html', 'style.css', 'script.js'];
files.forEach(f => {
    if (fs.existsSync(f)) {
        const size = fs.statSync(f).size;
        console.log(`  ✓ ${f} (${size} bytes)`);
    } else {
        console.log(`  ✗ ${f} missing`);
        allPass = false;
    }
});

// Check 2: File contents
console.log('\n✓ Core Implementation:');
const html = fs.readFileSync('index.html', 'utf-8');
const css = fs.readFileSync('style.css', 'utf-8');
const js = fs.readFileSync('script.js', 'utf-8');

const checks = [
    [html.includes('<!DOCTYPE html>'), 'HTML5 doctype'],
    [html.includes('<canvas id="sandCanvas"'), 'Canvas element'],
    [html.includes('width="800"'), 'Canvas width 800px'],
    [html.includes('height="600"'), 'Canvas height 600px'],
    [css.includes('#sandCanvas'), 'Canvas styling'],
    [css.includes('background'), 'Background styling'],
    [js.includes('CELL_SIZE = 4'), 'Cell size 4px'],
    [js.includes('SAND_COLOR = \'#C2B280\''), 'Sand color'],
    [js.includes('function updateGrid'), 'Physics function'],
    [js.includes('requestAnimationFrame'), 'Animation loop'],
    [js.includes('mousedown'), 'Mouse interaction'],
    [js.includes('double buffering') || (js.includes('let grid') && js.includes('let nextGrid')), 'Double buffering'],
];

checks.forEach(([check, name]) => {
    if (check) {
        console.log(`  ✓ ${name}`);
    } else {
        console.log(`  ✗ ${name}`);
        allPass = false;
    }
});

// Check 3: Server accessibility
console.log('\n✓ Server Accessibility:');
try {
    const response = execSync('curl -s http://localhost:8000/index.html | head -1', { timeout: 5000 }).toString();
    if (response.includes('DOCTYPE')) {
        console.log('  ✓ HTTP server responding on localhost:8000');
        console.log('  ✓ HTML file is accessible');
    } else {
        console.log('  ✗ Server not responding correctly');
        allPass = false;
    }
} catch (e) {
    console.log('  ✗ HTTP server not accessible');
    allPass = false;
}

// Check 4: Code metrics
console.log('\n✓ Code Metrics:');
const htmlLines = html.split('\n').length;
const cssLines = css.split('\n').length;
const jsLines = js.split('\n').length;
const totalLines = htmlLines + cssLines + jsLines;

console.log(`  ✓ HTML: ${htmlLines} lines`);
console.log(`  ✓ CSS: ${cssLines} lines`);
console.log(`  ✓ JavaScript: ${jsLines} lines`);
console.log(`  ✓ Total: ${totalLines} lines`);

// Final result
console.log('\n' + '═'.repeat(61));
if (allPass) {
    console.log('✓ ALL CHECKS PASSED - APPLICATION READY TO USE');
} else {
    console.log('✗ SOME CHECKS FAILED - REVIEW NEEDED');
}
console.log('═'.repeat(61) + '\n');

// Usage instructions
console.log('HOW TO USE:');
console.log('1. Open http://localhost:8000/index.html in your browser');
console.log('2. Watch sand continuously fall from the top center');
console.log('3. Click anywhere on the canvas to spawn more sand');
console.log('4. Click and drag to paint with sand\n');

process.exit(allPass ? 0 : 1);
