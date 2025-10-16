import archiver from 'archiver';
import path from 'path';

export class PackageGenerator {
    constructor() {
        // In Vercel, we load template files into memory
        this.templateFiles = this.getTemplateFiles();
    }
    
    async generatePackage(userConfig) {
        // In Vercel, we can't write files to disk, so we create the archive in memory
        return new Promise((resolve, reject) => {
            const archive = archiver('zip', { 
                zlib: { level: 9 }
            });

            const chunks = [];
            let fileCount = 0;

            archive.on('data', (chunk) => chunks.push(chunk));
            archive.on('end', () => {
                const buffer = Buffer.concat(chunks);
                console.log(`✅ Package created: ${fileCount} files, ${buffer.length} bytes`);
                resolve({
                    packageId: this.generatePackageId(),
                    buffer: buffer,
                    size: Math.round(buffer.length / 1024 / 1024),
                    fileCount: fileCount,
                    config: userConfig
                });
            });
            
            archive.on('error', (err) => {
                console.error('❌ Archive error:', err);
                reject(err);
            });

            archive.on('entry', (entry) => {
                fileCount++;
                console.log(`📄 Added: ${entry.name}`);
            });

            try {
                // Add template files from memory
                this.addTemplateFiles(archive, userConfig);
                archive.finalize();
                
            } catch (error) {
                console.error('❌ Package generation error:', error);
                reject(error);
            }
        });
    }
    
    addTemplateFiles(archive, userConfig) {
        for (const [filePath, content] of Object.entries(this.templateFiles)) {
            let fileContent = content;
            
            // Customize files based on user configuration
            fileContent = this.customizeFile(fileContent, userConfig, path.basename(filePath));
            
            archive.append(fileContent, { name: filePath });
        }
    }
    
    customizeFile(content, config, filename) {
        let customized = content;
        
        // Update training parameters in Python files
        if (filename === 'train_sphere_agent.py' || filename === 'rl-maze-trainer-gui.py') {
            customized = customized.replace(/total_timesteps\s*=\s*\d+/, `total_timesteps = ${config.trainingSteps}`);
            customized = customized.replace(/maze_rooms\s*=\s*\d+/, `maze_rooms = ${config.mazeRooms}`);
            customized = customized.replace(/algorithm\s*=\s*["'][^"']*["']/, `algorithm = "${config.algorithm}"`);
        }
        
        // Update game configuration in JavaScript files
        if (filename.endsWith('.js')) {
            customized = customized.replace(/mazeRooms:\s*\d+/, `mazeRooms: ${config.mazeRooms}`);
            customized = customized.replace(/trainingSteps:\s*\d+/, `trainingSteps: ${config.trainingSteps}`);
            customized = customized.replace(/algorithm:\s*['"][^'"]*['"]/, `algorithm: '${config.algorithm}'`);
        }
        
        // Update instructions and text-based files
        if (filename.endsWith('.txt') || filename.endsWith('.bat')) {
            customized = customized.replace(/{{MAZE_ROOMS}}/g, config.mazeRooms);
            customized = customized.replace(/{{TRAINING_STEPS}}/g, config.trainingSteps.toLocaleString());
            customized = customized.replace(/{{ALGORITHM}}/g, config.algorithm);
            customized = customized.replace(/{{GENERATION_DATE}}/g, new Date().toLocaleString());
        }
        
        return customized;
    }
    
    generatePackageId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    getTemplateFiles() {
        // In a real implementation, you would load these from a database
        // or pre-bundle them during build. For demo, we define them here.
        return {
            'INSTRUCTIONS.txt': this.getInstructionsTemplate(),
            'start-gui.bat': this.getBatchTemplate(),
            'rl-maze-trainer-gui.py': this.getGuiTemplate()
        };
    }
    
    getInstructionsTemplate() {
        return `RL MAZE TRAINER - CUSTOM PACKAGE
        
Your Configuration:
- Maze Rooms: {{MAZE_ROOMS}}
- Training Steps: {{TRAINING_STEPS}}
- AI Algorithm: {{ALGORITHM}}

Instructions:
1. Extract all files from this ZIP archive.
2. Run the "start-gui.bat" file.
3. In the control panel that appears, click "START TRAINING".

Generated: {{GENERATION_DATE}}`;
    }
    
    getBatchTemplate() {
        return `@echo off
title RL Maze Trainer GUI
echo Starting RL Maze Trainer Control Panel...
python rl-maze-trainer-gui.py
pause`;
    }
    
    getGuiTemplate() {
        return `# RL Maze Trainer GUI
# This is a placeholder for the full GUI script.
# Your custom settings have been applied below.

import time

print("===================================")
print("  RL MAZE TRAINER - CONTROL PANEL  ")
print("===================================")
print(f"Algorithm: {{ALGORITHM}}")
print(f"Training Steps: {{TRAINING_STEPS}}")
print(f"Maze Complexity: {{MAZE_ROOMS}} rooms")
print("\\n-----------------------------------\\n")
print("This is a demo GUI.")
print("In the full package, this would be a graphical application.")
print("It would launch the game and training scripts automatically.")
print("\\nSimulating training start...\\n")
time.sleep(2)
print("...Connecting to game engine...")
time.sleep(2)
print("...Starting training process...")
print("\\nTRAINING IN PROGRESS (DEMO)")
print("Check the console for live updates from the AI agent.")
`;
    }
}
