import { PackageGenerator } from '../../package-generator.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { config } = req.body;
        
        // Validate config
        if (!config || !config.mazeRooms || !config.trainingSteps) {
            return res.status(400).json({ error: 'Invalid configuration' });
        }

        // Generate package
        const generator = new PackageGenerator();
        const packageInfo = await generator.generatePackage(config);
        
        res.status(200).json({
            success: true,
            packageId: packageInfo.packageId,
            message: 'Package generated successfully',
            downloadUrl: `/api/download/${packageInfo.packageId}`,
            config: packageInfo.config
        });
        
    } catch (error) {
        console.error('Package generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate package',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}