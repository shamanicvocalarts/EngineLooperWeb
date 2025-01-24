// ui/Grid.js
export class Grid {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        
        this.setupPanning();
    }

    setupPanning() {
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 1 || (e.button === 0 && e.altKey)) { // Middle mouse or Alt+Left click
                this.isDragging = true;
                this.lastX = e.clientX;
                this.lastY = e.clientY;
                this.canvas.style.cursor = 'move';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const dx = e.clientX - this.lastX;
                const dy = e.clientY - this.lastY;
                
                this.offsetX += dx;
                this.offsetY += dy;
                
                this.lastX = e.clientX;
                this.lastY = e.clientY;
                
                this.render();
                
                // Emit pan event for components to update
                const event = new CustomEvent('canvaspanned', {
                    detail: { dx, dy, offsetX: this.offsetX, offsetY: this.offsetY }
                });
                this.canvas.dispatchEvent(event);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.canvas.style.cursor = 'default';
            }
        });
    }

    resize(width, height) {
        if (!this.canvas) return;
        this.canvas.width = width;
        this.canvas.height = height;
        this.render();
    }

    render() {
        if (!this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply canvas offset to grid rendering
        this.ctx.save();
        this.ctx.translate(this.offsetX, this.offsetY);
        
        // Draw grid
        const gridSize = 20;
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 0.5;

        // Calculate visible area boundaries
        const startX = -this.offsetX - gridSize;
        const startY = -this.offsetY - gridSize;
        const endX = startX + this.canvas.width + gridSize * 2;
        const endY = startY + this.canvas.height + gridSize * 2;

        // Draw vertical lines
        for (let x = Math.floor(startX / gridSize) * gridSize; x < endX; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
            this.ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = Math.floor(startY / gridSize) * gridSize; y < endY; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    getOffset() {
        return { x: this.offsetX, y: this.offsetY };
    }
}