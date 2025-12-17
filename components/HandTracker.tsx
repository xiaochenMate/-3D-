
import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import { GestureType, HandData } from '../types';

interface HandTrackerProps {
  onHandUpdate: (data: HandData) => void;
  onCameraStatusChange?: (status: 'loading' | 'active' | 'error' | 'idle', message?: string) => void;
  shouldStart?: boolean;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onHandUpdate, onCameraStatusChange, shouldStart }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Visible error for mobile debugging
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);
  
  // Stabilization refs
  const gestureHistoryRef = useRef<GestureType[]>([]);
  const lastConfirmedGestureRef = useRef<GestureType>(GestureType.NONE);
  const STABILITY_FRAMES = 5; 

  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    let active = true;

    const setupMediaPipe = async () => {
      // 1. Check Protocol (HTTPS is mandatory for mobile camera)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        const msg = "安全限制: 请使用 HTTPS 协议访问 (Security: HTTPS required)";
        console.error(msg);
        setError(msg);
        onCameraStatusChange?.('error', msg);
        return;
      }

      // 2. Check Browser Support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const msg = "您的浏览器不支持摄像头访问 (navigator.mediaDevices missing)";
        console.error(msg);
        setError(msg);
        onCameraStatusChange?.('error', msg);
        return;
      }

      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        
        if (!active) return;

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.5, // Slightly lower for mobile
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        landmarkerRef.current = landmarker;
        setLoading(false);
      } catch (error: any) {
        console.error("Error initializing MediaPipe:", error);
        setLoading(false);
        const errorMsg = `AI加载失败: ${error.message || 'Unknown error'}`;
        setError(errorMsg);
        onCameraStatusChange?.('error', errorMsg);
      }
    };

    setupMediaPipe();

    return () => {
      active = false;
      stopCamera();
      if (landmarkerRef.current) landmarkerRef.current.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Monitor shouldStart
  useEffect(() => {
    if (shouldStart) {
        // Only attempt start if we are not already loading/streaming and AI is ready
        if (!loading && landmarkerRef.current && !videoRef.current?.srcObject) {
            startCamera();
        }
    } else {
        stopCamera();
    }
  }, [shouldStart, loading]);

  const stopCamera = () => {
      if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
          requestRef.current = 0;
      }
      
      if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
      }
  };

  const startCamera = async () => {
    if (!videoRef.current) return;
    setError(null);
    onCameraStatusChange?.('loading');
    
    // Constraint Strategy: From Best to Worst
    const constraintsList = [
      // 1. Mobile Friendly (Front Camera, Low Res for speed)
      { 
        video: { 
          facingMode: 'user',
          width: { ideal: 480 },  // Lower resolution is safer on mobile
          height: { ideal: 640 }
        } 
      },
      // 2. Generic Front
      { 
        video: { facingMode: 'user' } 
      },
      // 3. Absolute fallback (Any camera)
      { 
        video: true 
      }
    ];

    let stream: MediaStream | null = null;
    let lastError: any = null;

    for (const constraints of constraintsList) {
        try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            if (stream) break; 
        } catch (err) {
            console.warn("Camera constraint failed:", constraints, err);
            lastError = err;
        }
    }

    if (stream) {
        try {
            videoRef.current.srcObject = stream;
            
            // Critical for iOS Safari: 'onloadedmetadata' is often safer than 'onloadeddata'
            videoRef.current.onloadedmetadata = async () => {
                try {
                    await videoRef.current?.play();
                    predictWebcam();
                    onCameraStatusChange?.('active');
                    // Auto minimize on mobile to save screen space
                    if (window.innerWidth < 768) setIsMinimized(true);
                } catch (playErr) {
                     console.error("Play error", playErr);
                     // If autoplay fails (iOS battery saver?), show error
                     setError("无法自动播放视频，请点击屏幕");
                }
            };
        } catch (e: any) {
            console.error("Stream assignment error:", e);
            setError(`视频流错误: ${e.message}`);
        }
    } else {
        console.error("All camera attempts failed.", lastError);
        let msg = "无法启动摄像头";
        
        if (lastError) {
             if (lastError.name === 'NotAllowedError' || lastError.name === 'PermissionDeniedError') {
                msg = "权限被拒绝 (Permission Denied)。请检查浏览器设置或微信权限。";
            } else if (lastError.name === 'NotFoundError') {
                msg = "找不到摄像头设备";
            } else if (lastError.name === 'NotReadableError') {
                msg = "摄像头被其他应用占用";
            } else {
                msg = `错误: ${lastError.name} - ${lastError.message}`;
            }
        }
        
        setError(msg);
        onCameraStatusChange?.('error', msg);
    }
  };

  const predictWebcam = () => {
    if (!shouldStart) return; 
    
    requestRef.current = requestAnimationFrame(predictWebcam);

    if (!landmarkerRef.current || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    if (video.currentTime === lastVideoTimeRef.current) return;
    lastVideoTimeRef.current = video.currentTime;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (canvas.width !== video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const startTimeMs = performance.now();
    const result = landmarkerRef.current.detectForVideo(video, startTimeMs);

    let rawGesture = GestureType.NONE;
    let handX = 0.5;
    let handY = 0.5;
    let isDetected = false;

    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (result.landmarks && result.landmarks.length > 0) {
      isDetected = true;
      const landmarks = result.landmarks[0]; 

      // Visual Feedback
      if (ctx) {
         const drawingUtils = new DrawingUtils(ctx);
         drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, { color: "#E0B0FF", lineWidth: 2 });
         drawingUtils.drawLandmarks(landmarks, { color: "#FFB7C5", radius: 3 });
      }

      // Logic - MIRROR X
      handX = 1 - landmarks[0].x;
      handY = landmarks[0].y;

      const wrist = landmarks[0];
      const tips = [4, 8, 12, 16, 20];
      
      const tipDistances = tips.map(idx => {
        const dx = landmarks[idx].x - wrist.x;
        const dy = landmarks[idx].y - wrist.y;
        const dz = landmarks[idx].z - wrist.z;
        return Math.sqrt(dx*dx + dy*dy + dz*dz);
      });
      const avgDist = tipDistances.reduce((a, b) => a + b, 0) / 5;

      const dxP = landmarks[4].x - landmarks[8].x;
      const dyP = landmarks[4].y - landmarks[8].y;
      const dzP = landmarks[4].z - landmarks[8].z;
      const pinchDist = Math.sqrt(dxP*dxP + dyP*dyP + dzP*dzP);

      if (pinchDist < 0.05) {
          rawGesture = GestureType.PINCH;
      } 
      else if (avgDist < 0.25) { 
          rawGesture = GestureType.CLOSED_FIST;
      } 
      else {
          rawGesture = GestureType.OPEN_PALM;
      }
    } else {
        rawGesture = GestureType.NONE;
    }

    const history = gestureHistoryRef.current;
    history.push(rawGesture);
    if (history.length > STABILITY_FRAMES) {
        history.shift();
    }

    const allMatch = history.length === STABILITY_FRAMES && history.every(g => g === rawGesture);
    const quickLost = rawGesture === GestureType.NONE && history.slice(-3).every(g => g === GestureType.NONE);

    if (allMatch || quickLost) {
        lastConfirmedGestureRef.current = rawGesture;
    }

    onHandUpdate({ 
        gesture: lastConfirmedGestureRef.current, 
        x: handX, 
        y: handY, 
        isDetected 
    });
  };

  return (
    <div 
        className={`fixed bottom-24 md:bottom-32 left-4 z-50 transition-all duration-300 ease-in-out border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md bg-black/40 ${isMinimized ? 'w-10 h-10 rounded-full' : 'w-48 h-36 md:w-64 md:h-48'}`}
    >
        {/* Toggle Button */}
        <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="absolute top-1 right-1 z-20 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors"
        >
            {isMinimized ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            )}
        </button>

        <div className={`relative w-full h-full bg-black ${isMinimized ? 'opacity-0' : 'opacity-100'}`}>
            <video 
                ref={videoRef} 
                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" 
                playsInline 
                muted 
                // Don't autoPlay here immediately, control it in logic
            />
            <canvas 
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
            />
            
            {/* 
                CRITICAL MOBILE ERROR DISPLAY 
                This ensures users see why it failed on their phone screen.
            */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-900/90 p-2 text-center">
                    <p className="text-white text-xs font-bold break-words">{error}</p>
                </div>
            )}

            {loading && shouldStart && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
            
            {!shouldStart && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 text-gray-500 text-xs uppercase tracking-widest font-cinzel">
                    摄像头关闭
                </div>
            )}
            
            {shouldStart && !loading && !error && (
                 <div className="absolute bottom-0 w-full text-center text-[8px] text-white/50 bg-black/50 py-0.5 pointer-events-none">
                    预览
                 </div>
            )}
        </div>
    </div>
  );
};

export default HandTracker;
