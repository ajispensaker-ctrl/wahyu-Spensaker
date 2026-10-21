export type AnswerType = 'BENAR' | 'SALAH';

export interface QuizQuestion {
  id: string;
  q: string;
  ans: AnswerType;
  explanation: string;
  formula?: string;
  category?: string;
}

export interface QuestionPack {
  id: string;
  title: string;
  description: string;
  badge: string;
  questions: QuizQuestion[];
}

export type QuizStage = 'waiting' | 'locked' | 'revealed' | 'completed';

export interface QuestionResult {
  question: QuizQuestion;
  classChoice: AnswerType | 'NETRAL' | null;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  leftPercentage: number;
  rightPercentage: number;
}

export interface CameraSettings {
  enabled: boolean;
  deviceId: string;
  mirrored: boolean;
  showSkeleton: boolean;
  showGhostFeed: boolean;
  leftThreshold: number; // default 0.42
  rightThreshold: number; // default 0.58
  sensitivity: number;
  detectionMode: 'pose' | 'motion' | 'hybrid';
}

export interface TeacherSettings {
  timerDuration: number; // 0 for manual, or 10, 15, 20, 30
  autoReadQuestion: boolean;
  soundEffects: boolean;
  className: string;
}

// MediaPipe global typings
declare global {
  interface Window {
    Pose?: any;
    Camera?: any;
  }
}
