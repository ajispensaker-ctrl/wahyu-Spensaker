import React from 'react';
import { QuizQuestion, AnswerType } from '../types';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Lightbulb, Code, Target, Award } from 'lucide-react';

interface ExplanationCardProps {
  question: QuizQuestion;
  classChoice: AnswerType | 'NETRAL' | null;
  onNextQuestion: () => void;
  onRepeatQuestion: () => void;
  isLastQuestion: boolean;
}

export const ExplanationCard: React.FC<ExplanationCardProps> = ({
  question,
  classChoice,
  onNextQuestion,
  onRepeatQuestion,
  isLastQuestion,
}) => {
  const isCorrect = classChoice === question.ans;

  return (
    <div className="w-full bg-slate-900/95 backdrop-blur-xl border-2 border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
      {/* Top Banner: Ketepatan Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
              isCorrect
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                : 'bg-rose-500 text-white shadow-rose-500/30'
            }`}
          >
            {isCorrect ? <CheckCircle2 className="w-6 h-6 stroke-[2.5]" /> : <XCircle className="w-6 h-6 stroke-[2.5]" />}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-sm sm:text-base font-black tracking-tight px-2.5 py-0.5 rounded-md ${
                  isCorrect
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-rose-950 text-rose-300 border border-rose-700'
                }`}
              >
                {isCorrect ? '🎯 KETEPATAN: 100% TEPAT & AKURAT' : '❌ KETEPATAN: KURANG TEPAT (KELIRU)'}
              </span>
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                {isCorrect ? '+100 Poin Kelas' : '0 Poin'}
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-1 flex items-center gap-3 flex-wrap font-mono">
              <span>
                Pilihan Siswa:{' '}
                <strong
                  className={
                    classChoice === 'BENAR'
                      ? 'text-emerald-400'
                      : classChoice === 'SALAH'
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }
                >
                  {classChoice || 'Tidak Terdeteksi (Netral)'}
                </strong>
              </span>
              <span>•</span>
              <span>
                Kunci Jawaban Resmi:{' '}
                <strong className={question.ans === 'BENAR' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {question.ans}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <button
            type="button"
            onClick={onRepeatQuestion}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ulangi Soal</span>
          </button>
          <button
            type="button"
            onClick={onNextQuestion}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/25 transition transform hover:scale-105 active:scale-95"
          >
            <span>{isLastQuestion ? 'Lihat Hasil Akhir 🏆' : 'Soal Berikutnya ➡️'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Explanation & Formula Body */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Conceptual Reasoning */}
        <div className="md:col-span-2 bg-slate-950/70 rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Analisis Konsep Excel:</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              {question.explanation}
            </p>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Target className="w-3 h-3 text-cyan-400" />
            <span>Kategori: {question.category || 'Excel IFP'}</span>
          </div>
        </div>

        {/* Formula Box */}
        {question.formula && (
          <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 mb-1">
                <Code className="w-3.5 h-3.5" />
                <span>Rumus / Sintaks Terkait:</span>
              </div>
              <code className="text-xs font-mono text-emerald-300 block bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-700/80 break-all select-all">
                {question.formula}
              </code>
            </div>
            <div className="text-[10px] text-slate-400 mt-2 font-mono">
              Siswa dapat mencatat rumus di atas.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
