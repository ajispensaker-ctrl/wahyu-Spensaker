import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CameraSettings } from '../types';
import { Camera, CameraOff, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface CameraTrackerProps {
  settings: CameraSettings;
  onZoneDetected: (zone: 'LEFT' | 'RIGHT' | 'NEUTRAL', metrics: { leftEnergy: number; rightEnergy: number; personX: number | null }) => void;
  className?: string;
  isLocked?: boolean;
}

export const CameraTracker: React.FC<CameraTrackerProps> = ({
  settings,
  onZoneDetected,
  className = '',
  isLocked = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const motionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(settings.deviceId || '');
  const [showLivePreview, setShowLivePreview] = useState<boolean>(true);

  const poseInstanceRef = useRef<any>(null);
  const cameraInstanceRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Enumerate video devices
  const refreshDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevs = devices.filter((d) => d.kind === 'videoinput');
      setAvailableDevices(videoDevs);
      if (videoDevs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevs[0].deviceId);
      }
    } catch {
      // ignore
    }
  }, [selectedDeviceId]);

  // Optical flow / motion difference calculation
  const processMotionFlow = useCallback((video: HTMLVideoElement) => {
    if (!motionCanvasRef.current) {
      motionCanvasRef.current = document.createElement('canvas');
      motionCanvasRef.current.width = 160;
      motionCanvasRef.current.height = 90;
    }
    const motionCanvas = motionCanvasRef.current;
    const ctx = motionCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { left: 0, right: 0 };

    ctx.drawImage(video, 0, 0, motionCanvas.width, motionCanvas.height);
    const imgData = ctx.getImageData(0, 0, motionCanvas.width, motionCanvas.height);
    const data = imgData.data;

    if (!prevFrameDataRef.current) {
      prevFrameDataRef.current = new Uint8ClampedArray(data);
      return { left: 0, right: 0 };
    }

    const prev = prevFrameDataRef.current;
    const width = motionCanvas.width;
    const height = motionCanvas.height;
    const midX = Math.floor(width / 2);
    const deadzone = Math.floor(width * 0.08);

    let leftDeltaSum = 0;
    let rightDeltaSum = 0;
    let leftPixels = 0;
    let rightPixels = 0;

    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const i = (y * width + x) * 4;
        const diff = Math.abs(data[i] - prev[i]) + Math.abs(data[i + 1] - prev[i + 1]) + Math.abs(data[i + 2] - prev[i + 2]);
        const isMoved = diff > 45;

        // Note: mirror adjustment
        const effectiveX = settings.mirrored ? width - 1 - x : x;

        if (effectiveX < midX - deadzone) {
          leftPixels++;
          if (isMoved) leftDeltaSum += diff;
        } else if (effectiveX > midX + deadzone) {
          rightPixels++;
          if (isMoved) rightDeltaSum += diff;
        }
      }
    }

    prevFrameDataRef.current = new Uint8ClampedArray(data);

    const leftEnergy = leftPixels > 0 ? Math.min(100, Math.round((leftDeltaSum / (leftPixels * 30)) * 100)) : 0;
    const rightEnergy = rightPixels > 0 ? Math.min(100, Math.round((rightDeltaSum / (rightPixels * 30)) * 100)) : 0;

    return { left: leftEnergy, right: rightEnergy };
  }, [settings.mirrored]);

  // Start webcam and setup MediaPipe
  useEffect(() => {
    let stream: MediaStream | null = null;
    let isCancelled = false;

    async function initCamera() {
      try {
        setCameraError(null);
        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
        }

        refreshDevices();

        // Check if MediaPipe is available on window
        if (typeof window !== 'undefined' && window.Pose && window.Camera) {
          try {
            const pose = new window.Pose({
              locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
            });

            pose.setOptions({
              modelComplexity: 1,
              smoothLandmarks: true,
              enableSegmentation: false,
              minDetectionConfidence: 0.5,
              minTrackingConfidence: 0.5,
            });

            pose.onResults(onPoseResults);
            poseInstanceRef.current = pose;

            if (videoRef.current) {
              const camera = new window.Camera(videoRef.current, {
                onFrame: async () => {
                  if (videoRef.current && poseInstanceRef.current && !isLocked) {
                    await poseInstanceRef.current.send({ image: videoRef.current });
                  }
                },
                width: 640,
                height: 480,
              });
              camera.start();
              cameraInstanceRef.current = camera;
            }
          } catch (mpErr) {
            console.warn('MediaPipe Pose fallback to motion flow:', mpErr);
          }
        }
      } catch (err: any) {
        console.warn('Camera access denied or unavailable:', err);
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Izin kamera ditolak. Berikan izin di browser atau gunakan mode Layar Sentuh / Keyboard.'
            : 'Kamera tidak terdeteksi. Kuis tetap dapat dimainkan dengan menyentuh layar atau keyboard.'
        );
        setCameraActive(false);
      }
    }

    initCamera();

    return () => {
      isCancelled = true;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (cameraInstanceRef.current) {
        try {
          cameraInstanceRef.current.stop();
        } catch {}
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [selectedDeviceId, refreshDevices, isLocked]);

  // MediaPipe Results Handler
  const onPoseResults = useCallback((results: any) => {
    if (isLocked) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate motion flow
    const motion = processMotionFlow(video);

    let detectedPersonX: number | null = null;
    let detectedZone: 'LEFT' | 'RIGHT' | 'NEUTRAL' = 'NEUTRAL';

    if (results.poseLandmarks && results.poseLandmarks.length > 0) {
      const landmarks = results.poseLandmarks;
      // Get nose (index 0) or average of shoulders (11 & 12)
      const nose = landmarks[0];
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];

      let rawX = nose?.x ?? 0.5;
      if (leftShoulder && rightShoulder) {
        rawX = (nose.x * 2 + leftShoulder.x + rightShoulder.x) / 4;
      }

      // If mirrored, flip horizontal coordinate
      const effectiveX = settings.mirrored ? 1.0 - rawX : rawX;
      detectedPersonX = effectiveX;

      // Draw skeleton on HUD
      if (settings.showSkeleton) {
        drawSkeleton(ctx, landmarks, canvas.width, canvas.height, settings.mirrored, effectiveX, settings);
      }

      // Determine Zone based on threshold
      if (effectiveX < settings.leftThreshold) {
        detectedZone = 'LEFT';
      } else if (effectiveX > settings.rightThreshold) {
        detectedZone = 'RIGHT';
      } else {
        detectedZone = 'NEUTRAL';
      }
    } else {
      // Fallback to motion flow if no single pose detected
      if (motion.left > 25 && motion.left > motion.right + 15) {
        detectedZone = 'LEFT';
      } else if (motion.right > 25 && motion.right > motion.left + 15) {
        detectedZone = 'RIGHT';
      }
    }

    onZoneDetected(detectedZone, {
      leftEnergy: motion.left,
      rightEnergy: motion.right,
      personX: detectedPersonX,
    });
  }, [isLocked, settings, onZoneDetected, processMotionFlow]);

  // Draw modern neon skeleton overlay
  const drawSkeleton = (
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    w: number,
    h: number,
    mirrored: boolean,
    effectiveX: number,
    s: CameraSettings
  ) => {
    const getX = (val: number) => (mirrored ? (1.0 - val) * w : val * w);
    const getY = (val: number) => val * h;

    const connections = [
      [11, 12], // shoulders
      [11, 13], [13, 15], // left arm
      [12, 14], [14, 16], // right arm
      [11, 23], [12, 24], // torso
      [23, 24], // hips
      [23, 25], [25, 27], // left leg
      [24, 26], [26, 28], // right leg
    ];

    // Neon bone color according to zone
    let boneColor = '#38BDF8'; // Cyan neutral
    if (effectiveX < s.leftThreshold) {
      boneColor = '#10B981'; // Emerald BENAR
    } else if (effectiveX > s.rightThreshold) {
      boneColor = '#F43F5E'; // Rose SALAH
    }

    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = boneColor;
    ctx.lineCap = 'round';
    ctx.shadowColor = boneColor;
    ctx.shadowBlur = 12;

    connections.forEach(([p1, p2]) => {
      const a = landmarks[p1];
      const b = landmarks[p2];
      if (a && b && a.visibility > 0.4 && b.visibility > 0.4) {
        ctx.beginPath();
        ctx.moveTo(getX(a.x), getY(a.y));
        ctx.lineTo(getX(b.x), getY(b.y));
        ctx.stroke();
      }
    });

    // Draw landmark joints
    landmarks.forEach((pt, idx) => {
      if ([0, 11, 12, 13, 14, 15, 16, 23, 24].includes(idx) && pt.visibility > 0.4) {
        const x = getX(pt.x);
        const y = getY(pt.y);

        ctx.beginPath();
        ctx.arc(x, y, idx === 0 ? 8 : 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = boneColor;
        ctx.stroke();
      }
    });

    // Draw target pointer head indicator
    if (landmarks[0]) {
      const hx = getX(landmarks[0].x);
      const hy = getY(landmarks[0].y) - 25;
      ctx.fillStyle = boneColor;
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      const label = effectiveX < s.leftThreshold ? '📍 BENAR' : effectiveX > s.rightThreshold ? '📍 SALAH' : '⚖️ NETRAL';
      ctx.fillText(label, hx, hy);
    }

    ctx.restore();
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 ${className}`}>
      {/* Background Video Stream (mirrored) */}
      <video
        ref={videoRef}
        playsInline
        muted
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          settings.mirrored ? '-scale-x-100' : ''
        } ${showLivePreview ? 'opacity-85' : 'opacity-10'}`}
      />

      {/* Skeleton / HUD Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none object-cover"
      />

      {/* Zone Boundary Guidelines Overlay */}
      <div className="absolute inset-0 pointer-events-none flex">
        {/* Left Zone Overlay (BENAR) */}
        <div
          style={{ width: `${settings.leftThreshold * 100}%` }}
          className="h-full border-r-2 border-dashed border-emerald-500/40 bg-emerald-950/20 flex flex-col justify-between p-3"
        >
          <div className="text-emerald-400 font-mono text-xs font-bold tracking-wider uppercase bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50 w-fit">
            Area BENAR
          </div>
        </div>

        {/* Middle Neutral Zone */}
        <div
          style={{ width: `${(settings.rightThreshold - settings.leftThreshold) * 100}%` }}
          className="h-full flex items-center justify-center opacity-40"
        >
          <div className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700/40">
            Zona Tengah (Netral)
          </div>
        </div>

        {/* Right Zone Overlay (SALAH) */}
        <div
          style={{ width: `${(1.0 - settings.rightThreshold) * 100}%` }}
          className="h-full border-l-2 border-dashed border-rose-500/40 bg-rose-950/20 flex flex-col justify-between items-end p-3"
        >
          <div className="text-rose-400 font-mono text-xs font-bold tracking-wider uppercase bg-rose-950/80 px-2 py-0.5 rounded border border-rose-700/50 w-fit">
            Area SALAH
          </div>
        </div>
      </div>

      {/* Camera Controls & Status Pill */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-lg text-xs">
          {cameraActive ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-slate-200">Kamera IFP Aktif</span>
            </>
          ) : (
            <>
              <CameraOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 font-medium">Mode Sentuh / Manual</span>
            </>
          )}

          {availableDevices.length > 1 && (
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-0.5 text-xs outline-none cursor-pointer"
            >
              {availableDevices.map((d, idx) => (
                <option key={d.deviceId || idx} value={d.deviceId}>
                  {d.label || `Kamera ${idx + 1}`}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowLivePreview(!showLivePreview)}
            title={showLivePreview ? 'Sembunyikan Feed Kamera' : 'Tampilkan Feed Kamera'}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition"
          >
            {showLivePreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={refreshDevices}
            title="Muat Ulang Kamera"
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Warning Alert if camera failed */}
      {cameraError && (
        <div className="absolute bottom-3 left-3 right-3 bg-amber-950/90 backdrop-blur-sm border border-amber-600/50 rounded-lg p-2.5 text-xs text-amber-200 flex items-center justify-between">
          <span className="line-clamp-1">{cameraError}</span>
          <button
            type="button"
            onClick={refreshDevices}
            className="text-amber-400 hover:text-amber-200 underline font-semibold shrink-0 ml-2"
          >
            Coba Kamera
          </button>
        </div>
      )}
    </div>
  );
};
