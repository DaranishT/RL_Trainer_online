import express from 'express';
import cors from 'cors';
import { PackageGenerator } from './package-generator.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// API Routes
// In the generate-package route, update the response:
app.post('/api/generate-package', async (req, res) => {
    try {
        const { config } = req.body;
        
        console.log('📦 Generating package with config:', config);
        
        if (!config || !config.mazeRooms || !config.trainingSteps) {
            return res.status(400).json({ error: 'Invalid configuration' });
        }

        const generator = new PackageGenerator();
        const packageInfo = await generator.generatePackage(config);
        
        res.json({
            success: true,
            packageId: packageInfo.packageId,
            message: 'Package generated successfully',
            downloadUrl: `/api/download/${packageInfo.packageId}`,
            config: packageInfo.config,
            size: packageInfo.size // This is now in MB
        });
        
    } catch (error) {
        console.error('Package generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate package',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
app.get('/api/download/:packageId', async (req, res) => {
    try {
        const { packageId } = req.params;
        const filePath = path.join(__dirname, 'generated-packages', `${packageId}.zip`);
        
        console.log(`⬇️ Download request for package: ${packageId}`);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Package not found' });
        }

        // Set download headers
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="RLMazeTrainer_${packageId}.zip"`);
        res.setHeader('Content-Length', fs.statSync(filePath).size);
        
        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        
        fileStream.on('error', (error) => {
            console.error('File stream error:', error);
            res.status(500).json({ error: 'Download failed' });
        });
        
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Download failed' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📁 API available at http://localhost:${PORT}/api`);
    console.log(`📦 Package generation enabled`);
});