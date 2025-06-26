// Vercel Serverless Function for /api/generate
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { repoUrl, apiKey } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: 'Repository URL is required' });
    }

    // For now, return success with template selection
    // This will use the aeLTD template engine
    const siteData = {
      success: true,
      message: 'Site generated successfully',
      template: 'liquid-metal-commerce', // Always use premium template
      repoUrl,
      generatedAt: new Date().toISOString()
    };

    return res.status(200).json(siteData);
  } catch (error) {
    console.error('Generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate site',
      message: error.message 
    });
  }
}