import React from 'react';
import { QuestionPack } from '../types';
import { X, Layers, Check, Sparkles, BookOpen } from 'lucide-react';

interface PackSelectorModalProps {
  packs: QuestionPack[];
  activePackId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectPack: (pack: QuestionPack) => void;
  onOpenAiGenerator: () => void;
}

export const PackSelectorModal: React.FC<PackSelectorModalProps> = ({
  packs,
  activePackId,
  isOpen,
  onClose,
  onSelectPack,
  onOpenAiGenerator,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Pilih Paket Bank Soal Excel</h3>
              <p className="text-xs text-slate-400">Pilih materi yang sedang dipelajari di kelas saat ini</p>
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

        {/* List of Packs */}
        <div className="overflow-y-auto py-4 space-y-3 pr-1 my-1">
          {packs.map((pack) => {
            const isActive = pack.id === activePackId;
            return (
              <div
                key={pack.id}
                onClick={() => {
                  onSelectPack(pack);
                  onClose();
                }}
                className={`group p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-4 ${
                  isActive
                    ? 'bg-emerald-950/50 border-emerald-500/60 ring-2 ring-emerald-500/30'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                    }`}
                  >
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                        {pack.title}
                      </h4>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                        {pack.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{pack.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                      <span>{pack.questions.length} Soal Interaktif</span>
                      <span>•</span>
                      <span>Format Benar / Salah</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isActive ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                      <Check className="w-5 h-5" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 group-hover:bg-emerald-600 group-hover:text-white text-slate-300 text-xs font-semibold border border-slate-700 transition"
                    >
                      Pilih
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with AI generator prompt */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Ingin topik lain yang belum ada di daftar?
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAiGenerator();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition shadow-md shadow-cyan-600/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Buat Topik Baru dengan AI Gemini</span>
          </button>
        </div>
      </div>
    </div>
  );
};
