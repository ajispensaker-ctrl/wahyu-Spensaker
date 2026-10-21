import React, { useState } from 'react';
import { QuizStage, TeacherSettings, CameraSettings } from '../types';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Lock,
  Layers,
  Sparkles,
  Sliders,
  Play,
  RotateCcw,
  Volume1,
  FileEdit,
} from 'lucide-react';
import { speakText, stopSpeech } from '../utils/audio';

interface TeacherToolbarProps {
  stage: QuizStage;
  timeLeft: number;
  totalTime: number;
  settings: TeacherSettings;
  cameraSettings: CameraSettings;
  currentQuestionText: string;
  onLockAnswer: () => void;
  onResetQuiz: () => void;
  onToggleSound: () => void;
  onOpenPackSelector: () => void;
  onOpenAiGenerator: () => void;
  onOpenEditor: () => void;
  onOpenCalibration: () => void;
  onSetTimerDuration: (seconds: number) => void;
}

export const TeacherToolbar: React.FC<TeacherToolbarProps> = ({
  stage,
  timeLeft,
  totalTime,
  settings,
  cameraSettings: _cameraSettings,
  currentQuestionText,
  onLockAnswer,
  onResetQuiz,
  onToggleSound,
  onOpenPackSelector,
  onOpenAiGenerator,
  onOpenEditor,
  onOpenCalibration,
  onSetTimerDuration,
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      speakText(currentQuestionText);
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 5000);
    }
  };

  return (
    <footer className="w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
      {/* Left Zone: Status & Live Countdown Timer */}
      <div className="flex items-center gap-3">
        {totalTime > 0 ? (
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-700">
            <span
              className={`text-xl font-mono font-black tabular-nums ${
                timeLeft <= 3 ? 'text-rose-400 animate-ping' : timeLeft <= 5 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {timeLeft}s
            </span>
            <span className="text-xs text-slate-400">Tersisa</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-400">
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            <span>Waktu Bebas (Manual)</span>
          </div>
        )}

        {/* Status Message */}
        <div className="hidden md:flex flex-col">
          <div className="text-xs font-semibold text-slate-200">
            {stage === 'waiting' && 'Status: Menunggu siswa mengambil posisi di kiri (BENAR) atau kanan (SALAH)...'}
            {stage === 'locked' && 'Status: Jawaban dikunci! Mengevaluasi pilihan kelas...'}
            {stage === 'revealed' && 'Status: Jawaban terbuka! Tekan Soal Berikutnya untuk lanjut.'}
            {stage === 'completed' && 'Status: Kuis selesai! Kerja sama kelas luar biasa.'}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {stage === 'waiting' ? 'Tekan [Spasi] untuk mengunci jawaban' : 'Tekan [Spasi] untuk soal berikutnya'}
          </div>
        </div>
      </div>

      {/* Center Zone: Primary Action Button (Lock or Next) */}
      <div className="flex items-center gap-2">
        {stage === 'waiting' && (
          <button
            type="button"
            onClick={onLockAnswer}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 transition transform active:scale-95"
          >
            <Lock className="w-4 h-4" />
            <span>Kunci Posisi Siswa Sekarang! (Spasi)</span>
          </button>
        )}
      </div>

      {/* Right Zone: Teacher Quick Controls */}
      <div className="flex items-center gap-1.5">
        {/* Read Aloud TTS */}
        <button
          type="button"
          onClick={handleSpeak}
          title={isSpeaking ? 'Hentikan Suara' : 'Bacakan Soal dengan Suara (TTS)'}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition ${
            isSpeaking
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
        >
          <Volume1 className="w-4 h-4" />
          <span className="hidden sm:inline">Bacakan</span>
        </button>

        {/* Sound FX Toggle */}
        <button
          type="button"
          onClick={onToggleSound}
          title={settings.soundEffects ? 'Matikan Suara Efek' : 'Nyalakan Suara Efek'}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          {settings.soundEffects ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Timer Duration Dropdown */}
        <select
          value={settings.timerDuration}
          onChange={(e) => onSetTimerDuration(Number(e.target.value))}
          title="Atur Durasi Waktu Soal"
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-2.5 py-2 rounded-xl border border-slate-700 outline-none cursor-pointer"
        >
          <option value={10}>10 Detik</option>
          <option value={15}>15 Detik</option>
          <option value={20}>20 Detik</option>
          <option value={30}>30 Detik</option>
          <option value={0}>Manual (Tanpa Waktu)</option>
        </select>

        {/* Question Packs Menu */}
        <button
          type="button"
          onClick={onOpenPackSelector}
          title="Pilih Paket Soal Excel"
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition"
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="hidden lg:inline">Paket Soal</span>
        </button>

        {/* AI Question Generator */}
        <button
          type="button"
          onClick={onOpenAiGenerator}
          title="Buat Soal Otomatis dengan AI Gemini"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/30 text-xs font-bold shadow-md shadow-cyan-600/20 transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Buat Soal</span>
        </button>

        {/* Custom Editor */}
        <button
          type="button"
          onClick={onOpenEditor}
          title="Edit atau Tambah Soal Sendiri"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <FileEdit className="w-4 h-4" />
        </button>

        {/* Camera Calibration */}
        <button
          type="button"
          onClick={onOpenCalibration}
          title="Kalibrasi Kamera & Sensitivitas Area"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Reset */}
        <button
          type="button"
          onClick={onResetQuiz}
          title="Ulangi Kuis dari Awal"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Fullscreen IFP */}
        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (Cocok untuk IFP)'}
          className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 transition"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </footer>
  );
};
