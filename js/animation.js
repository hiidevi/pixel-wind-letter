/**
 * Animation Engine for Pixel Wind Letter
 * Handles the HTML5 Canvas renderingLoop, resizing, and scene management.
 */

export class AnimationEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = 320;
        this.height = 180;
        this.particles = [];
        this.frame = 0;
        this.windDirection = 1;
        this.seed = Math.random();

        // Bind methods
        this.resize = this.resize.bind(this);
        this.loop = this.loop.bind(this);

        // Initial setup
        this.resize();
        window.addEventListener('resize', this.resize);
    }

    setSeed(seed) {
        this.seed = seed || Math.random();
        this.frame = 0;
        this.rand = this.mulberry32(Math.floor(this.seed * 0xFFFFFFFF));
        this.initVisuals();
    }

    mulberry32(a) {
        return function () {
            var t = a += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }

    initVisuals() {
        // Randomize Palette or Rose style based on seed
        const r = this.rand ? this.rand : Math.random;

        // Variants
        this.windStyle = r() > 0.5 ? 'calm' : 'breezy';
        this.roseColor = r() > 0.5 ? '#d00000' : (r() > 0.5 ? '#ff006e' : '#ffbe0b');
        this.skyType = r() > 0.5 ? 'night' : 'dusk';

        this.initParticles();
    }

    resize() {
        // We keep internal resolution low for pixel look, but scale canvas to fit window
        // The CSS handles the visual scaling (image-rendering: pixelated)
        // We just need to set the internal buffer size.
        // We can make it responsive by maintaining aspect ratio or just filling.
        // Let's fill but keep low res.
        const aspect = window.innerWidth / window.innerHeight;
        // Target height 180px, width dynamic
        this.height = 180;
        this.width = Math.ceil(this.height * aspect);

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.rosePosition = { x: this.width / 2, y: this.height - 40 };
    }

    initParticles() {
        this.particles = [];
        const r = this.rand ? this.rand : Math.random;
        this.particleCount = this.windStyle === 'breezy' ? 80 : 40;

        for (let i = 0; i < this.particleCount; i++) {
            const isPetal = r() > 0.8; // 20% chance to be a petal
            this.particles.push({
                x: r() * this.width,
                y: r() * this.height,
                speed: (0.2 + r() * 0.5) * (this.windStyle === 'breezy' ? 2 : 1),
                size: isPetal ? 2 : (r() > 0.8 ? 2 : 1),
                opacity: 0.1 + r() * 0.4,
                color: isPetal ? this.roseColor : '#ffffff',
                isPetal: isPetal
            });
        }
    }

    drawBackground() {
        // Gradient Sky
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        if (this.skyType === 'night') {
            gradient.addColorStop(0, '#0d1b2a'); // Deep Blue
            gradient.addColorStop(1, '#1b263b');
        } else {
            // Dusk
            gradient.addColorStop(0, '#231942');
            gradient.addColorStop(1, '#5e548e');
        }

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Clouds (Procedural Blocks)
        // ... omitted for brevity but could add later

        // Ground
        this.ctx.fillStyle = '#101820'; // Dark silhouette ground
        this.ctx.fillRect(0, this.height - 20, this.width, 20);
    }

    drawRose() {
        // Simple procedural pixel rose
        const x = this.rosePosition.x;
        const y = this.rosePosition.y;

        // Sway
        const sway = Math.sin(this.frame * 0.05) * 2;

        this.ctx.fillStyle = '#2d6a4f'; // Stem Green
        this.ctx.fillRect(x, y, 2, 20); // Stem

        // Leaves
        this.ctx.fillRect(x - 2 + sway / 2, y + 10, 2, 2);
        this.ctx.fillRect(x + 2 + sway / 2, y + 14, 2, 2);

        // Rose Head
        this.ctx.fillStyle = this.roseColor || '#d00000';
        this.ctx.fillRect(x - 2 + sway, y - 4, 6, 6); // Main blob
        this.ctx.fillStyle = 'rgba(0,0,0,0.2)'; // Shadow
        this.ctx.fillRect(x + sway + 1, y - 1, 2, 2);
    }

    drawWind() {
        this.particles.forEach(p => {
            // Update
            p.x += p.speed;
            p.y += Math.sin(p.x * 0.05 + this.frame * 0.02) * (this.windStyle === 'breezy' ? 0.5 : 0.2);
            if (p.isPetal) p.y += 0.2; // Petals fall slightly

            // Loop screen
            if (p.x > this.width) {
                p.x = -10;
                p.y = Math.random() * this.height * 0.8;
            }
            if (p.y > this.height) {
                p.y = -10;
                p.x = Math.random() * this.width;
            }

            // Draw
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.opacity;
            this.ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
            this.ctx.globalAlpha = 1.0;
        });
    }

    loop() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.drawBackground();
        this.drawWind();
        this.drawRose();

        this.frame++;
        requestAnimationFrame(this.loop);
    }

    start(seed) {
        if (seed) this.setSeed(seed);
        else this.setSeed(Math.random());
        this.loop();
    }
}
