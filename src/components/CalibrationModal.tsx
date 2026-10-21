import React from 'react';
import { CameraSettings } from '../types';
import { X, Sliders, Check, RotateCcw } from 'lucide-react';

interface CalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CameraSettings;
  onUpdateSettings: (newSettings: CameraSettings) => void;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const handleReset = () => {
    onUpdateSettings({
      ...settings,
      leftThreshold: 0.42,
      rightThreshold: 0.58,
      mirrored: true,
      showSkeleton: true,
      showGhostFeed: true,
      detectionMode: 'hybrid',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Kalibrasi Sensor Kamera & Area</h3>
              <p className="text-xs text-slate-400">Sesuaikan lebar batas area BENAR dan SALAH di ruang kelas Anda</p>
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

        {/* Sliders & Toggles */}
        <div className="py-4 space-y-4">
          {/* Visual Boundary Preview Bar */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 mb-2 flex justify-between">
              <span>Area Kiri: {Math.round(settings.leftThreshold * 100)}%</span>
              <span className="text-cyan-400">Netral: {Math.round((settings.rightThreshold - settings.leftThreshold) * 100)}%</span>
              <span>Area Kanan: {Math.round((1.0 - settings.rightThreshold) * 100)}%</span>
            </div>
            <div className="w-full h-8 bg-slate-900 rounded-xl overflow-hidden flex border border-slate-700">
              <div
                style={{ width: `${settings.leftThreshold * 100}%` }}
                className="h-full bg-emerald-600/60 border-r-2 border-emerald-400 flex items-center justify-center text-[10px] font-bold text-white"
              >
                BENAR
              </div>
              <div
                style={{ width: `${(settings.rightThreshold - settings.leftThreshold) * 100}%` }}
                className="h-full bg-slate-800/80 flex items-center justify-center text-[10px] text-slate-400"
              >
                NETRAL
              </div>
              <div
                style={{ width: `${(1.0 - settings.rightThreshold) * 100}%` }}
                className="h-full bg-rose-600/60 border-l-2 border-rose-400 flex items-center justify-center text-[10px] font-bold text-white"
              >
                SALAH
              </div>
            </div>
          </div>

          {/* Left Zone Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Batas Area Kiri (BENAR):</span>
              <span className="text-emerald-400 font-mono">{Math.round(settings.leftThreshold * 100)}% layar</span>
            </div>
            <input
              type="range"
              min="0.25"
              max="0.48"
              step="0.01"
              value={settings.leftThreshold}
              onChange={(e) => onUpdateSettings({ ...settings, leftThreshold: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">
              Geser ke kanan jika siswa berdiri agak ke tengah untuk sisi BENAR.
            </p>
          </div>

          {/* Right Zone Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Batas Mulai Area Kanan (SALAH):</span>
              <span className="text-rose-400 font-mono">{Math.round(settings.rightThreshold * 100)}% layar</span>
            </div>
            <input
              type="range"
              min="0.52"
              max="0.75"
              step="0.01"
              value={settings.rightThreshold}
              onChange={(e) => onUpdateSettings({ ...settings, rightThreshold: parseFloat(e.target.value) })}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">
              Semakin besar angka, semakin ke pinggir kanan siswa harus berdiri.
            </p>
          </div>

          {/* Toggles */}
          <div className="pt-2 border-t border-slate-800 space-y-2.5">
            <label className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 cursor-pointer">
              <span className="text-xs text-slate-300 font-medium">Cerminkan Tampilan Kamera (Mirror Feed)</span>
              <input
                type="checkbox"
                checked={settings.mirrored}
                onChange={(e) => onUpdateSettings({ ...settings, mirrored: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-700"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 cursor-pointer">
              <span className="text-xs text-slate-300 font-medium">Tampilkan Kerangka Neon Tubuh (Skeleton Pose)</span>
              <input
                type="checkbox"
                checked={settings.showSkeleton}
                onChange={(e) => onUpdateSettings({ ...settings, showSkeleton: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-700"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Atur Ulang Bawaan</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-500/20"
          >
            <Check className="w-4 h-4" />
            <span>Selesai Kalibrasi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
