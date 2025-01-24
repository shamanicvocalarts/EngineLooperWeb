export default class ButtonGrid extends HTMLElement {
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
                .button-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 2%;
                }

                .button {
                    width: 100%;
                    height: 10vh;
                    border-radius: 10px;
                    border: none;
                    cursor: pointer;
                    font-size: clamp(12px, 1.5vw, 16px);
                    font-weight: bold;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                #recordTrigger {
                    background: #ff4444;
                    color: white;
                }

                #recordTrigger.active {
                    background: #ff8888;
                    box-shadow: 0 0 20px #ff4444;
                }

                #playPauseTrigger {
                    background: #44ff44;
                    color: white;
                }

                #playPauseTrigger.active {
                    background: #88ff88;
                    box-shadow: 0 0 20px #44ff44;
                }

                #clearTrigger {
                    background: #4444ff;
                    color: white;
                }

                #monitorInput {
                    background: #44aaff;
                    color: white;
                }

                #monitorInput.active {
                    background: #88ccff;
                    box-shadow: 0 0 20px #44aaff;
                }

                #bpmDetect {
                    background: #9c27b0;
                }

                #bpmDetect.active {
                    background: #ba68c8;
                    box-shadow: 0 0 20px #9c27b0;
                }

                #overdubTrigger {
                    background: #ffa500;
                    color: white;
                }

                #overdubTrigger.active {
                    background: #ffc04d;
                    box-shadow: 0 0 20px #ffa500;
                }

                #reverseTrigger {
                    background-color: #444;
                    color: white;
                }

                #reverseTrigger.active {
                    background-color: #4CAF50;
                }

                #reverseTrigger:hover {
                    background-color: #555;
                }

                #reverseTrigger.active:hover {
                    background-color: #45a049;
                }

                #dummy {
                    background-color: #666;
                    color: white;
                }
            </style>
            <div class="button-row">
                <button id="recordTrigger" class="button">RECORD</button>
                <button id="overdubTrigger" class="button">OVERDUB</button>
                <button id="playPauseTrigger" class="button">PLAY/PAUSE</button>
                <button id="clearTrigger" class="button">CLEAR</button>
                <button id="monitorInput" class="button">MONITOR</button>
                <button id="bpmDetect" class="button">FIRST LOOP</button>
                <button id="reverseTrigger" class="button">REVERSE</button>
                <button id="dummy" class="button">DUMMY</button>
            </div>
        `;
    }

    setupEventListeners() {
        const recordButton = this.shadowRoot.querySelector("#recordTrigger");
        recordButton.addEventListener('click', () => {
            const isActive = !recordButton.classList.contains('active');
            recordButton.classList.toggle('active', isActive);
            this.patchConnection.sendEventOrValue('recordTrigger', isActive);
        });

        this.patchConnection.addEndpointListener('recordingState', isRecording => {
            recordButton.classList.toggle('active', isRecording);
        });

        const playPauseButton = this.shadowRoot.querySelector("#playPauseTrigger");
        playPauseButton.addEventListener('click', () => {
            playPauseButton.classList.toggle('active');
            this.patchConnection.sendEventOrValue('playPauseTrigger', playPauseButton.classList.contains('active'));
        });

        const clearButton = this.shadowRoot.querySelector("#clearTrigger");
        clearButton.addEventListener('mousedown', () => {
            this.patchConnection.sendEventOrValue('clearTrigger', true);
        });
        clearButton.addEventListener('mouseup', () => {
            this.patchConnection.sendEventOrValue('clearTrigger', false);
        });

        const monitorButton = this.shadowRoot.querySelector("#monitorInput");
        monitorButton.addEventListener('click', () => {
            monitorButton.classList.toggle('active');
            this.patchConnection.sendEventOrValue('monitorInput', monitorButton.classList.contains('active'));
        });

        const overdubButton = this.shadowRoot.querySelector("#overdubTrigger");
        overdubButton.addEventListener('click', () => {
            overdubButton.classList.toggle('active');
            this.patchConnection.sendEventOrValue('overdubTrigger', overdubButton.classList.contains('active'));
        });

        const reverseButton = this.shadowRoot.querySelector("#reverseTrigger");
        reverseButton.addEventListener('click', () => {
            reverseButton.classList.toggle('active');
            const isReversed = reverseButton.classList.contains('active');
            this.patchConnection.sendEventOrValue('reverseTrigger', isReversed);
        });

        const bpmDetectButton = this.shadowRoot.querySelector("#bpmDetect");
        bpmDetectButton.addEventListener('click', () => {
            bpmDetectButton.classList.toggle('active');
            this.patchConnection.sendEventOrValue('enableBPMDetection', bpmDetectButton.classList.contains('active'));
        });
    }
}

customElements.define('button-grid', ButtonGrid);