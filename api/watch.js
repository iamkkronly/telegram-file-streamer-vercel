import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { filename, file_url } = req.query;
    
    if (!file_url) {
      return res.status(400).json({ error: 'Missing file_url parameter' });
    }

    // Decode the file URL
    const decodedFileUrl = decodeURIComponent(file_url);
    
    // Get file info from Telegram
    const response = await axios.get(decodedFileUrl, {
      responseType: 'stream',
      timeout: 30000,
    });

    // Determine content type based on file extension
    const getContentType = (filename) => {
      if (!filename) return 'application/octet-stream';
      const ext = filename.toLowerCase().split('.').pop();
      
      const mimeTypes = {
        // Video
        'mp4': 'video/mp4',
        'avi': 'video/x-msvideo',
        'mkv': 'video/x-matroska',
        'mov': 'video/quicktime',
        'wmv': 'video/x-ms-wmv',
        'flv': 'video/x-flv',
        'webm': 'video/webm',
        'm4v': 'video/x-m4v',
        
        // Audio
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'flac': 'audio/flac',
        'aac': 'audio/aac',
        'm4a': 'audio/mp4',
        'ogg': 'audio/ogg',
        'wma': 'audio/x-ms-wma',
        
        // Documents
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'txt': 'text/plain',
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
      };
      
      return mimeTypes[ext] || 'application/octet-stream';
    };

    const contentType = getContentType(filename);
    const contentLength = response.headers['content-length'];

    // Set headers for streaming
    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    // Handle range requests for video streaming
    const range = req.headers.range;
    if (range && contentLength) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : parseInt(contentLength) - 1;
      const chunksize = (end - start) + 1;
      
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${contentLength}`);
      res.setHeader('Content-Length', chunksize);
    }

    // Stream the file
    response.data.pipe(res);
    
  } catch (error) {
    console.error('Streaming error:', error.message);
    res.status(500).json({ 
      error: 'Failed to stream file',
      details: error.message 
    });
  }
}