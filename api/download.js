import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { filename, file_url } = req.query;
    
    if (!file_url) {
      return res.status(400).json({ error: 'Missing file_url parameter' });
    }

    // Decode the file URL
    const decodedFileUrl = decodeURIComponent(file_url);
    
    // Get file from Telegram
    const response = await axios.get(decodedFileUrl, {
      responseType: 'stream',
      timeout: 60000, // Longer timeout for downloads
    });

    // Set headers for download
    const sanitizedFilename = filename ? filename.replace(/[^a-zA-Z0-9.-]/g, '_') : 'download';
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFilename}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }

    // Stream the file for download
    response.data.pipe(res);
    
  } catch (error) {
    console.error('Download error:', error.message);
    res.status(500).json({ 
      error: 'Failed to download file',
      details: error.message 
    });
  }
}