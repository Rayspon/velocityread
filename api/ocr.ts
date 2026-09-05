import express from 'express';

const app = express();
app.use(express.json({ limit: '10mb' }));

app.post('/api/ocr', async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const apiKey = process.env.OPEN_ROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OPEN_ROUTER_API_KEY is missing' });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemma-4-31b-it:free",
        "messages": [
          {
            "role": "user",
            "content": [
              { "type": "text", "text": "Extract all the readable text from this image exactly as written. Return ONLY the extracted text, with no markdown formatting, no preambles, and no conversational filler." },
              { "type": "image_url", "image_url": { "url": `data:${mimeType || 'image/jpeg'};base64,${image}` } }
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
