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

// Chuỗi model fallback theo chuẩn api.md (chỉ dùng model GA/stable)
const FALLBACK_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
];

// Model fallback cho Agent Platform API
const AGENT_PLATFORM_FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
];

// Validation: chấp nhận cả AIzaSy... và AQ...
const GOOGLE_AI_API_KEY_PATTERN = /^(?:AIzaSy|AQ)\S{8,}$/;

function isValidGoogleAiApiKey(key: string): boolean {
  return GOOGLE_AI_API_KEY_PATTERN.test(key.trim());
}

// Client factory duy nhất — tất cả tác vụ AI đi qua đây
type AiProvider = 'gemini' | 'agent-platform';

function createGoogleAiClient(apiKey: string, provider: AiProvider = 'gemini'): GoogleGenAI {
  if (provider === 'agent-platform') {
    return new GoogleGenAI({
      vertexai: true,
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    } as any);
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });
}

// Phân loại lỗi API
function parseApiError(error: any): string {
  const message = error?.message || error?.toString() || '';
  const serialized = JSON.stringify(error) || '';

  if (
    serialized.includes('429') ||
    message.includes('RESOURCE_EXHAUSTED') ||
    message.toLowerCase().includes('quota')
  ) return 'QUOTA_EXCEEDED';

  if (
    serialized.includes('503') ||
    message.includes('UNAVAILABLE') ||
    message.toLowerCase().includes('high demand') ||
    message.toLowerCase().includes('overloaded')
  ) return 'MODEL_OVERLOADED';

  if (
    serialized.includes('504') ||
    message.includes('DEADLINE_EXCEEDED')
  ) return 'MODEL_OVERLOADED';

  if (
    serialized.includes('404') ||
    message.includes('NOT_FOUND')
  ) return 'NOT_FOUND';

  if (
    message.includes('API_KEY_INVALID') ||
    message.includes('401') ||
    message.includes('PERMISSION_DENIED') ||
    message.includes('403')
  ) return 'INVALID_API_KEY';

  return 'UNKNOWN';
}

// Sắp xếp model: model ưu tiên trước, sau đó fallback
function getOrderedModels(selectedModel: string | undefined, provider: AiProvider): string[] {
  const fallbackList = provider === 'agent-platform' ? AGENT_PLATFORM_FALLBACK_MODELS : FALLBACK_MODELS;
  if (!selectedModel || !fallbackList.includes(selectedModel)) {
    return selectedModel ? [selectedModel, ...fallbackList] : fallbackList;
  }
  return [selectedModel, ...fallbackList.filter(m => m !== selectedModel)];
}

// API endpoint to proxy Gemini AI requests with model fallback
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, systemInstruction, model, customApiKey, provider } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Nội dung yêu cầu (prompt) không được để trống' });
    }

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: 'Chưa có Gemini API Key. Vui lòng cấu hình trong Secrets hoặc nhập API Key tại phần Cài đặt của ứng dụng.'
      });
    }

    const aiProvider: AiProvider = provider || 'gemini';
    const ai = createGoogleAiClient(apiKey, aiProvider);
    const modelsToTry = getOrderedModels(model, aiProvider);

    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: systemInstruction ? {
            systemInstruction: systemInstruction,
          } : {}
        });

        const text = response.text || '';
        return res.json({ text, modelUsed: modelName });
      } catch (error: any) {
        lastError = error;
        const errorType = parseApiError(error);
        
        // Lỗi auth/key: dừng ngay, không thử model khác
        if (errorType === 'INVALID_API_KEY') {
          console.error(`[${modelName}] Auth error:`, error.message);
          break;
        }
        // Lỗi quota: dừng ngay
        if (errorType === 'QUOTA_EXCEEDED') {
          console.error(`[${modelName}] Quota exceeded:`, error.message);
          break;
        }
        // Model overloaded hoặc not found: thử model tiếp theo
        if (errorType === 'MODEL_OVERLOADED' || errorType === 'NOT_FOUND') {
          console.warn(`[${modelName}] ${errorType}, trying next model...`);
          continue;
        }
        // Lỗi không xác định: dừng
        console.error(`[${modelName}] Unknown error:`, error.message);
        break;
      }
    }

    // Tất cả model đều thất bại
    const msg = lastError?.message || 'Lỗi khi gọi Gemini AI';
    const errorType = parseApiError(lastError);
    let status = 500;
    if (errorType === 'INVALID_API_KEY') status = 401;
    else if (errorType === 'QUOTA_EXCEEDED') status = 429;

    return res.status(status).json({ error: msg });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: error?.message || 'Lỗi khi gọi Gemini AI' });
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
