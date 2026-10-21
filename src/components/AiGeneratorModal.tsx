import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { X, Sparkles, Loader2, Play, CheckCircle2 } from 'lucide-react';

interface AiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyQuestions: (newQuestions: QuizQuestion[], topicTitle: string) => void;
}

export const AiGeneratorModal: React.FC<AiGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApplyQuestions,
}) => {
  const [topic, setTopic] = useState<string>('Fungsi Logika IF Bersarang dan Rumus VLOOKUP');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<string>('Menengah (SMP/SMA/SMK)');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedList, setGeneratedList] = useState<QuizQuestion[] | null>(null);

  if (!isOpen) return null;

  const quickPillTopics = [
    'Fungsi Logika IF & Nested IF',
    'VLOOKUP & HLOOKUP untuk Pemula',
    'Shortcut Keyboard Cepat Excel',
    'Fungsi Teks (LEFT, RIGHT, MID, CONCAT)',
    'SUMIF dan COUNTIF dengan Kriteria',
    'Analisis Pivot Table & Filter Data',
  ];

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          count: questionCount,
          level: difficulty,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal membuat soal dengan AI.');
      }

      // Map generated questions to QuizQuestion format
      const mapped: QuizQuestion[] = (data.questions || []).map((q: any, idx: number) => ({
        id: `ai-${Date.now()}-${idx}`,
        q: q.q,
        ans: q.ans === 'BENAR' ? 'BENAR' : 'SALAH',
        explanation: q.explanation || 'Penjelasan konsep Excel terkait.',
        formula: q.formula || '',
        category: topic,
      }));

      setGeneratedList(mapped);
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat memanggil Gemini API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedList && generatedList.length > 0) {
      onApplyQuestions(generatedList, topic);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Generator Soal Otomatis (Gemini AI)</h3>
              <p className="text-xs text-slate-400">Buat paket kuis Benar/Salah Excel dalam sekejap untuk kelas Anda</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto py-4 space-y-4 pr-1 my-1">
          {/* Quick topic pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Pilih Ide Topik Cepat atau Ketik Sendiri:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickPillTopics.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTopic(item)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition ${
                    topic === item
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Topik Pembelajaran Excel:
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: Rumus XLOOKUP vs VLOOKUP untuk siswa SMK"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {/* Controls: Count & Difficulty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Jumlah Soal:</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
              >
                <option value={3}>3 Soal (Kuis Kilat)</option>
                <option value={5}>5 Soal (Standar Rekomendasi)</option>
                <option value={8}>8 Soal (Latihan Mendalam)</option>
                <option value={10}>10 Soal (Ujian Kelas)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tingkat Kesulitan:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
              >
                <option value="Pemula (Dasar)">Pemula (Dasar / SMP)</option>
                <option value="Menengah (SMP/SMA/SMK)">Menengah (SMP/SMA/SMK)</option>
                <option value="Mahir (Lanjutan)">Mahir (Formula Kompleks)</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            disabled={isLoading || !topic.trim()}
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/30 transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sedang Merancang Soal dengan Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Buat {questionCount} Soal Sekarang</span>
              </>
            )}
          </button>

          {/* Error notice */}
          {error && (
            <div className="bg-rose-950/80 border border-rose-600/50 rounded-xl p-3 text-xs text-rose-200">
              {error}
            </div>
          )}

          {/* Generated Previews */}
          {generatedList && (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {generatedList.length} Soal Berhasil Dibuat:
                </span>
                <span className="text-[11px] text-slate-400">Siap dimainkan di kelas</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {generatedList.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-300">Soal {idx + 1}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.ans === 'BENAR'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {item.ans}
                      </span>
                    </div>
                    <p className="text-slate-200 font-medium mb-1.5">{item.q}</p>
                    {item.formula && (
                      <code className="text-[11px] font-mono text-cyan-300 bg-slate-900 px-2 py-0.5 rounded block w-fit">
                        {item.formula}
                      </code>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {generatedList && (
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/30 transition transform hover:scale-105"
            >
              <Play className="w-4 h-4" />
              <span>Gunakan Soal Ini & Mulai Kuis!</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
