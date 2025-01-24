// src/managers/ModeManager.js
export class ModeManager {
    constructor(engineWindow) {
        this.engineWindow = engineWindow;
        this.currentMode = 'edit';
        this.listeners = new Set();
    }

    setMode(mode) {
        this.currentMode = mode;
        
        // Update button states
        this.querySelectorAll('.mode-button').forEach(button => {
            button.classList.toggle('active', button.dataset.mode === mode);
        });
    
        // Update component interactivity
        this.components.forEach((data, id) => {
            const element = data.element;
            if (mode === 'edit') {
                this.makeDraggable(element);
                this.makeResizable(element);
                element.querySelector('audio-waveform')?.setAttribute('disabled', '');
            } else {
                element.onmousedown = null;
                element.querySelector('audio-waveform')?.removeAttribute('disabled');
            }
        });
    
        // Update main container class
        const container = this.querySelector('.engine-window');
        container.classList.remove('edit-mode', 'play-mode');
        container.classList.add(`${mode}-mode`);
    }

    // Move mode-related methods here
}