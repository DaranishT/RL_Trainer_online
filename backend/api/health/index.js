export default async function handler(req, res) {
  res.status(200).json({
    status: 'OK',
    service: 'RL Maze Trainer API',
    timestamp: new Date().toISOString()
  });
}
