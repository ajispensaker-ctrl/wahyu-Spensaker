import React, { useState } from 'react';
import { QuizQuestion, AnswerType } from '../types';
import { Plus, Trash2, Play, Sparkles, FileText, Check, ListPlus, BookOpen } from 'lucide-react';
import { DEFAULT_PACKS } from '../data/defaultQuestions';

interface QuestionInputScreenProps {
  questions: QuizQuestion[];
  onStartQuiz: (configuredQuestions: QuizQuestion[], title: string) => void;
  onOpenAiGenerator: () => void;
}

export const QuestionInputScreen: React.FC<QuestionInputScreenProps> = ({
  questions: initialQuestions,
  onStartQuiz,
  onOpenAiGenerator,
}) => {
  const [list, setList] = useState<QuizQuestion[]>(initialQuestions);
  const [quizTitle, setQuizTitle] = useState<string>('Kuis Interaktif Kelas');
  const [inputTab, setInputTab] = useState<'form' | 'bulk'>('form');

  const [questionText, setQuestionText] = useState<string>('');
  const [answerKey, setAnswerKey] = useState<AnswerType>('BENAR');
  const [explanation, setExplanation] = useState<string>('');
  const [formula, setFormula] = useState<string>('');

  const [bulkText, setBulkText] = useState<string>(
    `1. Fungsi Nested IF digunakan untuk memeriksa banyak kondisi logika secara berurutan? | BENAR | Nested IF memeriksa kondisi bertingkat
2. Fungsi SUMIF digunakan untuk menghitung jumlah total data berdasarkan kriteria tertentu? | BENAR | SUMIF menjumlahkan dengan syarat kriteria
3. Fungsi VLOOKUP digunakan untuk mencari nilai secara mendatar atau horizontal? | SALAH | VLOOKUP vertikal, HLOOKUP horizontal
4. Tombol F4 pada keyboard berfungsi mengunci alamat sel menjadi absolut bertanda dollar ($)? | BENAR | F4 mengubah rujukan sel menjadi $A$1
5. Fitur Filter di Excel berfungsi untuk mengurutkan data dari A ke Z? | SALAH | Mengurutkan adalah Sort, Filter untuk menyaring data`
  );

  const handleAddSingle = () => {
    if (!questionText.trim()) return;
    const newQ: QuizQuestion = {
      id: `q-${Date.now()}`,
      q: questionText.trim(),
      ans: answerKey,
      explanation: explanation.trim() || `Jawaban resmi: ${answerKey}.`,
      formula: formula.trim() || undefined,
      category: 'Input Guru',
    };
    setList([...list, newQ]);
    setQuestionText('');
    setExplanation('');
    setFormula('');
    setAnswerKey('BENAR');
  };

  const handleParseBulk = () => {
    const lines = bulkText.split('\n').filter((l) => l.trim().length > 0);
    const parsed: QuizQuestion[] = [];

    lines.forEach((line, idx) => {
      let q = line;
      let ans: AnswerType = 'BENAR';
      let exp = '';
      let fml = '';

      if (line.includes('|')) {
        const parts = line.split('|').map((p) => p.trim());
        q = parts[0]?.replace(/^\d+[\.\)]\s*/, '') || '';
        const rawAns = parts[1]?.toUpperCase() || '';
        ans = rawAns.includes('SALAH') || rawAns.includes('FALSE') ? 'SALAH' : 'BENAR';
        exp = parts[2] || `Kunci jawaban: ${ans}`;
        fml = parts[3] || '';
      } else if (line.toUpperCase().includes('BENAR') || line.toUpperCase().includes('SALAH')) {
        const isSalah = line.toUpperCase().includes('SALAH') || line.toUpperCase().includes('FALSE');
        ans = isSalah ? 'SALAH' : 'BENAR';
        q = line.replace(/[-–—]?\s*(BENAR|SALAH|TRUE|FALSE)\s*$/i, '').replace(/^\d+[\.\)]\s*/, '').trim();
        exp = `Jawaban tepat adalah ${ans}.`;
      } else {
        q = line.replace(/^\d+[\.\)]\s*/, '').trim();
      }

      if (q) {
        parsed.push({
          id: `bulk-${Date.now()}-${idx}`,
          q,
          ans,
          explanation: exp || `Konsep materi terkait jawaban ${ans}.`,
          formula: fml || undefined,
          category: 'Input Cepat',
        });
      }
    });

    if (parsed.length > 0) {
      setList(parsed);
      setInputTab('form');
    }
  };

  const handleLoadExcelTemplate = () => {
    const pack = DEFAULT_PACKS[0];
    setList(pack.questions);
    setQuizTitle(pack.title);
  };

  const handleDelete = (id: string) => {
    setList(list.filter((item) => item.id !== id));
  };

  const handleStart = () => {
    if (list.length === 0) {
      alert('Harap masukkan minimal 1 soal terlebih dahulu!');
      return;
    }
    onStartQuiz(list, quizTitle || 'Kuis Interaktif IFP');
  };

  return (
    <div className="h-full w-full max-w-5xl mx-auto flex flex-col justify-between py-2 px-2 select-none overflow-hidden">
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-lg shrink-0">
            IFP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">Input Soal Kuis Kelas</h2>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
                Mode Input Langsung
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ketik atau tempel soal langsung untuk dimainkan di kamera fullscreen & layar sentuh
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadExcelTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pakai Template Excel</span>
          </button>
          <button
            type="button"
            onClick={onOpenAiGenerator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white text-xs font-bold transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Buat Soal</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 my-2.5 flex-1 min-h-0">
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-2.5">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setInputTab('form')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    inputTab === 'form' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ketik Soal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputTab('bulk')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    inputTab === 'bulk' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  <span>Tempel Banyak (Bulk)</span>
                </button>
              </div>

              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="Judul Materi..."
                className="bg-slate-950 border border-slate-800 text-slate-200 px-2.5 py-1 rounded-lg text-xs font-semibold outline-none focus:border-emerald-500 w-36"
              />
            </div>

            {inputTab === 'form' ? (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Pernyataan Soal:</label>
                  <textarea
                    rows={3}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Contoh: Fungsi VLOOKUP digunakan untuk mencari data vertikal pada kolom pertama?"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Kunci Jawaban:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAnswerKey('BENAR')}
                      className={`py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border-2 transition cursor-pointer ${
                        answerKey === 'BENAR'
                          ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Kunci: BENAR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnswerKey('SALAH')}
                      className={`py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border-2 transition cursor-pointer ${
                        answerKey === 'SALAH'
                          ? 'bg-rose-950 border-rose-400 text-rose-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span>✕</span>
                      <span>Kunci: SALAH</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-0.5">Pembahasan (Opsional):</label>
                    <input
                      type="text"
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      placeholder="Alasan mengapa..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-0.5">Rumus Terkait (Opsional):</label>
                    <input
                      type="text"
                      value={formula}
                      onChange={(e) => setFormula(e.target.value)}
                      placeholder="=VLOOKUP(...)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-emerald-300 outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Tempel Baris Soal (Format: Soal | BENAR/SALAH | Pembahasan):
                </label>
                <textarea
                  rows={7}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-200 font-mono outline-none focus:border-emerald-400"
                />
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800">
            {inputTab === 'form' ? (
              <button
                type="button"
                disabled={!questionText.trim()}
                onClick={handleAddSingle}
                className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambahkan Soal</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleParseBulk}
                className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Muat Baris Soal</span>
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white">
              Daftar Soal Siap Dimainkan ({list.length} Soal):
            </span>
            {list.length > 0 && (
              <button
                type="button"
                onClick={() => setList([])}
                className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                Kosongkan
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 my-2 pr-1 space-y-1.5">
            {list.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                <FileText className="w-8 h-8 mb-1 opacity-40" />
                <p className="text-xs text-slate-400">Belum ada soal</p>
                <p className="text-[11px]">Ketik soal di kiri atau klik "Pakai Template Excel"</p>
              </div>
            ) : (
              list.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-start justify-between gap-2 text-xs"
                >
                  <div className="flex items-start gap-2 flex-1">
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 font-mono text-[9px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      {idx + 1}
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            item.ans === 'BENAR'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {item.ans}
                        </span>
                        <span className="font-semibold text-slate-200">{item.q}</span>
                      </div>
                      {item.formula && (
                        <code className="text-[9px] font-mono text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded block w-fit">
                          {item.formula}
                        </code>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400">
              Format: Layar Sentuh & Kamera Fullscreen IFP
            </span>
            <button
              type="button"
              disabled={list.length === 0}
              onClick={handleStart}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-emerald-500/30 transition transform hover:scale-105 active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>Mulai Kuis Layar Penuh 🚀</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
