// managers/ProjectManager.js
export default class ProjectManager {
    constructor(engineWindow, componentManager) {
        this.engineWindow = engineWindow;
        this.componentManager = componentManager;
    }

    updateProjectNavigator() {
        const list = this.engineWindow.querySelector('.component-list');
        list.innerHTML = '';
        
        this.componentManager.components.forEach((data, id) => {
            const item = document.createElement('div');
            item.className = 'component-list-item';
            item.innerHTML = `
                <span class="component-name">${data.type}</span>
                <button class="delete-btn">×</button>
            `;
            
            if (this.componentManager.selectedComponent === data.element) {
                item.classList.add('selected');
            }

            item.querySelector('.component-name').onclick = () => {
                this.componentManager.selectComponent(data.element);
            };

            item.querySelector('.delete-btn').onclick = (e) => {
                e.stopPropagation();
                this.componentManager.deleteComponent(id);
            };

            list.appendChild(item);
        });
    }

    spawnComponent(type, x, y) {
        this.componentManager.spawnComponent(type, x, y);
        this.updateProjectNavigator();
    }
}