import express from 'express';
import multer from 'multer';

const app = express();
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

export default app;
