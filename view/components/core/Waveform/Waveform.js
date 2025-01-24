export default class Waveform extends HTMLElement {
    constructor(patchConnection) {
        super();
        this.patchConnection = patchConnection;
        this.attachShadow({ mode: 'open' });
        this.initialized = false;
        this.waveformData = null;
        this.playheadPosition = 0;
        this.lastDrawTime = 0;
        this.drawRequested = false;
        this.MIN_DRAW_INTERVAL = 1000 / 60;
        this.isDragging = false;
        this.style.width = '300px';  // Set default size
        this.style.height = '200px';
        this.style.display = 'block';
    
    }

    connectedCallback() {
        if (!this.initialized) {
            this.initialized = true;
            this.render();
            this.setupWaveform();

            // Add a ResizeObserver to handle resizing directly on the canvas
            this.resizeObserver = new ResizeObserver(() => this.resizeWaveform());
            const canvas = this.shadowRoot.querySelector('#waveformCanvas');
            if (canvas) {
                this.resizeObserver.observe(canvas);
            }
        }
    }

    disconnectedCallback() {
        this.cleanup();
    }

    cleanup() {
        // Disconnect the ResizeObserver
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }

        // Clean up event listeners
        if (this.waveformCanvas) {
            this.waveformCanvas.removeEventListener('mousedown', this.handleMouseDown);
            window.removeEventListener('mousemove', this.handleMouseMove);
            window.removeEventListener('mouseup', this.handleMouseUp);
        }

        // Cancel any pending animation frame requests
        if (this.drawRequested) {
            cancelAnimationFrame(this.drawRequested);
            this.drawRequested = false;
        }

        // Clean up patchConnection listeners
        this.cleanupPatchConnection();

        // Clear references to avoid memory leaks
        this.waveformCanvas = null;
        this.waveformCtx = null;
        this.waveformData = null;
    }

    cleanupPatchConnection() {
        if (this.patchConnection) {
            // Remove all endpoint listeners
            this.patchConnection.removeEndpointListener('visualData');
            this.patchConnection.removeEndpointListener('playheadNorm');
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    flex: 1;
                    min-height: 0;
                    height: 100%;
                    width: 100%;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 0.5rem;
                    padding: 0;
                    margin: 0;
                    box-sizing: border-box;
                }

                .waveform {
                    flex: 1;
                    width: 100%;
                    height: 100%;
                    border-radius: 0.25rem;
                    border: 2px solid #4CAF50;
                }
            </style>
            <canvas id="waveformCanvas" class="waveform"></canvas>
        `;
    }

    setupWaveform() {
        this.waveformCanvas = this.shadowRoot.querySelector("#waveformCanvas");
        this.waveformCtx = this.waveformCanvas.getContext("2d", {
            alpha: false,
            desynchronized: true
        });

        this.resizeWaveform();
        this.drawBackground();

        // Add endpoint listeners
        this.patchConnection.addEndpointListener('visualData', data => {
            if (data?.length) {
                this.waveformData = data;
                this.requestDraw();
            }
        });

        this.patchConnection.addEndpointListener('playheadNorm', pos => {
            this.playheadPosition = pos;
            this.requestDraw();
        });

        // Bind event listeners to the class instance
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);

        this.waveformCanvas.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);
    }

    handleMouseDown(e) {
        this.isDragging = true;
        const normalizedPos = this.calculateNormalizedPosition(e);
        this.patchConnection.sendEventOrValue('scrubTrigger', true);
        this.patchConnection.sendEventOrValue('scrubPosition', normalizedPos);
    }

    handleMouseMove(e) {
        if (this.isDragging) {
            const normalizedPos = this.calculateNormalizedPosition(e);
            this.patchConnection.sendEventOrValue('scrubPosition', normalizedPos);
        }
    }

    handleMouseUp() {
        if (this.isDragging) {
            this.isDragging = false;
            this.patchConnection.sendEventOrValue('scrubTrigger', false);
        }
    }

    calculateNormalizedPosition(e) {
        const rect = this.waveformCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        return Math.max(0, Math.min(1, x / rect.width));
    }

    requestDraw() {
        if (!this.drawRequested) {
            this.drawRequested = true;
            requestAnimationFrame(() => this.draw());
        }
    }

    draw() {
        const now = performance.now();
        if (now - this.lastDrawTime < this.MIN_DRAW_INTERVAL) {
            requestAnimationFrame(() => this.draw());
            return;
        }

        this.drawRequested = false;
        this.lastDrawTime = now;
        this.drawWaveform();
    }

    drawBackground() {
        if (!this.waveformCanvas || !this.waveformCtx) return;

        const ctx = this.waveformCtx;
        const width = this.waveformCanvas.width;
        const height = this.waveformCanvas.height;

        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, width, height);
        this.drawGrid(ctx, width, height);
    }

    drawWaveform() {
        if (!this.waveformCanvas || !this.waveformCtx) return;

        const ctx = this.waveformCtx;
        const width = this.waveformCanvas.width;
        const height = this.waveformCanvas.height;

        this.drawBackground();

        if (this.waveformData) {
            const centerY = height / 2;
            const ampScale = height * 0.45;

            ctx.beginPath();
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 2;

            for (let x = 0; x < width; x++) {
                const dataIndex = Math.floor((x / width) * this.waveformData.length);
                if (dataIndex >= this.waveformData.length) break;
                const y = centerY + (this.waveformData[dataIndex][0] * ampScale);
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }

            ctx.stroke();
        }

        if (typeof this.playheadPosition === 'number' && this.playheadPosition >= 0) {
            const x = this.playheadPosition * width;
            ctx.beginPath();
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    drawGrid(ctx, width, height) {
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.beginPath();

        for (let x = 0; x <= width; x += width / 10) {
            ctx.moveTo(x + 0.5, 0);
            ctx.lineTo(x + 0.5, height);
        }

        for (let y = 0; y <= height; y += height / 8) {
            ctx.moveTo(0, y + 0.5);
            ctx.lineTo(width, y + 0.5);
        }

        ctx.stroke();
    }

    resizeWaveform() {
        if (!this.waveformCanvas || !this.waveformCtx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = this.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Update canvas size
        this.waveformCanvas.style.width = '100%';
        this.waveformCanvas.style.height = '100%';
        this.waveformCanvas.width = width * dpr;
        this.waveformCanvas.height = height * dpr;

        // Reset transform and scale
        this.waveformCtx.setTransform(1, 0, 0, 1, 0, 0);
        this.waveformCtx.scale(dpr, dpr);

        // Force a redraw
        this.drawBackground();
        if (this.waveformData) {
            this.drawWaveform();
        }
    }
}

customElements.define('audio-waveform', Waveform);