// Inspector.js

/**
 * Inspector class handles the property inspection and editing of selected components
 * - Displays component properties 
 * - Allows editing of position, size etc
 * - Updates component when properties change
 */


// In Inspector.js
export class Inspector {
    constructor(parentElement) {
        if (!parentElement) {
            throw new Error('Parent element must be provided to Inspector constructor');
        }
        this.element = null;
        this.selectedComponent = null;
        this.componentData = null;
        this.initializeUI(parentElement);
    }

    initializeUI(parentElement) {
        // Add error checking
        if (!parentElement) {
            console.error('Cannot initialize Inspector UI: parent element is null');
            return;
        }

        // Create inspector container
        this.element = document.createElement('div');
        this.element.className = 'inspector';
        
        // Add inspector HTML
        this.element.innerHTML = `
            <h3>Inspector</h3>
            <div class="inspector-content"></div>
            
            <style>
                .inspector {
                    background: #1a1a1a;
                    padding: 1rem;
                    overflow-y: auto;
                }
                
                .inspector h3 {
                    margin-top: 0;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #333;
                    color: #fff;
                }
                
                .inspector-fields {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                
                .inspector-fields .field {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: #fff;
                }
                
                .inspector-fields input {
                    width: 60px;
                    padding: 0.25rem;
                    background: #333;
                    border: 1px solid #444;
                    color: #fff;
                }
                
                .inspector-fields label {
                    margin-right: 1rem;
                }
            </style>
        `;

        try {
            parentElement.appendChild(this.element);
        } catch (error) {
            console.error('Failed to append Inspector to parent:', error);
        }
    }

    /**
     * Update inspector with component data
     * - Takes component element and its associated data
     * - Updates inspector UI
     * - Sets up property change handlers
     */
    updateComponent(element, componentData) {
        this.selectedComponent = element;
        this.componentData = componentData;
        
        const inspectorContent = this.element.querySelector('.inspector-content');
        
        if (componentData) {
            inspectorContent.innerHTML = `
                <div class="inspector-fields">
                    <div class="field">
                        <label>Type:</label>
                        <span>${componentData.type}</span>
                    </div>
                    <div class="field">
                        <label>Position X:</label>
                        <input type="number" value="${parseInt(element.style.left)}" data-property="x">
                    </div>
                    <div class="field">
                        <label>Position Y:</label>
                        <input type="number" value="${parseInt(element.style.top)}" data-property="y">
                    </div>
                    <div class="field">
                        <label>Width:</label>
                        <input type="number" value="${element.offsetWidth}" data-property="width">
                    </div>
                    <div class="field">
                        <label>Height:</label>
                        <input type="number" value="${element.offsetHeight}" data-property="height">
                    </div>
                </div>
            `;

            this.setupPropertyListeners();
        } else {
            inspectorContent.innerHTML = '<p>No component selected</p>';
        }
    }

    /**
     * Set up event listeners for property changes
     * - Handles numeric input changes
     * - Updates component properties
     * - Triggers component resize if needed
     */
    setupPropertyListeners() {
        const element = this.selectedComponent;
        
        this.element.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', (e) => {
                const property = e.target.dataset.property;
                const value = parseInt(e.target.value);
                
                switch(property) {
                    case 'x':
                        element.style.left = `${value}px`;
                        break;
                    case 'y':
                        element.style.top = `${value}px`;
                        break;
                    case 'width':
                        element.style.width = `${value}px`;
                        this.handleComponentResize(element);
                        break;
                    case 'height':
                        element.style.height = `${value}px`;
                        this.handleComponentResize(element);
                        break;
                }
            });
        });
    }

    /**
     * Handle component resize
     * - Checks for resizable components
     * - Calls appropriate resize methods
     */
    handleComponentResize(element) {
        const resizableComponent = element.querySelector('audio-waveform');
        if (resizableComponent?.resizeWaveform) {
            resizableComponent.resizeWaveform();
        }
    }

    /**
     * Clear current selection
     */
    clearSelection() {
        this.selectedComponent = null;
        this.componentData = null;
        this.element.querySelector('.inspector-content').innerHTML = '<p>No component selected</p>';
    }
}