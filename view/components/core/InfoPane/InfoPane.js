export default class InfoPane extends HTMLElement {
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
            this.setupEventListeners();
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .bpm-info {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    background: rgba(0, 0, 0, 0.2);
                    align-items: center;
                    padding: 1.5rem;
                    border-radius: 0.5rem;
                    font-size: clamp(12px, 1.5vw, 16px);
                    font-weight: bold;
                    color: #fff;
                }
    
                .controls-group {
                    display: flex;
                    gap: 2rem;
                    align-items: center;
                }
    
                .bpm-input-group, .bar-select-group {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
    
                #bpmInput, #barSelect {
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 0.25rem;
                    color: #fff;
                    font-size: 1.1rem;
                    font-weight: bold;
                    padding: 0.5rem;
                    width: 5rem;
                    text-align: center;
                }
    
                #bpmInput:focus, #barSelect:focus {
                    outline: none;
                    border-color: #4CAF50;
                }
    
                .title {
                    font-size: 1.5rem;
                    font-weight: 900;
                    letter-spacing: 0.2rem;
                    color: #fff;
                    text-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.7);
                }
    
                label {
                    font-size: 12px;
                    font-weight: bold;
                    color: #ffffff;
                    text-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.7);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
            </style>
    
            <div class="bpm-info">
                <div class="title">ENGINE LOOPER</div>
                <div class="controls-group">
                    <div class="bpm-input-group">
                        <input type="number" id="bpmInput" min="40" max="240" value="110">
                        <label>BPM</label>
                    </div>
                    <div class="bar-select-group">
                        <select id="barSelect">
                            <option value="0.125">1/8</option>
                            <option value="0.25">1/4</option>
                            <option value="0.5">1/2</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="4">4</option>
                        </select>
                        <label>BARS</label>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const bpmInput = this.shadowRoot.querySelector("#bpmInput");
        const barSelect = this.shadowRoot.querySelector("#barSelect");
        const bpmDisplay = this.shadowRoot.querySelector("#bpmDisplay");
        const barDisplay = this.shadowRoot.querySelector("#barDisplay");

        // BPM Input handling
        bpmInput.addEventListener('change', () => {
            let value = Math.min(Math.max(parseInt(bpmInput.value), 40), 240);
            bpmInput.value = value;
            this.patchConnection.sendEventOrValue('targetBPM', value);
        });

        // Bar Select handling
        barSelect.addEventListener('change', () => {
            const value = parseFloat(barSelect.value);
            this.patchConnection.sendEventOrValue('targetBarsValue', value);
            this.patchConnection.sendEventOrValue('timeSignatureBeats', 4.0 * value);
        });

        // Listen for patch updates
        this.patchConnection.addEndpointListener('detectedBPM', bpm => {
            bpmInput.value = Math.round(bpm);
            bpmDisplay.textContent = `BPM: ${bpm.toFixed(1)}`;
        });

        this.patchConnection.addEndpointListener('detectedBars', bars => {
            const barText = bars < 1 ? `1/${Math.round(1/bars)}` : bars;
            barSelect.value = bars.toString();
            barDisplay.textContent = `Bars: ${barText}`;
        });
    }
}

customElements.define('info-pane', InfoPane);