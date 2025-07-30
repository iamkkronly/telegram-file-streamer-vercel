export default function handler(req, res) {
  res.status(200).json({
    message: "Telegram File Streaming Service",
    version: "1.0.0",
    endpoints: {
      streaming: "/watch/{filename}?file_url={encoded_telegram_url}",
      download: "/download/{filename}?file_url={encoded_telegram_url}"
    },
    status: "Active"
  });
}