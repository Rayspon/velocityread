import express from 'express';
import path from 'path';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // We are recreating the logic here because Vercel Serverless environment handles file uploads completely differently
  // than standard Express. Our `api/ocr.ts` is strictly for Vercel, this handles AI Studio / standard Node environments.
  const upload = multer({ storage: multer.memoryStorage() });
  app.post('/api/ocr', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
      }

      const apiKey = process.env.OPEN_ROUTER_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'OPEN_ROUTER_API_KEY is missing' });
      }

      const base64Data = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "meta-llama/llama-3.2-11b-vision-instruct:free",
          "messages": [
            {
              "role": "user",
              "content": [
                { "type": "text", "text": "Extract all the readable text from this image exactly as written. Return ONLY the extracted text, with no markdown formatting, no preambles, and no conversational filler." },
                { "type": "image_url", "image_url": { "url": `data:${mimeType};base64,${base64Data}` } }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenRouter Error:', errorData);
        return res.status(502).json({ error: `OpenRouter API Error: ${errorData}` });
      }

      const data = await response.json();
      const extractedText = data.choices?.[0]?.message?.content;

      res.json({ text: extractedText });
    } catch (error) {
      console.error('OCR Error:', error);
      res.status(500).json({ error: 'Failed to extract text from image' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
