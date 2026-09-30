import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to initialize Google Gen AI
function getAIClient(clientApiKey?: string) {
  const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API endpoint to proxy Gemini AI requests safely
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, systemInstruction, model, customApiKey } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Nội dung yêu cầu (prompt) không được để trống' });
    }

    const ai = getAIClient(customApiKey);
    if (!ai) {
      return res.status(400).json({
        error: 'Chưa có Gemini API Key. Vui lòng cấu hình trong Secrets hoặc nhập API Key tại phần Cài đặt của ứng dụng.'
      });
    }

    // Supported modern models from guidelines
    const modelToUse = model || 'gemini-3.8-flash';

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: prompt,
      config: systemInstruction ? {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      } : {
        temperature: 0.7,
      }
    });

    const text = response.text || '';
    return res.json({ text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    const msg = error?.message || 'Lỗi khi gọi Gemini AI';
    let status = 500;
    if (msg.includes('403') || msg.includes('API_KEY_INVALID') || msg.includes('401')) {
      status = 401;
    } else if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
      status = 429;
    }
    return res.status(status).json({ error: msg });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasEnvKey: !!process.env.GEMINI_API_KEY });
});

// Vite middleware in development or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
