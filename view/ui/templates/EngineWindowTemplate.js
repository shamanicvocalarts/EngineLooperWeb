// src/ui/templates/EngineWindowTemplate.js
export const engineWindowTemplate = `
    <div class="engine-window">
        <div class="left-panel">
            <div class="project-navigator">
                <h3>Project</h3>
                <div class="component-list"></div>
            </div>
            <div class="component-spawner">
                <div class="spawn-buttons">
                </div>
            </div>
        </div>
        
        <div class="main-area">
            <canvas id="editor-canvas"></canvas>
        </div>
        
        <div class="right-panel">
            <div class="inspector">
                <h3>Inspector</h3>
                <div class="inspector-content"></div>
            </div>
        </div>
    </div>
`;

export const engineWindowStyles = `
    .engine-window {
        display: flex;
        width: 100%;
        height: 100%;
        background: #2a2a2a;
        color: #fff;
    }
    
    .left-panel, .right-panel {
        width: 250px;
        background: #1a1a1a;
        padding: 1rem;
        overflow-y: auto;
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
    
    h3 {
        margin-top: 0;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #333;
    }
`;