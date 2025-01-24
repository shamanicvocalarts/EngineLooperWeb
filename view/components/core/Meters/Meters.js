export default class Meters extends HTMLElement {
    constructor(patchConnection) {
        super();
        this.patchConnection = patchConnection;
        this.attachShadow({ mode: 'open' });
        this.initialized = false;
    }

    connectedCallback() {
        if (!this.initialized) {
            this.initialized = true;
            this.render();
            this.setupMeters();
            this.setupEventListeners();
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .meters-section {
                    display: flex;
                    gap: 5%;
                    width: 100%;
                }
    
                .meter-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    padding: 1rem;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 0.5rem;
                    position: relative;
                }
    
                .meter-group {
                    display: flex;
                    justify-content: center;
                    gap: 10%;
                    height: 150px;
                }
    
                .meter-wrap {
                    width: 40%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2%;
                    margin-bottom: 1rem;
                }
    
                .meter-wrap label {
                    font-size: 10px;
                    font-weight: bold;
                    color: #ffffff;
                    text-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.7);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
    
                .meter {
                    width: 100%;
                    height: 100%;
                    background: #333;
                }
    
                .volume-control {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
    
                .volume-slider {
                    width: 150px;
                    height: 4px;
                    -webkit-appearance: none;
                    appearance: none;
                    background: #444;
                    border-radius: 4px;
                    opacity: 0.8;
                    transform: rotate(-90deg);
                    transform-origin: center;
                }
    
                .volume-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 1.5rem;
                    height: 1.5rem;
                    border-radius: 50%;
                    background: #4CAF50;
                    cursor: pointer;
                    border: 2px solid #378C3F;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
                }
    
                .meter-container label {
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: bold;
                    text-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.7);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
    
                /* Additional padding for the tab content */
                :host {
                    padding: 20px;
                    display: block;
                }
            </style>
    
            <div class="meters-section">
                <div class="meter-container">
                    <label>Input Level</label>
                    <div class="meter-control-group">
                        <div class="meter-group">
                            <div class="meter-wrap">
                                <canvas id="inputLeftMeter" class="meter" width="30" height="150"></canvas>
                                <label>L</label>
                            </div>
                            <div class="meter-wrap">
                                <canvas id="inputRightMeter" class="meter" width="30" height="150"></canvas>
                                <label>R</label>
                            </div>
                        </div>
                        <div class="volume-control">
                            <input type="range" class="volume-slider" id="inputVolume" min="0" max="1" step="0.01" value="1">
                        </div>
                    </div>
                </div>
    
                <div class="meter-container">
                    <label>Output Level</label>
                    <div class="meter-control-group">
                        <div class="meter-group">
                            <div class="meter-wrap">
                                <canvas id="outputLeftMeter" class="meter" width="30" height="150"></canvas>
                                <label>L</label>
                            </div>
                            <div class="meter-wrap">
                                <canvas id="outputRightMeter" class="meter" width="30" height="150"></canvas>
                                <label>R</label>
                            </div>
                        </div>
                        <div class="volume-control">
                            <input type="range" class="volume-slider" id="outputVolume" min="0" max="1" step="0.01" value="1">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupMeters() {
        this.inputLeftMeterCtx = this.shadowRoot.querySelector("#inputLeftMeter").getContext("2d");
        this.inputRightMeterCtx = this.shadowRoot.querySelector("#inputRightMeter").getContext("2d");
        this.outputLeftMeterCtx = this.shadowRoot.querySelector("#outputLeftMeter").getContext("2d");
        this.outputRightMeterCtx = this.shadowRoot.querySelector("#outputRightMeter").getContext("2d");

        // Initialize meters with 0 level
        this.drawMeter(this.inputLeftMeterCtx, 0);
        this.drawMeter(this.inputRightMeterCtx, 0);
        this.drawMeter(this.outputLeftMeterCtx, 0);
        this.drawMeter(this.outputRightMeterCtx, 0);

        // Setup patch connection listeners
        if (this.patchConnection) {
            this.patchConnection.addEndpointListener('audioIn', levels => {
                this.drawMeter(this.inputLeftMeterCtx, levels.max[0]);
                this.drawMeter(this.inputRightMeterCtx, levels.max[1]);
            });

            this.patchConnection.addEndpointListener('audioOut', levels => {
                this.drawMeter(this.outputLeftMeterCtx, levels.max[0]);
                this.drawMeter(this.outputRightMeterCtx, levels.max[1]);
            });
        }
    }

    setupEventListeners() {
        const inputVolume = this.shadowRoot.querySelector("#inputVolume");
        const outputVolume = this.shadowRoot.querySelector("#outputVolume");

        inputVolume.addEventListener('input', () => {
            this.patchConnection.sendEventOrValue('inputGain', parseFloat(inputVolume.value));
        });

        outputVolume.addEventListener('input', () => {
            this.patchConnection.sendEventOrValue('outputGain', parseFloat(outputVolume.value));
        });
    }

    drawMeter(ctx, level) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, width, height);

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#4CAF50');
        gradient.addColorStop(0.6, '#FFC107');
        gradient.addColorStop(0.8, '#FF5722');
        gradient.addColorStop(1, '#F44336');
        
        ctx.fillStyle = gradient;
        const meterHeight = height * level;
        ctx.fillRect(0, height - meterHeight, width, meterHeight);
    }
}

customElements.define('audio-meters', Meters);