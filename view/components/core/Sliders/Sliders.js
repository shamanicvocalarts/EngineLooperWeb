export default class Sliders extends HTMLElement {
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
                .slider-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 5%;
                    width: 100%;
                }

                .slider-container {
                    background: rgba(0, 0, 0, 0.3);
                    padding: 1rem;
                    border-radius: 0.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    min-width: 0;
                }

                .slider {
                    width: 100%;
                    height: 2rem;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 1rem;
                    appearance: none;
                    -webkit-appearance: none;
                }

                .slider-value {
                    text-align: center;
                    font-size: 12px;
                    color: #aaa;
                    padding: 0.25rem;
                }

                .slider-with-value {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-top: 0.5rem;
                }

                .slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 2rem;
                    height: 2rem;
                    border-radius: 50%;
                    background: #4CAF50;
                    cursor: pointer;
                    border: 2px solid #378C3F;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
                }

                .slider-value {
                    width: 4rem;
                    padding: 0.25rem;
                    background: rgba(0, 0, 0, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 0.25rem;
                    color: #fff;
                    font-size: 1rem;
                    font-weight: bold;
                    text-align: center;
                }

                .slider-value:focus {
                    outline: none;
                    border-color: #4CAF50;
                }
            </style>
            <div class="slider-section">
                <div class="slider-container">
                    <label>Playback Speed</label>
                    <input type="range" class="slider" id="playbackSpeed" min="-2" max="2" step="0.01" value="1">
                    <div class="slider-value" id="playbackSpeedValue">1.00x</div>
                </div>
                <div class="slider-container">
                    <label>Max Loop Length</label>
                    <input type="range" class="slider" id="maxLoopLength" min="1" max="10" step="0.1" value="10">
                    <div class="slider-value" id="maxLoopLengthValue">10s</div>
                </div>
                <div class="slider-container">
                    <label>Current Loop Length</label>
                    <input type="range" class="slider" id="currentLoopLength" min="1" max="10" step="0.1" value="10">
                    <div class="slider-value" id="currentLoopLengthValue">10s</div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const playbackSpeed = this.shadowRoot.querySelector("#playbackSpeed");
        const playbackSpeedValue = this.shadowRoot.querySelector("#playbackSpeedValue");
        const maxLoopLength = this.shadowRoot.querySelector("#maxLoopLength");
        const maxLoopLengthValue = this.shadowRoot.querySelector("#maxLoopLengthValue");
        const currentLoopLength = this.shadowRoot.querySelector("#currentLoopLength");
        const currentLoopLengthValue = this.shadowRoot.querySelector("#currentLoopLengthValue");

        playbackSpeed.addEventListener('input', () => {
            const value = parseFloat(playbackSpeed.value);
            playbackSpeedValue.textContent = `${value.toFixed(2)}x`;
            this.patchConnection.sendEventOrValue('playbackSpeed', value);
        });

        maxLoopLength.addEventListener('input', () => {
            const value = parseFloat(maxLoopLength.value);
            maxLoopLengthValue.textContent = `${value.toFixed(1)}s`;
            this.patchConnection.sendEventOrValue('maxLoopLength', value);
        });

        currentLoopLength.addEventListener('input', () => {
            const value = parseFloat(currentLoopLength.value);
            currentLoopLengthValue.textContent = `${value.toFixed(1)}s`;
            this.patchConnection.sendEventOrValue('currentLoopLength', value);
        });
    }
}

customElements.define('audio-sliders', Sliders);