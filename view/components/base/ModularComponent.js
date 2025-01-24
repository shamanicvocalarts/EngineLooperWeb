// components/base/ModularComponent.js

export class ModularComponent extends HTMLElement {
    constructor() {
        super();
        this.parameters = new Map();
        this.scripts = new Map();
        this.styles = new Map();
        this.initialize();
    }

    initialize() {
        this.innerHTML = `
            <div class="modular-component">
                <div class="component-content"></div>
            </div>
            <style>
                .modular-component {
                    width: 100%;
                    height: 100%;
                    position: relative;
                }
                
                .component-content {
                    width: 100%;
                    height: 100%;
                }
            </style>
        `;

        this.content = this.querySelector('.component-content');
    }

    // Parameter Management
    addParameter(name, config) {
        this.parameters.set(name, {
            value: config.defaultValue,
            type: config.type,
            min: config.min,
            max: config.max,
            callback: config.onChange
        });
        
        // Notify inspector to update
        this.dispatchEvent(new CustomEvent('parameterAdded', {
            detail: { name, config }
        }));
    }

    setParameter(name, value) {
        const param = this.parameters.get(name);
        if (param) {
            param.value = value;
            if (param.callback) param.callback(value);
            
            this.dispatchEvent(new CustomEvent('parameterChanged', {
                detail: { name, value }
            }));
        }
    }

    // Script Management
    addScript(name, code) {
        this.scripts.set(name, code);
        try {
            // Create function from code
            const func = new Function('component', code);
            // Execute with this component as context
            func(this);
            
            this.dispatchEvent(new CustomEvent('scriptAdded', {
                detail: { name, code }
            }));
        } catch (error) {
            console.error(`Error in script ${name}:`, error);
        }
    }

    // Style Management
    addStyle(name, css) {
        this.styles.set(name, css);
        
        const styleId = `style-${name}-${this.id}`;
        let styleElement = this.querySelector(`#${styleId}`);
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            this.appendChild(styleElement);
        }
        
        styleElement.textContent = css;
        
        this.dispatchEvent(new CustomEvent('styleAdded', {
            detail: { name, css }
        }));
    }

    // Preset Management
    async loadPreset(preset) {
        // Clear existing configuration
        this.content.innerHTML = '';
        this.parameters.clear();
        this.scripts.clear();
        this.styles.clear();

        // Load new configuration
        if (preset.parameters) {
            Object.entries(preset.parameters).forEach(([name, config]) => {
                this.addParameter(name, config);
            });
        }

        if (preset.scripts) {
            Object.entries(preset.scripts).forEach(([name, code]) => {
                this.addScript(name, code);
            });
        }

        if (preset.styles) {
            Object.entries(preset.styles).forEach(([name, css]) => {
                this.addStyle(name, css);
            });
        }

        if (preset.template) {
            this.content.innerHTML = preset.template;
        }
    }

    // Save current configuration as preset
    saveAsPreset() {
        return {
            parameters: Object.fromEntries(this.parameters),
            scripts: Object.fromEntries(this.scripts),
            styles: Object.fromEntries(this.styles),
            template: this.content.innerHTML
        };
    }
}

customElements.define('modular-component', ModularComponent);