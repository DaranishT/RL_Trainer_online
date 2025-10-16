import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    const { packageId } = req.query;

    if (!packageId) {
        return res.status(400).json({ error: 'Package ID required' });
    }

    try {
        const filePath = path.join(process.cwd(), 'generated-packages', `${packageId}.zip`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Package not found' });
        }

        // Set headers for file download
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="RLMazeTrainer_${packageId}.zip"`);
        
        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Download failed' });
    }
}