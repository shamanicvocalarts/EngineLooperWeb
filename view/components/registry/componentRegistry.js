// components/registry/componentRegistry.js

import { ComponentFactory } from '../base/ComponentFactory.js';

class ComponentRegistry {
    constructor() {
        this.components = new Map();
        this.componentFolders = ['core'];
        this.componentFactory = new ComponentFactory(); // Add this
    }

    getComponentsByFolder(folder) {
        return Array.from(this.components.entries())
            .filter(([_, config]) => config.folder === folder)
            .map(([name]) => name);
    }

    async initialize() {
        try {
            // Load all core components first
            const components = ['Waveform', 'Meters', 'ButtonGrid', 'Sliders', 'InfoPane'];
            
            for (const componentName of components) {
                try {
                    const module = await import(`../core/${componentName}/${componentName}.js`);
                    if (module.default) {
                        this.register(componentName.toLowerCase(), {
                            constructor: module.default,
                            name: componentName,
                            folder: 'core'
                        });
                    }
                } catch (err) {
                    console.error(`Failed to load component ${componentName}:`, err);
                }
            }

            // Add the modular component
            this.register('modular', {
                constructor: async () => await this.componentFactory.createComponent('empty'),
                name: 'ModularComponent',
                folder: 'core'
            });

        } catch (error) {
            console.error('Error initializing component registry:', error);
        }
    }

    register(name, config) {
        this.components.set(name, config);
        console.log(`Registered component: ${name}`);
    }

    get(name) {
        return this.components.get(name);
    }

    getAllComponents() {
        return Array.from(this.components.values());
    }
}

export const componentRegistry = new ComponentRegistry();