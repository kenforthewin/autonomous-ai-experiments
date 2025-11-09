/* main.js - Falling sand cellular automata (vanilla JS)
   - Grid is a Uint8Array with 0=empty, 1=sand
   - Scans bottom-to-top, left-to-right so each particle moves at most once per frame
   - Handles high DPI, window resize, mouse drawing, and a top-center spawner
*/

// --- Config constants ---
const CELL_SIZE = 4; // pixels per cell (in CSS pixels)
const SAND = 1;
const EMPTY = 0;
const BG_COLOR = '#111';
const SAND_COLOR = '#c2b280';
const SPAWN_MIN = 2; // min particles spawned per frame at top center
const SPAWN_MAX = 6; // max particles spawned per frame at top center
const SPAWN_SPREAD = 2; // horizontal spread in cells from center
const BRUSH_RADIUS = 2; // brush radius in cells for mouse drawing

// --- Canvas and grid state ---
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let devicePixelRatio = window.devicePixelRatio || 1;
let width = 0; // grid width in cells
let height = 0; // grid height in cells
let grid = null; // Uint8Array(width * height)

// Mouse drawing state
let drawing = false;
let mouseX = 0;
let mouseY = 0;

// Helper: convert 2D coords to 1D index
// index = y * width + x
function idx(x, y){
  return y * width + x;
}

// Initialize or reset the grid and canvas size based on window size and devicePixelRatio
function resize(){
  devicePixelRatio = window.devicePixelRatio || 1;
  // Canvas size in device pixels
  const cssW = Math.max(1, window.innerWidth);
  const cssH = Math.max(1, window.innerHeight);
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  canvas.width = Math.floor(cssW * devicePixelRatio);
  canvas.height = Math.floor(cssH * devicePixelRatio);
  // Scale context so drawing uses CSS pixels coordinates
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  // Compute grid size in cells (use floor to fit)
  width = Math.floor(cssW / CELL_SIZE);
  height = Math.floor(cssH / CELL_SIZE);
  grid = new Uint8Array(width * height);
  // Clear canvas background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, cssW, cssH);
}

// Place a sand particle if cell is empty
function placeSandCell(cx, cy){
  if(cx < 0 || cx >= width || cy < 0 || cy >= height) return;
  const i = idx(cx, cy);
  if(grid[i] === EMPTY) grid[i] = SAND;
}

// Spawn particles at the top center each frame
function spawnTopCenter(){
  const centerX = Math.floor(width / 2);
  const n = SPAWN_MIN + Math.floor(Math.random() * (SPAWN_MAX - SPAWN_MIN + 1));
  for(let i=0;i<n;i++){
    const dx = Math.floor((Math.random() * (SPAWN_SPREAD * 2 + 1)) - SPAWN_SPREAD);
    const x = centerX + dx;
    placeSandCell(x, 0);
  }
}

// Update the simulation one step/frame
function update(){
  // Iterate bottom-to-top, left-to-right
  for(let y = height - 1; y >= 0; y--){
    for(let x = 0; x < width; x++){
      const i = idx(x, y);
      if(grid[i] !== SAND) continue;
      // try to move down
      const belowY = y + 1;
      if(belowY < height){
        const iDown = idx(x, belowY);
        if(grid[iDown] === EMPTY){
          grid[iDown] = SAND;
          grid[i] = EMPTY;
          continue; // moved
        }
        // try down-left or down-right in randomized order
        const tryLeftFirst = Math.random() < 0.5;
        if(tryLeftFirst){
          const x1 = x - 1;
          const x2 = x + 1;
          if(x1 >= 0){
            const iDL = idx(x1, belowY);
            if(grid[iDL] === EMPTY){
              grid[iDL] = SAND;
              grid[i] = EMPTY;
              continue;
            }
          }
          if(x2 < width){
            const iDR = idx(x2, belowY);
            if(grid[iDR] === EMPTY){
              grid[iDR] = SAND;
              grid[i] = EMPTY;
              continue;
            }
          }
        } else {
          const x1 = x + 1;
          const x2 = x - 1;
          if(x1 < width){
            const iDR = idx(x1, belowY);
            if(grid[iDR] === EMPTY){
              grid[iDR] = SAND;
              grid[i] = EMPTY;
              continue;
            }
          }
          if(x2 >= 0){
            const iDL = idx(x2, belowY);
            if(grid[iDL] === EMPTY){
              grid[iDL] = SAND;
              grid[i] = EMPTY;
              continue;
            }
          }
        }
      }
      // otherwise stays
    }
  }
}

// Render the grid into the canvas. Draw each sand cell as a filled rect of CELL_SIZE.
function render(){
  const cssW = Math.max(1, window.innerWidth);
  const cssH = Math.max(1, window.innerHeight);
  // clear background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, cssW, cssH);

  ctx.fillStyle = SAND_COLOR;
  // Loop cells and draw sand
  for(let y = 0; y < height; y++){
    for(let x = 0; x < width; x++){
      if(grid[idx(x,y)] === SAND){
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

// Convert window pixel coordinates to grid cell coordinates (CSS pixels)
function windowToCell(clientX, clientY){
  const rect = canvas.getBoundingClientRect();
  // clientX/Y are in CSS pixels already; subtract canvas rect
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const cellX = Math.floor(x / CELL_SIZE);
  const cellY = Math.floor(y / CELL_SIZE);
  return {cellX, cellY};
}

// Draw a circular brush of sand centered at cell coords
function brushFill(cx, cy){
  const r = BRUSH_RADIUS;
  const r2 = r*r;
  for(let dy = -r; dy <= r; dy++){
    for(let dx = -r; dx <= r; dx++){
      if(dx*dx + dy*dy <= r2){
        placeSandCell(cx + dx, cy + dy);
      }
    }
  }
}

// Mouse event handlers
canvas.addEventListener('mousedown', (e) => {
  if(e.button !== 0) return; // only left button
  drawing = true;
  const {cellX, cellY} = windowToCell(e.clientX, e.clientY);
  brushFill(cellX, cellY);
});

window.addEventListener('mouseup', (e) => {
  if(e.button !== 0) return;
  drawing = false;
});

canvas.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if(drawing){
    const {cellX, cellY} = windowToCell(e.clientX, e.clientY);
    brushFill(cellX, cellY);
  }
});

canvas.addEventListener('mouseleave', (e) => {
  drawing = false;
});

// Touch support: treat touch as left mouse
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  drawing = true;
  const t = e.touches[0];
  const {cellX, cellY} = windowToCell(t.clientX, t.clientY);
  brushFill(cellX, cellY);
}, {passive:false});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const t = e.touches[0];
  const {cellX, cellY} = windowToCell(t.clientX, t.clientY);
  brushFill(cellX, cellY);
}, {passive:false});

canvas.addEventListener('touchend', (e) => {
  drawing = false;
}, {passive:true});

// Main loop
function step(){
  // spawn at top center
  spawnTopCenter();
  // update simulation
  update();
  // render
  render();
  requestAnimationFrame(step);
}

// Setup
window.addEventListener('resize', () => {
  resize();
});

// Initialize and start
resize();
requestAnimationFrame(step);

