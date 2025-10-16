import { PackageGenerator } from './package-generator.js';
import fsp from 'fs/promises';
import path from 'path';

async function testTemplate() {
    console.log('🧪 Testing template directory...');
    
    // Check from root directory
    const templateDir = path.join(process.cwd(), '..', 'package-template');
    console.log('📁 Looking for template at:', templateDir);
    
    try {
        // Check if template directory exists
        await fsp.access(templateDir);
        console.log('✅ Template directory exists');
        
        // List all files
        const files = await readDirectoryRecursive(templateDir);
        console.log(`📁 Found ${files.length} files in template:`);
        
        for (const file of files) {
            const relativePath = path.relative(templateDir, file);
            const stats = await fsp.stat(file);
            console.log(`   ${relativePath} (${Math.round(stats.size / 1024)} KB)`);
        }
        
        // Test package generation
        console.log('\n🧪 Testing package generation...');
        const generator = new PackageGenerator();
        const testConfig = {
            mazeRooms: 5,
            trainingSteps: 10000,
            algorithm: 'PPO',
            saveLocation: 'local'
        };
        
        const result = await generator.generatePackage(testConfig);
        console.log('✅ Package generation test completed:', result);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

async function readDirectoryRecursive(dir) {
    const files = [];
    
    async function scanDirectory(currentDir) {
        const items = await fsp.readdir(currentDir, { withFileTypes: true });
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item.name);
            
            if (item.isDirectory()) {
                await scanDirectory(fullPath);
            } else {
                files.push(fullPath);
            }
        }
    }
    
    await scanDirectory(dir);
    return files;
}

testTemplate();