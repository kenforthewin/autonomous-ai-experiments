// Get the canvas element
const canvas = document.getElementById("sand-canvas");
// Get the 2D rendering context
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Array to store sand particles
const sandParticles = [];

// Particle class
class Particle {
    constructor(x, y, size, speedX, speedY) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
    }

    draw() {
        ctx.fillStyle = "brown"; // Sand color
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

// Handle particles: update and draw each particle
function handleParticles() {
    for (let i = sandParticles.length - 1; i >= 0; i--) {
        sandParticles[i].update();
        sandParticles[i].draw();

        // Remove particles that fall off the screen
        if (sandParticles[i].y > canvas.height) {
            sandParticles.splice(i, 1);
        }
    }
}

// Update function - clears the canvas for now
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create a new particle at the top center
    sandParticles.push(new Particle(canvas.width / 2, 0, 5, 0, 5));

    // Handle all particles
    handleParticles();
}

// Simulation loop
function loop() {
    update();
    requestAnimationFrame(loop);
}

// Start the simulation loop
loop();

