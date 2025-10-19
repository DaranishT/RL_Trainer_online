export default async function handler(req, res) {
  const { packageId } = req.query;

  if (!packageId) {
    return res.status(400).json({ error: 'Package ID required' });
  }

  try {
    // For now, return success - we'll handle file streaming later
    res.json({
      success: true,
      message: 'Download ready',
      packageId: packageId
    });
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
}
