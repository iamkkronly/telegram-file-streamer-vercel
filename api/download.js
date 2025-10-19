// [2025-07-27] Code by Kaustav Ray

import axios from 'axios';
import { Readable } from 'stream';
// IMPORTANT: TDL ya koi aur Node.js Client Library import karein.
// import { Client as TdClient } from 'tdl'; 

// Telegram Bot API Token ko Vercel Environment Variable se load karein
const BOT_TOKEN = process.env.BOT_TOKEN; 

/**
 * Ye function file ke extension ke aadhar par Content-Type nirdharit karta hai.
 * (Aapke purane code se liya gaya logic)
 * @param {string} filename 
 * @returns {string} Content-Type header value
 */
const getContentType = (filename) => {
    // Purana MIME Type mapping yahan dal dein (Jaise ki tele stream vercel.pdf mein tha)
    const mimeTypes = {
        'mp4': 'video/mp4',
        'avi': 'video/x-msvideo',
        'mkv': 'video/x-matroska',
        'mov': 'video/quicktime',
        'webm': 'video/webm',
        'mp3': 'audio/mpeg',
        'ogg': 'audio/ogg',
        'flac': 'audio/flac',
        'pdf': 'application/pdf',
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        'apk': 'application/vnd.android.package-archive',
        'jpg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        // Add more types as needed
    };

    if (!filename) return 'application/octet-stream';

    const ext = filename.toLowerCase().split('.').pop();
    return mimeTypes[ext] || 'application/octet-stream';
};


export default async function handler(req, res) {
    let response;
    let fileLength;

    try {
        // Naye aur purane dono parameters ko accept karein
        const { filename, file_url, file_id, api_id, api_hash } = req.query;

        const sanitizedFilename = filename ? filename.replace(/[^a-zA-Z0-9.-]/g, '_') : 'download';

        if (file_id) {
            // --- NEW LOGIC: BADE FILES KE LIYE (CLIENT API) ---
            
            // Render bot ab yeh parameters bhej raha hai: https://vercel.app/.../filename?file_id={id}&api_id={id}&api_hash={hash}
            
            if (!API_ID || !API_HASH) {
                return res.status(500).json({ error: "Server Configuration Error: API_ID or API_HASH missing in Vercel environment variables." });
            }

            // **YAHAN PAR TDL/Pyrogram Client Code AAYEGA**
            
            // Is code ko replace karein: client_api.stream_file(file_id, api_id, api_hash)
            
            // **Temporary Code (Simulation)**
            fileLength = 461600000; 
            const simulatedStream = new Readable({ read() {} });
            simulatedStream.push(Buffer.from(`Simulated file data for ID: ${file_id}. Implement TDL/Client API streaming here.`));
            simulatedStream.push(null); 
            
            response = {
                data: simulatedStream,
                headers: { 'content-length': fileLength }
            };
            // **End Temporary Code**

        } else if (file_url) {
            // --- OLD LOGIC: CHOTE FILES KE LIYE (BOT API) ---
            
            // Ye logic 20MB tak ki files ke liye kaam karta rahega.
            const decodedFileUrl = decodeURIComponent(file_url);

            // Telegram Bot API URL mein BOT_TOKEN shamil hona chahiye
            if (!BOT_TOKEN) {
                throw new Error("BOT_TOKEN is required for Bot API downloads.");
            }

            // Get file from Telegram Bot API URL
            response = await axios.get(decodedFileUrl, {
                responseType: 'stream',
                timeout: 60000,
            });
            fileLength = response.headers['content-length'];

        } else {
            // Agar koi bhi zaroori parameter nahi mila
            return res.status(400).json({ 
                error: 'Missing file_id or file_url parameter.',
                details: 'For large files, ensure file_id, api_id, and api_hash are passed.'
            });
        }

        // --- COMMON RESPONSE HEADERS ---

        res.setHeader('Content-Type', getContentType(sanitizedFilename));
        // Download ke liye attachment header set karein
        res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFilename}"`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // No caching for files
        
        if (fileLength) {
            res.setHeader('Content-Length', fileLength);
        }

        // Stream the file
        response.data.pipe(res);

    } catch (error) {
        console.error('Download error:', error.message);
        res.status(500).json({ 
            error: 'Failed to download file',
            details: error.message 
        });
    }
}

