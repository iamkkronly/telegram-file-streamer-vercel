# Telegram File Streaming Service

A Vercel-hosted file streaming and download service for Telegram bots.

## Features

- **File Streaming**: Stream videos, audio, and documents directly in the browser
- **File Downloads**: Direct download links for any file type
- **Range Request Support**: Enables video seeking and partial content delivery
- **CORS Enabled**: Works from any domain
- **Large File Support**: Handles files up to 5GB
- **Multiple Formats**: Supports all common video, audio, and document formats

## API Endpoints

### Streaming Endpoint
```
GET /watch/{filename}?file_url={encoded_telegram_url}
```
- Returns streamable content with proper MIME types
- Supports HTTP range requests for video scrubbing
- Optimized for browser playback

### Download Endpoint
```
GET /download/{filename}?file_url={encoded_telegram_url}
```
- Forces file download with proper headers
- Sanitizes filenames for security
- Supports large file transfers

## Usage with Telegram Bot

1. Bot receives file from user
2. Bot gets Telegram file URL
3. Bot generates streaming/download links using this service
4. User clicks links to stream or download files

## Deployment

1. Fork this repository
2. Connect to Vercel
3. Deploy automatically
4. Update your bot's BASE_URL to the new Vercel domain

## Technical Details

- **Runtime**: Node.js 18.x
- **Platform**: Vercel Serverless Functions
- **Dependencies**: axios, cors
- **Timeout**: 30s streaming, 60s downloads
- **Security**: URL sanitization, CORS headers

## File Support

### Video Formats
- MP4, AVI, MKV, MOV, WMV, FLV, WebM, M4V

### Audio Formats  
- MP3, WAV, FLAC, AAC, M4A, OGG, WMA

### Document Formats
- PDF, DOC, DOCX, TXT, ZIP, RAR

## Error Handling

- Invalid URLs return 400 error
- Failed downloads return 500 with details
- Timeout protection for large files
- Proper HTTP status codes