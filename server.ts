import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Inisialisasi Google GenAI SDK (Server-Side)
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Endpoint untuk cek status API
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Endpoint untuk generate soal kuis Excel / TIK dengan Gemini AI
app.post('/api/generate-questions', async (req, res) => {
  try {
    const { topic = 'Fungsi Excel Dasar dan Menengah', count = 5, level = 'Menengah' } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        error: 'Kunci GEMINI_API_KEY belum tersedia di server. Menggunakan bank soal bawaan.',
      });
    }

    const ai = aiClient || new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `Buatlah ${count} soal kuis pilihan Benar atau Salah (True/False) dalam Bahasa Indonesia tentang topik: "${topic}".
Tingkat kesulitan: ${level}.
Target audiens: Siswa kelas pembelajaran komputer / informatika / TIK / Excel sekolah yang menggunakan layar interaktif IFP.
Setiap soal harus jelas, memicu pemahaman konsep nyata rumus atau fitur Excel (seperti IF, VLOOKUP, SUMIF, Absolute Reference, shortcut, dsb).
Sertakan penjelasan singkat rumus atau konsepnya dan contoh rumus sintaks jika relevan.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Anda adalah guru dan ahli materi Excel & TIK bersertifikasi. Buat soal kuis interaktif tipe Benar/Salah (BENAR / SALAH) yang akurat secara teknis, mendidik, dan menyenangkan untuk siswa.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'Daftar soal kuis Benar/Salah Excel',
          items: {
            type: Type.OBJECT,
            properties: {
              q: {
                type: Type.STRING,
                description: 'Pernyataan soal dalam bahasa Indonesia yang harus ditebak BENAR atau SALAH',
              },
              ans: {
                type: Type.STRING,
                description: 'Jawaban tepat: harus tepat string "BENAR" atau "SALAH"',
              },
              explanation: {
                type: Type.STRING,
                description: 'Penjelasan mengapa jawaban tersebut BENAR atau SALAH secara konsep Excel',
              },
              formula: {
                type: Type.STRING,
                description: 'Contoh rumus atau formula Excel terkait (opsional, kosongkan jika tidak ada)',
              },
            },
            required: ['q', 'ans', 'explanation'],
          },
        },
      },
    });

    const text = response.text?.trim() || '[]';
    const questions = JSON.parse(text);

    return res.json({
      success: true,
      questions,
    });
  } catch (err: any) {
    console.error('Error generating questions with Gemini:', err);
    return res.status(500).json({
      error: err?.message || 'Gagal membuat soal dengan AI.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Kuis Excel Interaktif IFP berjalan pada http://0.0.0.0:${PORT}`);
  });
}

startServer();
