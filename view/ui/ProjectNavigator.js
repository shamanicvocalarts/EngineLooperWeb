// ProjectNavigator.js

/**
 * ProjectNavigator handles the entire left panel including:
 * - Project component listing
 * - Component spawner buttons
 * - Selection & deletion management
 * Changes:
 * - Added component spawner section
 * - Moved HTML/CSS from EngineWindow
 * - Added spawner callbacks
 */
export class ProjectNavigator {
    constructor(parentElement, callbacks) {
        if (!parentElement) {
            throw new Error('Parent element must be provided to ProjectNavigator constructor');
        }
        
        this.element = null;
        this.callbacks = callbacks;
        this.initializeUI(parentElement);
    }

    initializeUI(parentElement) {
        this.element = document.createElement('div');
        this.element.className = 'left-panel';
        
        this.element.innerHTML = `
            <div class="project-navigator">
                <div class="panel-header">
                    <h3>Project</h3>
                    <div class="mode-switcher">
                        <button class="mode-button active" data-mode="edit">Edit</button>
                        <button class="mode-button" data-mode="play">Play</button>
                    </div>
                </div>
                <div class="component-list"></div>
            </div>
            <div class="component-spawner">
                <h3>Components</h3>
                <div class="spawn-buttons"></div>
            </div>

            <style>
                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #333;
                }
    
                .panel-header h3 {
                    margin: 0;
                    padding: 0;
                    border: none;
                }
    
                .mode-switcher {
                    display: flex;
                    gap: 4px;
                }
    
                .mode-button {
                    padding: 4px 8px;
                    font-size: 0.8rem;
                    border: 1px solid #444;
                    background: #333;
                    color: #fff;
                    cursor: pointer;
                }
    
                .mode-button.active {
                    background: #4CAF50;
                }
                .left-panel {
                    width: 250px;
                    background: #1a1a1a;
                    padding: 1rem;
                    overflow-y: auto;
                }

                .project-navigator {
                    margin-bottom: 2rem;
                }

                h3 {
                    margin-top: 0;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #333;
                    color: #fff;
                }

                .component-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .component-list-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.5rem;
                    background: #2a2a2a;
                    border: 1px solid #333;
                    color: #fff;
                }

                .component-list-item.selected {
                    border-color: #4CAF50;
                    background: #2d3b2d;
                }

                .component-name {
                    cursor: pointer;
                    flex-grow: 1;
                }

                .delete-btn {
                    background: none;
                    border: none;
                    color: #ff4444;
                    cursor: pointer;
                    font-size: 1.2em;
                    padding: 0 0.5rem;
                }

                .delete-btn:hover {
                    color: #ff6666;
                }

                .spawn-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                
                .spawn-buttons button {
                    padding: 0.5rem;
                    background: #333;
                    border: 1px solid #444;
                    color: #fff;
                    cursor: pointer;
                }
                
                .spawn-buttons button:hover {
                    background: #444;
                }
            </style>
        `;

        parentElement.appendChild(this.element);
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Set up component spawner buttons
        const spawner = this.element.querySelector('.spawn-buttons');
        if (spawner) {
            spawner.addEventListener('click', (e) => {
                if (e.target.matches('button') && this.callbacks.onSpawn) {
                    const componentType = e.target.dataset.component;
                    this.callbacks.onSpawn(componentType);
                }
            });
        }
        this.element.querySelector('.mode-switcher').addEventListener('click', (e) => {
            if (e.target.classList.contains('mode-button')) {
                if (this.callbacks.onModeChange) {
                    this.callbacks.onModeChange(e.target.dataset.mode);
                }
            }
        });   
    }

    setMode(mode) {
        // Update button states
        this.element.querySelectorAll('.mode-button').forEach(button => {
            button.classList.toggle('active', button.dataset.mode === mode);
        });
    }

    /**
     * Updates the spawner buttons based on registry
     * - Takes array of component definitions
     * - Updates spawn button list 
     */
    updateSpawnerButtons(components) {
        const spawner = this.element.querySelector('.spawn-buttons');
        if (!spawner) return;

        spawner.innerHTML = `
            <div class="component-group">
                <h4>Core Components</h4>
                ${components.map(name => `
                    <button data-component="${name}">${name}</button>
                `).join('')}
            </div>
        `;
    }

    /**
     * Updates the component listing
     * - Takes map of components and selected component
     * - Updates project navigator list
     */
    updateComponentList(components, selectedComponent) {
        const list = this.element.querySelector('.component-list');
        list.innerHTML = '';
        
        components.forEach((data, id) => {
            const item = document.createElement('div');
            item.className = 'component-list-item';
            
            if (selectedComponent === data.element) {
                item.classList.add('selected');
            }

            item.innerHTML = `
                <span class="component-name">${data.type}</span>
                <button class="delete-btn">×</button>
            `;
            
            // Set up event listeners
            item.querySelector('.component-name').onclick = () => {
                if (this.callbacks.onSelect) {
                    this.callbacks.onSelect(data.element);
                }
            };

            item.querySelector('.delete-btn').onclick = (e) => {
                e.stopPropagation();
                if (this.callbacks.onDelete) {
                    this.callbacks.onDelete(id);
                }
            };

            list.appendChild(item);
        });
    }
}