// managers/ComponentManager.js
import Waveform from '../components/core/Waveform/Waveform.js';
import  Meters  from '../components/core/Meters/Meters.js';
import ButtonGrid from '../components/core/ButtonGrid/ButtonGrid.js';
import Sliders from '../components/core/Sliders/Sliders.js';
import InfoPane from '../components/core/InfoPane/InfoPane.js';
import { ModularComponent } from '../components/base/ModularComponent.js';


export class ComponentManager {
    constructor(mainContainer, callbacks) {
        this.mainContainer = mainContainer;
        this.callbacks = callbacks;
        this.components = new Map();
        this.selectedComponent = null;
        this.canvasOffset = { x: 0, y: 0 };
    
        // Listen for canvas pan events
        mainContainer.querySelector('canvas').addEventListener('canvaspanned', (e) => {
            this.handleCanvasPan(e.detail);
        });
    }

    handleCanvasPan({ dx, dy, offsetX, offsetY }) {
        this.canvasOffset = { x: offsetX, y: offsetY };
        
        // Update all component positions
        this.components.forEach((data) => {
            const element = data.element;
            const currentLeft = parseInt(element.style.left);
            const currentTop = parseInt(element.style.top);
            
            element.style.left = `${currentLeft + dx}px`;
            element.style.top = `${currentTop + dy}px`;
        });
    }

// ComponentManager.js
async spawnComponent(type, componentConfig, patchConnection) {
    if (!componentConfig) {
        console.error(`Unknown component type: ${type}`);
        return;
    }

    const componentId = `${type}-${Date.now()}`;
    const wrapper = document.createElement('div');
    wrapper.dataset.componentInstance = componentId;
    wrapper.style.position = 'absolute';
    wrapper.style.left = '50px';
    wrapper.style.top = '50px';
    wrapper.style.width = '300px';
    wrapper.style.height = '200px';
    wrapper.style.left = `${50 - this.canvasOffset.x}px`;
    wrapper.style.top = `${50 - this.canvasOffset.y}px`;

    let component;
    switch (type) {
        case 'waveform':
            component = new Waveform(patchConnection);
            break;
        case 'meters':
            component = new Meters(patchConnection);
            break;
        case 'buttongrid':
            component = new ButtonGrid(patchConnection);
            break;
        case 'sliders':
            component = new Sliders(patchConnection);
            break;
        case 'infopane':
            component = new InfoPane(patchConnection);
            break;
        case 'modular':
            component = new ModularComponent(patchConnection);
            break;
        default:
            console.error(`Unsupported component type: ${type}`);
            return;
    }

    if (component) {
        wrapper.classList.add('component-wrapper');
        wrapper.appendChild(component);
        this.mainContainer.appendChild(wrapper);

        this.components.set(componentId, {
            element: wrapper,
            type: type,
            position: { x: 50, y: 50 }
        });

        if (this.callbacks.getCurrentMode() === 'edit') {
            this.makeDraggable(wrapper);
            component.setAttribute('disabled', '');
        }

        this.callbacks.onComponentsChanged();
        return wrapper;
    }
}

    deleteComponent(id) {
        const component = this.components.get(id);
        if (component) {
            component.element.remove();
            this.components.delete(id);
            if (this.selectedComponent === component.element) {
                this.selectedComponent = null;
            }
            this.callbacks.onComponentsChanged();
        }
    }

    selectComponent(element) {
        if (this.selectedComponent) {
            this.selectedComponent.style.outline = 'none';
        }
        this.selectedComponent = element;
        element.style.outline = '2px solid #00ff00';
        
        const componentData = this.components.get(element.dataset.componentInstance);
        this.callbacks.onComponentSelected(element, componentData);
    }

    updateMode(mode) {
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
    }

    getComponents() {
        return this.components;
    }

    getSelectedComponent() {
        return this.selectedComponent;
    }

    makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        element.style.cursor = 'move';
        
        element.onmousedown = dragMouseDown;
        
        const self = this;
        
        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            self.selectComponent(element);
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    makeResizable(element) {
        element.querySelectorAll('.resize-handle').forEach(handle => handle.remove());
        
        const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
        handles.forEach(dir => {
            const handle = document.createElement('div');
            handle.className = `resize-handle resize-${dir}`;
            handle.style.cssText = `
                position: absolute;
                width: 8px;
                height: 8px;
                background: #4CAF50;
                border: 1px solid white;
                border-radius: 50%;
                z-index: 1000;
            `;
    
            switch(dir) {
                case 'nw':
                    handle.style.top = '-4px';
                    handle.style.left = '-4px';
                    handle.style.cursor = 'nw-resize';
                    break;
                case 'n':
                    handle.style.top = '-4px';
                    handle.style.left = '50%';
                    handle.style.transform = 'translateX(-50%)';
                    handle.style.cursor = 'n-resize';
                    break;
                case 'ne':
                    handle.style.top = '-4px';
                    handle.style.right = '-4px';
                    handle.style.cursor = 'ne-resize';
                    break;
                case 'e':
                    handle.style.top = '50%';
                    handle.style.right = '-4px';
                    handle.style.transform = 'translateY(-50%)';
                    handle.style.cursor = 'e-resize';
                    break;
                case 'se':
                    handle.style.bottom = '-4px';
                    handle.style.right = '-4px';
                    handle.style.cursor = 'se-resize';
                    break;
                case 's':
                    handle.style.bottom = '-4px';
                    handle.style.left = '50%';
                    handle.style.transform = 'translateX(-50%)';
                    handle.style.cursor = 's-resize';
                    break;
                case 'sw':
                    handle.style.bottom = '-4px';
                    handle.style.left = '-4px';
                    handle.style.cursor = 'sw-resize';
                    break;
                case 'w':
                    handle.style.top = '50%';
                    handle.style.left = '-4px';
                    handle.style.transform = 'translateY(-50%)';
                    handle.style.cursor = 'w-resize';
                    break;
            }
            
            element.appendChild(handle);
        });
    
        element.style.position = 'absolute';
        element.style.boxSizing = 'border-box';
    
        let isResizing = false;
        let currentHandle = null;
        let startX = 0, startY = 0;
        let startWidth = 0, startHeight = 0;
        let startLeft = 0, startTop = 0;
    
        const startResize = (e) => {
            if (!e.target.classList.contains('resize-handle')) return;
            
            isResizing = true;
            currentHandle = e.target.className.split('resize-')[1].split(' ')[0];
            
            const rect = element.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            startWidth = rect.width;
            startHeight = rect.height;
            startLeft = rect.left;
            startTop = rect.top;
    
            e.preventDefault();
            e.stopPropagation();
        };
    
        const resizeMove = (e) => {
            if (!isResizing) return;
    
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
    
            const minSize = 100;
            let newWidth = startWidth;
            let newHeight = startHeight;
            let newLeft = startLeft;
            let newTop = startTop;
    
            switch(currentHandle) {
                case 'e':
                    newWidth = Math.max(minSize, startWidth + dx);
                    break;
                case 'w':
                    newWidth = Math.max(minSize, startWidth - dx);
                    if (newWidth !== startWidth) {
                        newLeft = startLeft + dx;
                    }
                    break;
                case 's':
                    newHeight = Math.max(minSize, startHeight + dy);
                    break;
                case 'n':
                    newHeight = Math.max(minSize, startHeight - dy);
                    if (newHeight !== startHeight) {
                        newTop = startTop + dy;
                    }
                    break;
                case 'se':
                    newWidth = Math.max(minSize, startWidth + dx);
                    newHeight = Math.max(minSize, startHeight + dy);
                    break;
                case 'sw':
                    newWidth = Math.max(minSize, startWidth - dx);
                    newHeight = Math.max(minSize, startHeight + dy);
                    if (newWidth !== startWidth) {
                        newLeft = startLeft + dx;
                    }
                    break;
                case 'ne':
                    newWidth = Math.max(minSize, startWidth + dx);
                    newHeight = Math.max(minSize, startHeight - dy);
                    if (newHeight !== startHeight) {
                        newTop = startTop + dy;
                    }
                    break;
                case 'nw':
                    newWidth = Math.max(minSize, startWidth - dx);
                    newHeight = Math.max(minSize, startHeight - dy);
                    if (newWidth !== startWidth) {
                        newLeft = startLeft + dx;
                    }
                    if (newHeight !== startHeight) {
                        newTop = startTop + dy;
                    }
                    break;
            }
    
            const parentRect = element.parentElement.getBoundingClientRect();
            const relativeLeft = newLeft - parentRect.left;
            const relativeTop = newTop - parentRect.top;
    
            element.style.width = `${newWidth}px`;
            element.style.height = `${newHeight}px`;
            element.style.left = `${relativeLeft}px`;
            element.style.top = `${relativeTop}px`;
    
            const resizableComponents = element.querySelectorAll('audio-waveform, audio-meters, button-grid, audio-sliders');
            resizableComponents.forEach(comp => {
                if (comp.resizeWaveform) comp.resizeWaveform();
                if (comp.resize) comp.resize();
            });
    
            e.preventDefault();
            e.stopPropagation();
        };
    
        const stopResize = () => {
            if (isResizing) {
                isResizing = false;
                currentHandle = null;
            }
        };
    
        element.addEventListener('mousedown', startResize);
        document.addEventListener('mousemove', resizeMove);
        document.addEventListener('mouseup', stopResize);
    
        element._cleanupResize = () => {
            element.removeEventListener('mousedown', startResize);
            document.removeEventListener('mousemove', resizeMove);
            document.removeEventListener('mouseup', stopResize);
        };
    }
}