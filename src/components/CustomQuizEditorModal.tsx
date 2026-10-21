import React, { useState } from 'react';
import { QuizQuestion, AnswerType } from '../types';
import { X, Plus, Trash2, Download, Upload, Save, Check, FileCode } from 'lucide-react';

interface CustomQuizEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
  onSaveQuestions: (updated: QuizQuestion[]) => void;
}

export const CustomQuizEditorModal: React.FC<CustomQuizEditorModalProps> = ({
  isOpen,
  onClose,
  questions,
  onSaveQuestions,
}) => {
  const [list, setList] = useState<QuizQuestion[]>(questions);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New question form state
  const [newQ, setNewQ] = useState<string>('');
  const [newAns, setNewAns] = useState<AnswerType>('BENAR');
  const [newExp, setNewExp] = useState<string>('');
  const [newFormula, setNewFormula] = useState<string>('');

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    if (!newQ.trim()) return;
    const item: QuizQuestion = {
      id: `custom-${Date.now()}`,
      q: newQ.trim(),
      ans: newAns,
      explanation: newExp.trim() || 'Penjelasan materi konsep Excel.',
      formula: newFormula.trim() || undefined,
      category: 'Kustom Guru',
    };
    setList([...list, item]);
    setNewQ('');
    setNewExp('');
    setNewFormula('');
    setNewAns('BENAR');
  };

  const handleDelete = (id: string) => {
    setList(list.filter((q) => q.id !== id));
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(list, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `kuis_excel_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          const validated: QuizQuestion[] = parsed.map((item: any, idx: number) => ({
            id: item.id || `imported-${Date.now()}-${idx}`,
            q: item.q || 'Pertanyaan',
            ans: item.ans === 'BENAR' ? 'BENAR' : 'SALAH',
            explanation: item.explanation || 'Pembahasan',
            formula: item.formula || undefined,
            category: item.category || 'Impor',
          }));
          setList(validated);
        }
      } catch (err) {
        alert('Format file JSON tidak valid!');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveAndClose = () => {
    if (list.length === 0) {
      alert('Minimal harus ada 1 soal kuis!');
      return;
    }
    onSaveQuestions(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Editor Bank Soal Mandiri</h3>
              <p className="text-xs text-slate-400">Tambah, ubah, atau impor daftar soal kuis Excel untuk kelas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportJson}
              title="Ekspor ke File JSON"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor JSON</span>
            </button>
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Impor JSON</span>
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form to Add New Question */}
        <div className="py-3 px-4 bg-slate-950/70 border border-slate-800 rounded-2xl my-3 space-y-2.5">
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            Tambah Soal Baru:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="sm:col-span-3">
              <input
                type="text"
                placeholder="Pernyataan soal (misal: Rumus =SUM digunakan untuk mencari rata-rata data?)"
                value={newQ}
                onChange={(e) => setNewQ(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <select
                value={newAns}
                onChange={(e) => setNewAns(e.target.value as AnswerType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-white outline-none cursor-pointer"
              >
                <option value="BENAR">Kunci: BENAR</option>
                <option value="SALAH">Kunci: SALAH</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Pembahasan singkat materi guru..."
              value={newExp}
              onChange={(e) => setNewExp(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Rumus Excel (opsional, misal: =AVERAGE(A1:A10))"
                value={newFormula}
                onChange={(e) => setNewFormula(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-emerald-300 font-mono placeholder-slate-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddQuestion}
                disabled={!newQ.trim()}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition shrink-0 disabled:opacity-50"
              >
                Tambahkan
              </button>
            </div>
          </div>
        </div>

        {/* Existing List */}
        <div className="overflow-y-auto flex-1 space-y-2.5 pr-1">
          <div className="text-xs font-bold text-slate-400">
            Daftar Soal Saat Ini ({list.length} Soal):
          </div>

          {list.map((item, idx) => (
            <div
              key={item.id}
              className="p-3.5 bg-slate-950/50 rounded-2xl border border-slate-800 flex items-start justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-2.5 flex-1">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  {idx + 1}
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.ans === 'BENAR'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {item.ans}
                    </span>
                    <span className="font-semibold text-white">{item.q}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{item.explanation}</p>
                  {item.formula && (
                    <code className="text-[10px] font-mono text-cyan-300 bg-slate-900 px-2 py-0.5 rounded block w-fit">
                      {item.formula}
                    </code>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                title="Hapus Soal"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Total {list.length} soal kuis siap dimainkan
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/30 transition transform hover:scale-105"
            >
              <Save className="w-4 h-4" />
              <span>Simpan & Terapkan ke Kuis</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
