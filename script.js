class FallingSandSimulation {
    constructor() {
        this.canvas = document.getElementById('sandCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Grid dimensions
        this.gridWidth = 800;
        this.gridHeight = 600;
        this.cellSize = 1;
        
        // Grid data (0 = empty, 1 = sand)
        this.grid = [];
        this.nextGrid = [];
        
        // Colors
        this.colors = {
            empty: 'transparent',
            sand: ['#f4e4c1', '#e8d4a1', '#dcc481', '#d0b461'] // Sand color variations
        };
        
        // Performance tracking
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        
        // Sand generation
        this.sandSpawnRate = 3; // Particles per frame
        this.spawnX = Math.floor(this.gridWidth / 2);
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.initGrids();
        this.setupEventListeners();
        this.animate();
    }
    
    setupCanvas() {
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            
            // Calculate cell size to fit the grid
            this.cellSize = Math.min(
                this.canvas.width / this.gridWidth,
                this.canvas.height / this.gridHeight
            );
            
            // Ensure minimum cell size for visibility
            this.cellSize = Math.max(this.cellSize, 1);
        };
        
        resize();
        window.addEventListener('resize', resize);
    }
    
    initGrids() {
        for (let y = 0; y < this.gridHeight; y++) {
            this.grid[y] = new Array(this.gridWidth).fill(0);
            this.nextGrid[y] = new Array(this.gridWidth).fill(0);
        }
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.spawnSandAtPosition(x, y);
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (e.buttons === 1) { // Left mouse button is pressed
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.spawnSandAtPosition(x, y);
            }
        });
    }
    
    spawnSandAtPosition(canvasX, canvasY) {
        const gridX = Math.floor(canvasX / this.cellSize);
        const gridY = Math.floor(canvasY / this.cellSize);
        
        // Spawn sand in a small area around the click position
        const radius = 5;
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const x = gridX + dx;
                const y = gridY + dy;
                
                if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance <= radius && Math.random() < 0.8) {
                        this.grid[y][x] = 1;
                    }
                }
            }
        }
    }
    
    generateSand() {
        // Continuously generate sand from top center
        for (let i = 0; i < this.sandSpawnRate; i++) {
            const x = this.spawnX + Math.floor(Math.random() * 11) - 5; // Random spread
            const y = 0;
            
            if (x >= 0 && x < this.gridWidth && this.grid[y][x] === 0) {
                this.grid[y][x] = 1;
            }
        }
    }
    
    updatePhysics() {
        // Clear next grid
        for (let y = 0; y < this.gridHeight; y++) {
            this.nextGrid[y].fill(0);
        }
        
        // Process from bottom to top for proper falling physics
        for (let y = this.gridHeight - 1; y >= 0; y--) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x] === 1) {
                    this.processSandParticle(x, y);
                }
            }
        }
        
        // Swap grids
        [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
    }
    
    processSandParticle(x, y) {
        // Check if particle can fall straight down
        if (y + 1 < this.gridHeight && this.grid[y + 1][x] === 0) {
            this.nextGrid[y + 1][x] = 1;
            return;
        }
        
        // Check if particle can slide diagonally (prefer left or right randomly)
        const directions = Math.random() < 0.5 ? [-1, 1] : [1, -1];
        
        for (let dir of directions) {
            const newX = x + dir;
            const newY = y + 1;
            
            if (newX >= 0 && newX < this.gridWidth && 
                newY < this.gridHeight && 
                this.grid[newY][newX] === 0) {
                this.nextGrid[newY][newX] = 1;
                return;
            }
        }
        
        // If cannot move, stay in place
        this.nextGrid[y][x] = 1;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(26, 26, 46, 0.1)'; // Slight trail effect
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render sand particles
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x] === 1) {
                    // Select color variation based on position for natural look
                    const colorIndex = (x + y) % this.colors.sand.length;
                    this.ctx.fillStyle = this.colors.sand[colorIndex];
                    
                    // Draw particle as a small rectangle
                    const pixelX = x * this.cellSize;
                    const pixelY = y * this.cellSize;
                    const size = Math.max(this.cellSize - 0.5, 0.5); // Slight gap for visual effect
                    
                    this.ctx.fillRect(pixelX, pixelY, size, size);
                }
            }
        }
    }
    
    updateFPS() {
        this.frameCount++;
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        
        if (deltaTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / deltaTime);
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // Update info display with FPS
            const infoElement = document.querySelector('.info p');
            if (infoElement) {
                infoElement.textContent = `Click anywhere to spawn sand particles | FPS: ${this.fps}`;
            }
        }
    }
    
    animate() {
        // Generate new sand
        this.generateSand();
        
        // Update physics
        this.updatePhysics();
        
        // Render
        this.render();
        
        // Update FPS counter
        this.updateFPS();
        
        // Continue animation
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize simulation when page loads
document.addEventListener('DOMContentLoaded', () => {
    new FallingSandSimulation();
});
