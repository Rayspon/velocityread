import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json({ limit: '15mb' }));

// List of free vision models on OpenRouter in order of preference
const FREE_VISION_MODELS = [
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'qwen/qwen3.8-27b:free',
  'dots-studio/dots-3-note-preview:free',
  'thinkingmachines/inkling-small:free',
  'thinkingmachines/inkling:free',
  'openrouter/free',
];

const handleOcr = async (req: Request, res: Response) => {
  try {
    const { image, mimeType } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const cleanMimeType = mimeType || 'image/jpeg';
    const extractionPrompt =
      'Extract all the readable text from this image exactly as written. Return ONLY the extracted text, with no markdown formatting, no commentary, and no introductory or concluding remarks.';

    // 1. First priority: Check for GEMINI_API_KEY (100% Free at https://aistudio.google.com/app/apikey)
    // Direct Gemini API has dedicated free quota (15 requests/min) without shared OpenRouter pool rate limits.
    if (process.env.GEMINI_API_KEY) {
      const geminiModels = ['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
      let lastGeminiErr: any = null;

      for (const geminiModel of geminiModels) {
        try {
          const ai = new GoogleGenAI();
          const response = await ai.models.generateContent({
            model: geminiModel,
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: cleanMimeType,
                    data: image,
                  },
                },
                {
                  text: extractionPrompt,
                },
              ],
            },
          });

          const extractedText = response.text?.trim();
          if (extractedText) {
            return res.json({ text: extractedText, provider: 'gemini-free', model: geminiModel });
          }
        } catch (geminiError: any) {
          lastGeminiErr = geminiError;
          console.warn(`Gemini model ${geminiModel} failed:`, geminiError?.message || geminiError);
        }
      }

      // If all Gemini models failed and OPEN_ROUTER_API_KEY is not available
      if (!process.env.OPEN_ROUTER_API_KEY) {
        return res.status(500).json({
          error: `Gemini API Error: ${lastGeminiErr?.message || 'Failed to extract text'}`,
        });
      }
    }

    // 2. Second priority: OpenRouter with automatic multi-model free fallback
    const openRouterKey = process.env.OPEN_ROUTER_API_KEY;
    if (!openRouterKey) {
      return res.status(500).json({
        error:
          'No API key configured. You can fix this completely for free:\n' +
          'Option A: Add a free GEMINI_API_KEY from https://aistudio.google.com/app/apikey to your Vercel Environment Variables.\n' +
          'Option B: Add OPEN_ROUTER_API_KEY to your environment variables.',
      });
    }

    let lastError = '';
    // Try free vision models in sequence; if one is rate-limited (429) or unavailable (404/503), try the next
    for (const model of FREE_VISION_MODELS) {
      try {
        const orResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://velocity-reader.app',
            'X-Title': 'Velocity Reader OCR',
          },
          body: JSON.stringify({
            model: model,
            models: FREE_VISION_MODELS, // OpenRouter fallback routing
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: extractionPrompt },
                  {
                    type: 'image_url',
                    image_url: { url: `data:${cleanMimeType};base64,${image}` },
                  },
                ],
              },
            ],
          }),
        });

        if (orResponse.ok) {
          const data = await orResponse.json();
          const extractedText = data.choices?.[0]?.message?.content?.trim();
          if (extractedText) {
            return res.json({ text: extractedText, modelUsed: model });
          }
        }

        const errText = await orResponse.text();
        lastError = errText;
        console.warn(`Model ${model} returned error status ${orResponse.status}:`, errText);

        // If not rate-limited and not 404, we continue to the next model anyway
      } catch (err: any) {
        lastError = err?.message || String(err);
        console.warn(`Model ${model} fetch failed:`, lastError);
      }
    }

    // If all free models were tried and failed
    return res.status(502).json({
      error:
        `All OpenRouter free vision models are currently busy or rate-limited.\n\n` +
        `HOW TO FIX THIS FOR FREE:\n` +
        `1. Get a 100% free Google AI Studio key at https://aistudio.google.com/app/apikey (no credit card needed).\n` +
        `2. EITHER add it to OpenRouter under Settings > Integrations (https://openrouter.ai/settings/integrations) so OpenRouter uses your own private free quota instead of the shared pool;\n` +
        `3. OR add GEMINI_API_KEY directly into your Vercel Project Environment Variables.\n\n` +
        `Last upstream error: ${lastError}`,
    });
  } catch (error: any) {
    console.error('OCR Error:', error);
    res.status(500).json({ error: error?.message || 'Failed to extract text from image' });
  }
};

// Support both path variants (direct /api/ocr and root / for Vercel serverless functions)
app.post('/api/ocr', handleOcr);
app.post('/', handleOcr);

export default app;
