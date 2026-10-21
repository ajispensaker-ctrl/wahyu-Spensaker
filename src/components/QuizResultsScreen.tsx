import React, { useEffect, useState } from 'react';
import { QuestionResult } from '../types';
import { Trophy, CheckCircle2, XCircle, RotateCcw, Copy, Check, Sparkles, BookOpen } from 'lucide-react';
import { fireCelebrationConfetti } from '../utils/confetti';
import { soundFx } from '../utils/audio';

interface QuizResultsScreenProps {
  results: QuestionResult[];
  packTitle: string;
  classNameTitle: string;
  onRestart: () => void;
  onChooseNewPack: () => void;
}

export const QuizResultsScreen: React.FC<QuizResultsScreenProps> = ({
  results,
  packTitle,
  classNameTitle,
  onRestart,
  onChooseNewPack,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const totalQuestions = results.length;
  const correctCount = results.filter((r) => r.isCorrect).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const avgTime =
    totalQuestions > 0
      ? (results.reduce((acc, r) => acc + r.timeSpent, 0) / totalQuestions).toFixed(1)
      : '0';

  useEffect(() => {
    fireCelebrationConfetti();
    soundFx.playFanfare();
  }, []);

  const handleCopyReport = () => {
    const lines = [
      `📊 LAPORAN KUIS EXCEL INTERAKTIF IFP`,
      `🏫 Kelas: ${classNameTitle || 'Seluruh Kelas'}`,
      `📚 Paket Soal: ${packTitle}`,
      `🏆 Skor Kelas: ${correctCount} / ${totalQuestions} Soal Benar (${accuracy}%)`,
      `⏱️ Waktu Rata-rata per Soal: ${avgTime} detik`,
      `---------------------------------------`,
      ...results.map(
        (r, idx) =>
          `${idx + 1}. [${r.isCorrect ? '✅ TEPAT' : '❌ SALAH'}] ${r.question.q} (Kunci: ${r.question.ans})`
      ),
      `---------------------------------------`,
      `Dibuat dengan Aplikasi Kuis Excel Interaktif IFP MediaPipe.`,
    ];

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  let titleBadge = 'Hebat! Kerja Sama Kelas Juara!';
  if (accuracy >= 85) titleBadge = '🌟 Juara Master Spreadsheet!';
  else if (accuracy >= 70) titleBadge = '👏 Pemahaman Excel Sangat Baik!';
  else if (accuracy >= 50) titleBadge = '💪 Terus Semangat Berlatih Rumus!';
  else titleBadge = '📖 Butuh Ulasan Konsep Bersama Guru';

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500 overflow-hidden flex flex-col max-h-[85vh]">
      {/* Top Trophy Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
            <Trophy className="w-9 h-9" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-800/60 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {titleBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Kuis Selesai! Kerja Luar Biasa
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {packTitle} • {classNameTitle}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin Laporan Kelas'}</span>
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/30 transition transform hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Mainkan Lagi</span>
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 font-medium">Skor Akurasi</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1">
            {accuracy}%
          </div>
        </div>
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 font-medium">Jawaban Tepat</span>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
            {correctCount} / {totalQuestions}
          </div>
        </div>
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 font-medium">Waktu Rata-rata</span>
          <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono mt-1">
            {avgTime}s
          </div>
        </div>
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 font-medium">Metode Sensor</span>
          <div className="text-sm font-bold text-slate-200 mt-2">
            MediaPipe Pose
          </div>
        </div>
      </div>

      {/* Questions Recap */}
      <div className="overflow-y-auto flex-1 pr-1 space-y-2.5 my-2">
        <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>Rangkuman Evaluasi Seluruh Soal:</span>
        </div>

        {results.map((res, idx) => (
          <div
            key={res.question.id || idx}
            className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 text-xs transition ${
              res.isCorrect
                ? 'bg-emerald-950/30 border-emerald-800/40'
                : 'bg-rose-950/30 border-rose-800/40'
            }`}
          >
            <div className="flex items-start gap-2.5 flex-1">
              <div className="mt-0.5">
                {res.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-200">Soal {idx + 1}:</span>
                  <span className="text-slate-100">{res.question.q}</span>
                </div>
                <p className="text-[11px] text-slate-400">{res.question.explanation}</p>
                {res.question.formula && (
                  <code className="text-[10px] font-mono text-cyan-300 bg-slate-950 px-2 py-0.5 rounded block w-fit border border-slate-800">
                    {res.question.formula}
                  </code>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  res.question.ans === 'BENAR'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                Kunci: {res.question.ans}
              </span>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                Pilihan Kelas: {res.classChoice || 'Netral'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={onChooseNewPack}
          className="text-xs text-slate-400 hover:text-white underline font-medium"
        >
          ← Ganti Paket Soal Lain
        </button>
        <span className="text-[11px] text-slate-500 font-mono">
          Interactive Flat Panel (IFP) Classroom Quiz Engine
        </span>
      </div>
    </div>
  );
};
