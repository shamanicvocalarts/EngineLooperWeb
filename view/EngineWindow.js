import { Grid } from './ui/Grid.js';
import { Inspector } from './ui/Inspector.js';
import { ProjectNavigator } from './ui/ProjectNavigator.js';
import { ComponentManager } from './managers/ComponentManager.js';
import { componentRegistry } from './components/registry/componentRegistry.js';

class EngineWindow extends HTMLElement {
    constructor(patchConnection) {
        super();
        this.currentMode = 'edit';
        this.patchConnection = patchConnection;
        this.canvas = null;
        this.ctx = null;
        this.inspector = null;
        this.projectNavigator = null;
        this.componentManager = null;
        
        this.initialize();
        this.setupResizeObserver();
    }

    async initialize() {
        try {
            await this.initializeRegistry();
            await this.initializeUI();
            await this.initializeInspector();
        } catch (err) {
            console.error('Initialization error:', err);
        }
    }

    async initializeRegistry() {
        await componentRegistry.initialize();
    }

    async initializeInspector() {
        const rightPanel = this.querySelector('.right-panel');
        if (!rightPanel) {
            throw new Error('Right panel not found for inspector initialization');
        }
        this.inspector = new Inspector(rightPanel);
    }

    async initializeUI() {
        this.innerHTML = `
            <div class="engine-window">
                <div class="left-panel-container"></div>
                <div class="main-area">
                    <canvas id="editor-canvas"></canvas>
                </div>
                <div class="right-panel">
                </div>
            </div>
    
            <style>
                .engine-window {
                    display: flex;
                    width: 100%;
                    height: 100%;
                    background: #2a2a2a;
                    color: #fff;
                    position: relative;
                }
                    
                .main-area {
                    flex: 1;
                    position: relative;
                }
                    
            #editor-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
                cursor: default;
            }

                        #editor-canvas.panning {
                cursor: move;
            }
        
                .left-panel-container, .right-panel {
                    width: 250px;
                    background: #1a1a1a;
                    padding: 1rem;
                    overflow-y: auto;
                       overflow-x: hidden; 
                    position: relative;
                    z-index: 100;
                }

                .component-wrapper {
                    z-index: 10;
                    position: relative;
                }
            </style>
        `;
    
        this.componentManager = new ComponentManager(
            this.querySelector('.main-area'),
            {
                getPatchConnection: () => this.patchConnection,
                getCurrentMode: () => this.currentMode,
                onComponentsChanged: () => this.updateProjectNavigator(),
                onComponentSelected: (element, data) => {
                    this.inspector?.updateComponent(element, data);
                }
            }
        );

        this.projectNavigator = new ProjectNavigator(
            this.querySelector('.left-panel-container'),
            {
                onSelect: (element) => this.componentManager.selectComponent(element),
                onDelete: (id) => this.componentManager.deleteComponent(id),
                onSpawn: (type) => this.handleSpawnComponent(type),
                onModeChange: (mode) => this.setMode(mode)
            }
        );

        const coreComponents = componentRegistry.getComponentsByFolder('core');
        this.projectNavigator.updateSpawnerButtons(coreComponents);

        this.setupCanvas();
        this.setupEventListeners();
    }

    handleSpawnComponent(type) {
        const componentConfig = componentRegistry.get(type);
        this.componentManager.spawnComponent(type, componentConfig);
    }

    setMode(mode) {
        this.currentMode = mode;
        this.projectNavigator.setMode(mode);
        this.componentManager.updateMode(mode);
    
        const container = this.querySelector('.engine-window');
        container.classList.remove('edit-mode', 'play-mode');
        container.classList.add(`${mode}-mode`);
    }

    setupCanvas() {
        this.canvas = this.querySelector('#editor-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.grid = new Grid(this.canvas, this.ctx);
        this.resizeCanvas();
    }

    setupEventListeners() {
        this.addEventListener('click', (e) => {
            const component = e.target.closest('[data-component-instance]');
            if (component) {
                this.componentManager.selectComponent(component);
            }
        });
    }

    setupResizeObserver() {
        const resizeObserver = new ResizeObserver(() => {
            this.resizeCanvas();
        });
        resizeObserver.observe(this);
    }

    resizeCanvas() {
        if (this.canvas) {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.grid.resize(rect.width, rect.height);
        }
    }

    updateProjectNavigator() {
        this.projectNavigator?.updateComponentList(
            this.componentManager.getComponents(),
            this.componentManager.getSelectedComponent()
        );
    }

    updateScale() {
        const containerWidth = this.clientWidth;
        const containerHeight = this.clientHeight;
        const mainContainer = this.querySelector('.engine-window');

        if (mainContainer) {
            mainContainer.style.width = `${containerWidth}px`;
            mainContainer.style.height = `${containerHeight}px`;

            const mainArea = this.querySelector('.main-area');
            if (mainArea) {
                const leftPanel = this.querySelector('.left-panel');
                const rightPanel = this.querySelector('.right-panel');
                const availableWidth = containerWidth - 
                    (leftPanel ? leftPanel.offsetWidth : 0) - 
                    (rightPanel ? rightPanel.offsetWidth : 0);
                
                mainArea.style.width = `${availableWidth}px`;
                mainArea.style.height = `${containerHeight}px`;
            }
        }
    }
}

window.customElements.define("engine-window", EngineWindow);

export default function createPatchView(patchConnection) {
    return new EngineWindow(patchConnection);
}