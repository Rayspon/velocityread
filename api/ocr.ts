import Busboy from 'busboy';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.OPEN_ROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPEN_ROUTER_API_KEY is missing' });
  }

  let fileData: Buffer | null = null;
  let fileMimeType = '';

  const busboy = Busboy({ headers: req.headers });

  busboy.on('file', (name: any, file: any, info: any) => {
    const { mimeType } = info;
    fileMimeType = mimeType;
    const buffers: Buffer[] = [];
    file.on('data', (data: Buffer) => {
      buffers.push(data);
    });
    file.on('end', () => {
      fileData = Buffer.concat(buffers);
    });
  });

  busboy.on('finish', async () => {
    if (!fileData) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    try {
      const base64Data = fileData.toString('base64');

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
                { "type": "image_url", "image_url": { "url": `data:${fileMimeType};base64,${base64Data}` } }
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

      res.status(200).json({ text: extractedText });
    } catch (error) {
      console.error('OCR Error:', error);
      res.status(500).json({ error: 'Failed to extract text from image' });
    }
  });

  req.pipe(busboy);
}
