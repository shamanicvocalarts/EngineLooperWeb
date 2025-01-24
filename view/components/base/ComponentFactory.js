// components/base/ComponentFactory.js

import { ModularComponent } from './ModularComponent.js';

export class ComponentFactory {
    constructor() {
        this.presets = new Map();
        this.loadBuiltInPresets();
    }

    async loadBuiltInPresets() {
        // Example built-in preset
        this.registerPreset('empty', {
            name: 'Empty Component',
            parameters: {},
            scripts: {},
            styles: {},
            template: '<div class="empty-component"></div>'
        });

        // We'll add more presets here later
    }

    registerPreset(id, preset) {
        this.presets.set(id, preset);
    }

    async createComponent(presetId = 'empty') {
        const component = new ModularComponent();
        
        if (presetId && this.presets.has(presetId)) {
            await component.loadPreset(this.presets.get(presetId));
        }

        return component;
    }

    getAvailablePresets() {
        return Array.from(this.presets.entries()).map(([id, preset]) => ({
            id,
            name: preset.name
        }));
    }
}