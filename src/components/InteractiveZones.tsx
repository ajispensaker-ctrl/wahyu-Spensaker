import React from 'react';
import { AnswerType, QuizStage } from '../types';
import { CheckCircle2, XCircle, Hand, Sparkles } from 'lucide-react';

interface InteractiveZonesProps {
  currentZone: 'LEFT' | 'RIGHT' | 'NEUTRAL';
  stage: QuizStage;
  correctAnswer: AnswerType;
  selectedAnswer: AnswerType | null;
  leftEnergy: number;
  rightEnergy: number;
  personX: number | null;
  onSelectZone: (zone: AnswerType) => void;
}

export const InteractiveZones: React.FC<InteractiveZonesProps> = ({
  currentZone,
  stage,
  correctAnswer,
  selectedAnswer,
  leftEnergy,
  rightEnergy,
  personX: _personX,
  onSelectZone,
}) => {
  const isLeftActive = currentZone === 'LEFT' || selectedAnswer === 'BENAR';
  const isRightActive = currentZone === 'RIGHT' || selectedAnswer === 'SALAH';

  const isRevealed = stage === 'revealed' || stage === 'completed';
  const isLocked = stage === 'locked';

  const isLeftCorrect = correctAnswer === 'BENAR';
  const isRightCorrect = correctAnswer === 'SALAH';

  return (
    <div className="w-full flex flex-col gap-2.5 select-none">
      {/* ================= COMPACT TOUCH BUTTONS (BELOW PICTURE) ================= */}
      <div className="grid grid-cols-2 gap-4">
        {/* Tombol Sentuh IFP: BENAR (Kiri) */}
        <button
          type="button"
          disabled={isLocked || isRevealed}
          onClick={() => onSelectZone('BENAR')}
          className={`group relative rounded-2xl px-5 py-3.5 sm:py-4 flex items-center justify-between text-left transition-all duration-200 border-2 shadow-lg overflow-hidden cursor-pointer ${
            isRevealed
              ? isLeftCorrect
                ? 'bg-emerald-600 text-slate-950 border-emerald-300 ring-4 ring-emerald-400/40 shadow-emerald-500/30 scale-[1.01]'
                : 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-40 scale-[0.99]'
              : isLeftActive
              ? 'bg-emerald-950/90 border-emerald-400 ring-4 ring-emerald-500/30 text-white shadow-emerald-500/20 scale-[1.01]'
              : 'bg-slate-900/80 border-emerald-700/50 hover:border-emerald-400 hover:bg-emerald-950/40 text-slate-200'
          }`}
        >
          {/* Ambient Glow */}
          <div
            className={`absolute -left-10 -top-10 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-opacity ${
              isLeftActive || (isRevealed && isLeftCorrect) ? 'bg-emerald-500/30 opacity-100' : 'opacity-0'
            }`}
          />

          {/* Left Icon & Text */}
          <div className="flex items-center gap-3.5 z-10">
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                isRevealed && isLeftCorrect
                  ? 'bg-slate-950 text-emerald-400 scale-110'
                  : isLeftActive
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-emerald-950/80 text-emerald-400 border border-emerald-600/40'
              }`}
            >
              {isRevealed && isLeftCorrect ? (
                <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
              ) : isRevealed && !isLeftCorrect ? (
                <XCircle className="w-6 h-6 opacity-60" />
              ) : (
                <span className="text-xl sm:text-2xl font-black">✓</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xl sm:text-2xl font-black tracking-tight uppercase ${
                    isRevealed && isLeftCorrect
                      ? 'text-slate-950'
                      : isLeftActive
                      ? 'text-emerald-300'
                      : 'text-white'
                  }`}
                >
                  BENAR
                </span>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                    isRevealed && isLeftCorrect
                      ? 'bg-slate-950/80 text-emerald-300'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  }`}
                >
                  [ ← / A ]
                </span>
              </div>
              <div
                className={`text-xs mt-0.5 flex items-center gap-1.5 ${
                  isRevealed && isLeftCorrect
                    ? 'text-slate-900 font-bold'
                    : 'text-emerald-300/80'
                }`}
              >
                <Hand className="w-3 h-3" />
                <span>
                  {isRevealed
                    ? isLeftCorrect
                      ? '🎯 Kunci Jawaban Tepat!'
                      : 'Bukan Jawaban Tepat'
                    : isLeftActive
                    ? '✓ Terpilih oleh Siswa'
                    : 'Sentuh IFP atau Berdiri di Kiri'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Energy / Detection Pill */}
          <div className="hidden sm:flex flex-col items-end gap-1 z-10">
            <span
              className={`text-xs font-semibold ${
                isRevealed && isLeftCorrect
                  ? 'text-slate-950'
                  : isLeftActive
                  ? 'text-emerald-300'
                  : 'text-slate-400'
              }`}
            >
              {isLeftActive ? 'Siswa Aktif' : 'Sisi Kiri'}
            </span>
            <div className="w-20 bg-slate-950/60 h-1.5 rounded-full overflow-hidden border border-emerald-900/50">
              <div
                style={{ width: `${Math.max(isLeftActive ? 85 : 0, leftEnergy)}%` }}
                className="h-full bg-emerald-400 transition-all duration-200"
              />
            </div>
          </div>
        </button>

        {/* Tombol Sentuh IFP: SALAH (Kanan) */}
        <button
          type="button"
          disabled={isLocked || isRevealed}
          onClick={() => onSelectZone('SALAH')}
          className={`group relative rounded-2xl px-5 py-3.5 sm:py-4 flex items-center justify-between text-left transition-all duration-200 border-2 shadow-lg overflow-hidden cursor-pointer ${
            isRevealed
              ? isRightCorrect
                ? 'bg-emerald-600 text-slate-950 border-emerald-300 ring-4 ring-emerald-400/40 shadow-emerald-500/30 scale-[1.01]'
                : 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-40 scale-[0.99]'
              : isRightActive
              ? 'bg-rose-950/90 border-rose-400 ring-4 ring-rose-500/30 text-white shadow-rose-500/20 scale-[1.01]'
              : 'bg-slate-900/80 border-rose-700/50 hover:border-rose-400 hover:bg-rose-950/40 text-slate-200'
          }`}
        >
          {/* Ambient Glow */}
          <div
            className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-opacity ${
              isRightActive || (isRevealed && isRightCorrect) ? 'bg-rose-500/30 opacity-100' : 'opacity-0'
            }`}
          />

          {/* Left Icon & Text */}
          <div className="flex items-center gap-3.5 z-10">
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                isRevealed && isRightCorrect
                  ? 'bg-slate-950 text-emerald-400 scale-110'
                  : isRightActive
                  ? 'bg-rose-500 text-slate-950 font-black'
                  : 'bg-rose-950/80 text-rose-400 border border-rose-600/40'
              }`}
            >
              {isRevealed && isRightCorrect ? (
                <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
              ) : isRevealed && !isRightCorrect ? (
                <XCircle className="w-6 h-6 opacity-60" />
              ) : (
                <span className="text-xl sm:text-2xl font-black">✕</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xl sm:text-2xl font-black tracking-tight uppercase ${
                    isRevealed && isRightCorrect
                      ? 'text-slate-950'
                      : isRightActive
                      ? 'text-rose-300'
                      : 'text-white'
                  }`}
                >
                  SALAH
                </span>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                    isRevealed && isRightCorrect
                      ? 'bg-slate-950/80 text-emerald-300'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                  }`}
                >
                  [ → / D ]
                </span>
              </div>
              <div
                className={`text-xs mt-0.5 flex items-center gap-1.5 ${
                  isRevealed && isRightCorrect
                    ? 'text-slate-900 font-bold'
                    : 'text-rose-300/80'
                }`}
              >
                <Hand className="w-3 h-3" />
                <span>
                  {isRevealed
                    ? isRightCorrect
                      ? '🎯 Kunci Jawaban Tepat!'
                      : 'Bukan Jawaban Tepat'
                    : isRightActive
                    ? '✓ Terpilih oleh Siswa'
                    : 'Sentuh IFP atau Berdiri di Kanan'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Energy / Detection Pill */}
          <div className="hidden sm:flex flex-col items-end gap-1 z-10">
            <span
              className={`text-xs font-semibold ${
                isRevealed && isRightCorrect
                  ? 'text-slate-950'
                  : isRightActive
                  ? 'text-rose-300'
                  : 'text-slate-400'
              }`}
            >
              {isRightActive ? 'Siswa Aktif' : 'Sisi Kanan'}
            </span>
            <div className="w-20 bg-slate-950/60 h-1.5 rounded-full overflow-hidden border border-rose-900/50">
              <div
                style={{ width: `${Math.max(isRightActive ? 85 : 0, rightEnergy)}%` }}
                className="h-full bg-rose-400 transition-all duration-200"
              />
            </div>
          </div>
        </button>
      </div>

      {/* ================= BAR KETEPATAN & KESEIMBANGAN POSISI SISWA ================= */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-300">
            Status Ketepatan Jawaban:{' '}
            {isRevealed ? (
              <strong
                className={
                  (selectedAnswer || (currentZone === 'LEFT' ? 'BENAR' : currentZone === 'RIGHT' ? 'SALAH' : null)) ===
                  correctAnswer
                    ? 'text-emerald-400 font-bold'
                    : 'text-rose-400 font-bold'
                }
              >
                {(selectedAnswer || (currentZone === 'LEFT' ? 'BENAR' : currentZone === 'RIGHT' ? 'SALAH' : null)) ===
                correctAnswer
                  ? '✅ 100% TEPAT (Akurasi Sempurna)'
                  : `❌ KELIRU (Kunci yang Tepat: ${correctAnswer})`}
              </strong>
            ) : isLocked ? (
              <strong className="text-amber-400">
                🔒 Pilihan Terkunci pada {selectedAnswer || (currentZone === 'LEFT' ? 'BENAR' : currentZone === 'RIGHT' ? 'SALAH' : 'NETRAL')}. Mengevaluasi...
              </strong>
            ) : (
              <strong className="text-slate-200">
                {currentZone === 'LEFT' || selectedAnswer === 'BENAR'
                  ? '👈 Posisi Kelas condong ke BENAR'
                  : currentZone === 'RIGHT' || selectedAnswer === 'SALAH'
                  ? '👉 Posisi Kelas condong ke SALAH'
                  : '⚖️ Posisi Kelas Netral (Silakan geser ke Kiri atau Kanan)'}
              </strong>
            )}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span>Kiri (BENAR): {leftEnergy}%</span>
          <span>•</span>
          <span>Kanan (SALAH): {rightEnergy}%</span>
        </div>
      </div>
    </div>
  );
};
