/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  QuizQuestion,
  QuestionPack,
  QuizStage,
  QuestionResult,
  AnswerType,
  TeacherSettings,
  CameraSettings,
} from './types';
import { DEFAULT_PACKS } from './data/defaultQuestions';
import { CameraTracker } from './components/CameraTracker';
import { InteractiveZones } from './components/InteractiveZones';
import { ExplanationCard } from './components/ExplanationCard';
import { TeacherToolbar } from './components/TeacherToolbar';
import { PackSelectorModal } from './components/PackSelectorModal';
import { AiGeneratorModal } from './components/AiGeneratorModal';
import { CustomQuizEditorModal } from './components/CustomQuizEditorModal';
import { CalibrationModal } from './components/CalibrationModal';
import { QuizResultsScreen } from './components/QuizResultsScreen';
import { QuestionInputScreen } from './components/QuestionInputScreen';
import { soundFx, speakText } from './utils/audio';
import { fireCorrectConfetti } from './utils/confetti';
import {
  Target,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  FileEdit,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  // App View Mode: 'input' (input & setup questions) or 'quiz' (immersive full-screen IFP game)
  const [viewMode, setViewMode] = useState<'input' | 'quiz'>('input');

  // Hide/Show teacher menu during game (hidden by default when game starts)
  const [isMenuHidden, setIsMenuHidden] = useState<boolean>(true);

  // Question Packs & State
  const [packs, setPacks] = useState<QuestionPack[]>(DEFAULT_PACKS);
  const [activePack, setActivePack] = useState<QuestionPack>(DEFAULT_PACKS[0]);
  const [questions, setQuestions] = useState<QuizQuestion[]>(DEFAULT_PACKS[0].questions);
  const [quizTitle, setQuizTitle] = useState<string>(DEFAULT_PACKS[0].title);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [stage, setStage] = useState<QuizStage>('waiting');
  const [history, setHistory] = useState<QuestionResult[]>([]);

  // Selection & Detection
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerType | null>(null);
  const [currentDetectedZone, setCurrentDetectedZone] = useState<'LEFT' | 'RIGHT' | 'NEUTRAL'>('NEUTRAL');
  const [leftEnergy, setLeftEnergy] = useState<number>(0);
  const [rightEnergy, setRightEnergy] = useState<number>(0);
  const [personX, setPersonX] = useState<number | null>(null);

  // Settings
  const [teacherSettings, setTeacherSettings] = useState<TeacherSettings>({
    timerDuration: 15,
    autoReadQuestion: false,
    soundEffects: true,
    className: 'Kelas Informatika & TIK',
  });

  const [cameraSettings, setCameraSettings] = useState<CameraSettings>({
    enabled: true,
    deviceId: '',
    mirrored: true,
    showSkeleton: true,
    showGhostFeed: true,
    leftThreshold: 0.42,
    rightThreshold: 0.58,
    sensitivity: 50,
    detectionMode: 'hybrid',
  });

  // Timer
  const [timeLeft, setTimeLeft] = useState<number>(teacherSettings.timerDuration);
  const startTimeRef = useRef<number>(Date.now());

  // Modals
  const [isPackSelectorOpen, setIsPackSelectorOpen] = useState<boolean>(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState<boolean>(false);
  const [isCustomEditorOpen, setIsCustomEditorOpen] = useState<boolean>(false);
  const [isCalibrationOpen, setIsCalibrationOpen] = useState<boolean>(false);

  const currentQuestion = questions[currentIdx] || questions[0];

  // Calculate live accuracy statistics
  const answeredCount = history.length;
  const correctCount = history.filter((r) => r.isCorrect).length;
  const accuracyPercentage = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  // Sync sound settings with synthesizer
  useEffect(() => {
    soundFx.setEnabled(teacherSettings.soundEffects);
  }, [teacherSettings.soundEffects]);

  // Handle question load / change
  const loadQuestion = useCallback((idx: number) => {
    setCurrentIdx(idx);
    setStage('waiting');
    setSelectedAnswer(null);
    setTimeLeft(teacherSettings.timerDuration);
    startTimeRef.current = Date.now();
    soundFx.playWhoosh();

    if (teacherSettings.autoReadQuestion && questions[idx]) {
      speakText(questions[idx].q);
    }
  }, [questions, teacherSettings.timerDuration, teacherSettings.autoReadQuestion]);

  // Lock answer and evaluate accuracy
  const lockAndRevealAnswer = useCallback(() => {
    if (stage !== 'waiting') return;

    setStage('locked');

    // Determine final choice: either student touch click OR detected camera zone
    let finalChoice: AnswerType | 'NETRAL' | null = selectedAnswer;
    if (!finalChoice) {
      if (currentDetectedZone === 'LEFT') finalChoice = 'BENAR';
      else if (currentDetectedZone === 'RIGHT') finalChoice = 'SALAH';
      else finalChoice = 'NETRAL';
    }

    const isCorrect = finalChoice === currentQuestion.ans;
    const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    // Reveal delay for tension
    setTimeout(() => {
      setStage('revealed');

      if (isCorrect) {
        soundFx.playCorrect();
        fireCorrectConfetti();
      } else {
        soundFx.playIncorrect();
      }

      setHistory((prev) => [
        ...prev,
        {
          question: currentQuestion,
          classChoice: finalChoice,
          isCorrect,
          timeSpent,
          leftPercentage: leftEnergy,
          rightPercentage: rightEnergy,
        },
      ]);
    }, 500);
  }, [stage, selectedAnswer, currentDetectedZone, currentQuestion, leftEnergy, rightEnergy]);

  // Next Question
  const handleNextQuestion = useCallback(() => {
    if (currentIdx + 1 < questions.length) {
      loadQuestion(currentIdx + 1);
    } else {
      setStage('completed');
    }
  }, [currentIdx, questions.length, loadQuestion]);

  // Repeat current question
  const handleRepeatQuestion = useCallback(() => {
    loadQuestion(currentIdx);
  }, [currentIdx, loadQuestion]);

  // Reset entire quiz
  const handleResetQuiz = useCallback(() => {
    setHistory([]);
    loadQuestion(0);
  }, [loadQuestion]);

  // Start Quiz from Input Screen
  const handleStartFromInput = (configuredQuestions: QuizQuestion[], title: string) => {
    setQuestions(configuredQuestions);
    setQuizTitle(title);
    setHistory([]);
    setCurrentIdx(0);
    setStage('waiting');
    setTimeLeft(teacherSettings.timerDuration);
    startTimeRef.current = Date.now();
    setIsMenuHidden(true); // Auto-hide menu when game starts for full camera focus!
    setViewMode('quiz');
  };

  // Countdown timer effect
  useEffect(() => {
    if (viewMode !== 'quiz' || stage !== 'waiting' || teacherSettings.timerDuration === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          lockAndRevealAnswer();
          return 0;
        }

        if (prev <= 4) {
          soundFx.playWarning();
        } else if (prev <= 6) {
          soundFx.playTick();
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [viewMode, stage, teacherSettings.timerDuration, lockAndRevealAnswer]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (viewMode === 'quiz') {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
          if (stage === 'waiting') {
            setSelectedAnswer('BENAR');
            soundFx.playTick();
          }
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
          if (stage === 'waiting') {
            setSelectedAnswer('SALAH');
            soundFx.playTick();
          }
        } else if (e.code === 'Space') {
          e.preventDefault();
          if (stage === 'waiting') {
            lockAndRevealAnswer();
          } else if (stage === 'revealed') {
            handleNextQuestion();
          }
        } else if (e.code === 'KeyR') {
          if (stage === 'revealed') {
            handleRepeatQuestion();
          }
        } else if (e.code === 'KeyM') {
          // Toggle hidden menu
          setIsMenuHidden((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, stage, lockAndRevealAnswer, handleNextQuestion, handleRepeatQuestion]);

  // Camera zone detection callback
  const handleZoneDetected = useCallback((zone: 'LEFT' | 'RIGHT' | 'NEUTRAL', metrics: { leftEnergy: number; rightEnergy: number; personX: number | null }) => {
    setCurrentDetectedZone(zone);
    setLeftEnergy(metrics.leftEnergy);
    setRightEnergy(metrics.rightEnergy);
    setPersonX(metrics.personX);
  }, []);

  // Switch pack
  const handleSelectPack = (pack: QuestionPack) => {
    setActivePack(pack);
    setQuestions(pack.questions);
    setQuizTitle(pack.title);
    setHistory([]);
    setCurrentIdx(0);
    setStage('waiting');
    setTimeLeft(teacherSettings.timerDuration);
    startTimeRef.current = Date.now();
  };

  // Apply AI generated questions
  const handleApplyAiQuestions = (newQuestions: QuizQuestion[], topicTitle: string) => {
    const customPack: QuestionPack = {
      id: `ai-pack-${Date.now()}`,
      title: `Kuis AI: ${topicTitle}`,
      description: `Soal yang dirancang otomatis menggunakan Gemini AI untuk kelas.`,
      badge: 'Gemini AI',
      questions: newQuestions,
    };
    setPacks((prev) => [customPack, ...prev]);
    setActivePack(customPack);
    setQuestions(newQuestions);
    setQuizTitle(customPack.title);
    setHistory([]);
    setCurrentIdx(0);
    setStage('waiting');
    setTimeLeft(teacherSettings.timerDuration);
    startTimeRef.current = Date.now();
    setIsMenuHidden(true);
    setViewMode('quiz');
  };

  // Save questions from custom editor
  const handleSaveCustomQuestions = (updated: QuizQuestion[]) => {
    setQuestions(updated);
    setActivePack((prev) => ({
      ...prev,
      questions: updated,
    }));
    setHistory([]);
    setCurrentIdx(0);
    setStage('waiting');
    setTimeLeft(teacherSettings.timerDuration);
    startTimeRef.current = Date.now();
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex flex-col justify-between p-2 sm:p-4 overflow-hidden select-none relative">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* ================= MODE 1: INPUT SOAL MANDIRI ================= */}
      {viewMode === 'input' ? (
        <QuestionInputScreen
          questions={questions}
          onStartQuiz={handleStartFromInput}
          onOpenAiGenerator={() => setIsAiGeneratorOpen(true)}
        />
      ) : (
        /* ================= MODE 2: KUIS KAMERA BESAR & FULL (GAME STARTED) ================= */
        <div className="h-full w-full flex flex-col justify-between relative min-h-0">
          {/* FLOATING TOP BAR: PERTANYAAN, SKOR KETEPATAN & KONTROL CEPAT */}
          <header className="relative z-30 w-full max-w-5xl mx-auto bg-slate-900/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl px-4 py-2.5 sm:px-6 sm:py-3 shadow-2xl shrink-0 flex flex-col gap-1.5 transition-all">
            <div className="flex items-center justify-between gap-3">
              {/* Left: Step & Pack Name */}
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
                  Soal {currentIdx + 1}/{questions.length}
                </span>
                <span className="hidden md:inline text-[10px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 max-w-[200px] truncate">
                  {quizTitle}
                </span>
              </div>

              {/* Center: Live Accuracy & Timer */}
              <div className="flex items-center gap-2.5">
                {/* Live Accuracy Meter */}
                <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-[11px] font-mono">
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-400">Ketepatan:</span>
                  <span className={`font-bold ${accuracyPercentage >= 70 ? 'text-emerald-400' : accuracyPercentage >= 40 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {answeredCount > 0 ? `${correctCount}/${answeredCount} (${accuracyPercentage}%)` : '0%'}
                  </span>
                </div>

                {/* Countdown Timer */}
                {teacherSettings.timerDuration > 0 && (
                  <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs font-mono">
                    <span className={`font-black ${timeLeft <= 3 ? 'text-rose-400 animate-ping' : timeLeft <= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {timeLeft}s
                    </span>
                  </div>
                )}
              </div>

              {/* Right: Quick Actions (Input Soal, Toggle Menu, Audio) */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setViewMode('input')}
                  title="Kembali ke Layar Input Soal"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                >
                  <FileEdit className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Input Soal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMenuHidden(!isMenuHidden)}
                  title={isMenuHidden ? 'Tampilkan Menu Guru (Tekan M)' : 'Sembunyikan Menu Guru'}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    isMenuHidden
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      : 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isMenuHidden ? 'Menu' : 'Tutup'}</span>
                  {isMenuHidden ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* The Big Question Statement */}
            <div className="pt-1 border-t border-slate-800/80">
              <h1 className="text-lg sm:text-2xl font-black text-white text-center leading-snug tracking-tight max-w-4xl mx-auto">
                "{currentQuestion?.q}"
              </h1>
            </div>
          </header>

          {/* MAIN AREA: KAMERA BESAR & FULL SCREEN */}
          <main className="relative z-10 flex-1 my-2 w-full max-w-6xl mx-auto flex flex-col justify-between min-h-0">
            {stage === 'completed' ? (
              <QuizResultsScreen
                results={history}
                packTitle={quizTitle}
                classNameTitle={teacherSettings.className}
                onRestart={handleResetQuiz}
                onChooseNewPack={() => setViewMode('input')}
              />
            ) : (
              <div className="flex-1 flex flex-col gap-2.5 min-h-0 justify-between">
                {/* 1. TAMPILAN KAMERA BESAR & FULL (EXPANDED TO MAXIMUM HEIGHT) */}
                <div className="flex-1 relative min-h-0 rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-slate-900 flex flex-col">
                  <CameraTracker
                    settings={cameraSettings}
                    onZoneDetected={handleZoneDetected}
                    isLocked={stage === 'locked' || stage === 'revealed'}
                    className="w-full h-full flex-1"
                  />

                  {/* Status Deteksi Live & Petunjuk Siswa di atas Kamera */}
                  <div className="absolute bottom-3 left-3 right-3 pointer-events-none flex items-center justify-between z-20">
                    <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-xl flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                      <span className="font-semibold text-slate-200">
                        Posisi Siswa:{' '}
                        <strong
                          className={
                            selectedAnswer === 'BENAR' || currentDetectedZone === 'LEFT'
                              ? 'text-emerald-400'
                              : selectedAnswer === 'SALAH' || currentDetectedZone === 'RIGHT'
                              ? 'text-rose-400'
                              : 'text-slate-400'
                          }
                        >
                          {selectedAnswer || (currentDetectedZone === 'LEFT' ? 'BENAR (Kiri)' : currentDetectedZone === 'RIGHT' ? 'SALAH (Kanan)' : 'Netral')}
                        </strong>
                      </span>
                    </div>

                    <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] font-mono text-slate-300">
                      {stage === 'waiting'
                        ? 'Menunggu siswa mengambil posisi...'
                        : stage === 'locked'
                        ? '🔒 Jawaban Dikunci'
                        : 'Hasil Terverifikasi'}
                    </div>
                  </div>
                </div>

                {/* 2. TOMBOL SENTUH IFP (LETAK LANGSUNG DI BAWAH KAMERA) */}
                <div className="shrink-0">
                  <InteractiveZones
                    currentZone={currentDetectedZone}
                    stage={stage}
                    correctAnswer={currentQuestion.ans}
                    selectedAnswer={selectedAnswer}
                    leftEnergy={leftEnergy}
                    rightEnergy={rightEnergy}
                    personX={personX}
                    onSelectZone={(ans) => {
                      setSelectedAnswer(ans);
                      soundFx.playTick();
                    }}
                  />
                </div>

                {/* 3. KARTU PENJELASAN KETEPATAN (MUNCUL SAAT JAWABAN DIBUKA) */}
                {stage === 'revealed' && (
                  <div className="shrink-0">
                    <ExplanationCard
                      question={currentQuestion}
                      classChoice={
                        selectedAnswer ||
                        (currentDetectedZone === 'LEFT'
                          ? 'BENAR'
                          : currentDetectedZone === 'RIGHT'
                          ? 'SALAH'
                          : 'NETRAL')
                      }
                      onNextQuestion={handleNextQuestion}
                      onRepeatQuestion={handleRepeatQuestion}
                      isLastQuestion={currentIdx + 1 >= questions.length}
                    />
                  </div>
                )}
              </div>
            )}
          </main>

          {/* ================= OPTIONAL COLLAPSIBLE TEACHER TOOLBAR ================= */}
          {!isMenuHidden && (
            <div className="w-full max-w-6xl mx-auto shrink-0 pt-2 animate-in slide-in-from-bottom-3 duration-200">
              <TeacherToolbar
                stage={stage}
                timeLeft={timeLeft}
                totalTime={teacherSettings.timerDuration}
                settings={teacherSettings}
                cameraSettings={cameraSettings}
                currentQuestionText={currentQuestion?.q || ''}
                onLockAnswer={lockAndRevealAnswer}
                onResetQuiz={handleResetQuiz}
                onToggleSound={() =>
                  setTeacherSettings((prev) => ({ ...prev, soundEffects: !prev.soundEffects }))
                }
                onOpenPackSelector={() => setIsPackSelectorOpen(true)}
                onOpenAiGenerator={() => setIsAiGeneratorOpen(true)}
                onOpenEditor={() => setIsCustomEditorOpen(true)}
                onOpenCalibration={() => setIsCalibrationOpen(true)}
                onSetTimerDuration={(sec) => {
                  setTeacherSettings((prev) => ({ ...prev, timerDuration: sec }));
                  setTimeLeft(sec);
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL DIALOGS ================= */}
      <PackSelectorModal
        packs={packs}
        activePackId={activePack.id}
        isOpen={isPackSelectorOpen}
        onClose={() => setIsPackSelectorOpen(false)}
        onSelectPack={handleSelectPack}
        onOpenAiGenerator={() => setIsAiGeneratorOpen(true)}
      />

      <AiGeneratorModal
        isOpen={isAiGeneratorOpen}
        onClose={() => setIsAiGeneratorOpen(false)}
        onApplyQuestions={handleApplyAiQuestions}
      />

      <CustomQuizEditorModal
        isOpen={isCustomEditorOpen}
        onClose={() => setIsCustomEditorOpen(false)}
        questions={questions}
        onSaveQuestions={handleSaveCustomQuestions}
      />

      <CalibrationModal
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        settings={cameraSettings}
        onUpdateSettings={setCameraSettings}
      />
    </div>
  );
}
