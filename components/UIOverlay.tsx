
import React, { useRef } from 'react';
import { GestureType } from '../types';

interface UIOverlayProps {
  currentGesture: GestureType;
  isHandDetected: boolean;
  cameraStatus: 'loading' | 'active' | 'error' | 'idle';
  cameraError?: string;
  variant: 'standard' | 'hero'; // NEW PROP
  onStartCamera: () => void;
  onStopCamera: () => void;
  onScreenshot: () => void;
  onUploadImage: (file: File) => void;
  onBack: () => void; // NEW PROP
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  currentGesture, 
  isHandDetected, 
  cameraStatus, 
  cameraError, 
  variant = 'standard',
  onStartCamera,
  onStopCamera,
  onScreenshot,
  onUploadImage,
  onBack
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadImage(file);
    }
  };

  const getStatusText = () => {
    if (cameraStatus === 'error') return "Error";
    if (cameraStatus === 'idle' || cameraStatus === 'loading') return "Init...";
    if (!isHandDetected) return "Waiting...";
    
    switch (currentGesture) {
      case GestureType.CLOSED_FIST: return variant === 'hero' ? "REVEALING" : "状态: 聚合";
      case GestureType.OPEN_PALM: return variant === 'hero' ? "DISPERSING" : "状态: 散开";
      case GestureType.PINCH: return variant === 'hero' ? "FOCUSING" : "状态: 聚焦";
      default: return "ACTIVE";
    }
  };

  // --- RENDER: HERO VARIANT (Creative Website Header) ---
  if (variant === 'hero') {
      return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-40 text-white font-inter">
            {/* Nav Bar */}
            <div className="flex justify-between items-center p-8 md:p-12 pointer-events-auto mix-blend-difference">
                <div className="flex items-center gap-6">
                    <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <span className="font-cinzel text-xl font-bold tracking-[0.2em]">AETHER<span className="text-pink-500">.</span>STUDIO</span>
                </div>
                
                <div className="hidden md:flex gap-12 text-xs uppercase tracking-widest text-gray-400">
                    <a href="#" className="hover:text-pink-400 transition-colors">Work</a>
                    <a href="#" className="hover:text-pink-400 transition-colors">About</a>
                    <a href="#" className="hover:text-pink-400 transition-colors">Contact</a>
                </div>

                <div className="flex items-center gap-4">
                     {/* Minimal Status */}
                     <div className={`w-2 h-2 rounded-full ${isHandDetected ? 'bg-green-400 shadow-[0_0_10px_#4ade80]' : 'bg-gray-600'}`}></div>
                </div>
            </div>

            {/* Hero Center Content */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full pointer-events-none">
                {cameraStatus === 'idle' ? (
                     <div className="pointer-events-auto animate-fadeIn">
                        <h1 className="font-cinzel text-6xl md:text-9xl font-bold text-white mb-6 tracking-tighter mix-blend-overlay opacity-50">
                            DIGITAL
                        </h1>
                         <button 
                            onClick={onStartCamera}
                            className="group relative px-8 py-3 bg-transparent border border-white/30 hover:border-white transition-all overflow-hidden"
                         >
                            <span className="relative z-10 text-xs uppercase tracking-[0.3em] group-hover:text-black transition-colors">Initialize Experience</span>
                            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                         </button>
                     </div>
                ) : (
                    <div className={`transition-opacity duration-1000 ${isHandDetected ? 'opacity-0' : 'opacity-100'}`}>
                        <h1 className="font-cinzel text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent tracking-tighter drop-shadow-2xl">
                            CREATIVE
                        </h1>
                        <p className="mt-4 text-xs md:text-sm text-pink-300 uppercase tracking-[0.5em] animate-pulse">
                            Move your hand to reveal the creator
                        </p>
                    </div>
                )}
            </div>

            {/* Footer / Scroll Indicator */}
            <div className="p-12 flex justify-between items-end mix-blend-difference pointer-events-none">
                 <div className="hidden md:block text-[10px] text-gray-400 uppercase tracking-widest max-w-xs leading-relaxed">
                     Interactive Portfolio 2024. <br/>
                     WebGL Particles & Hand Tracking.
                 </div>

                 {/* Minimal Controls for Hero */}
                 <div className="pointer-events-auto flex gap-4">
                    {/* Hidden input for changing background if they really want to */}
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                     <button onClick={onScreenshot} className="text-gray-500 hover:text-white transition-colors text-[10px] uppercase tracking-widest border-b border-transparent hover:border-white">
                        Save Frame
                     </button>
                 </div>
            </div>
        </div>
      );
  }

  // --- RENDER: STANDARD VARIANT (Original Tool) ---
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-40">
      
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pointer-events-auto gap-4">
        <div className="flex items-center gap-4">
             <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors p-2 bg-white/5 rounded-full backdrop-blur-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             </button>
             <div>
                <h1 className="cinematic-text text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-indigo-200 tracking-widest uppercase">
                    粒子记忆
                </h1>
             </div>
        </div>

        <div className="flex items-center space-x-3">
             <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 backdrop-blur-md text-blue-200 text-xs uppercase tracking-widest transition-all"
             >
                上传照片
             </button>

             <button
                onClick={onScreenshot}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white transition-all"
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             </button>

             {cameraStatus === 'active' && (
                 <button
                    onClick={onStopCamera}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 transition-all"
                 >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
             )}
        </div>
      </div>

      {/* Center CTA */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-md px-4 pointer-events-auto">
        {(cameraStatus === 'idle' || cameraStatus === 'error') && (
           <div className="flex flex-col items-center space-y-6">
               {cameraStatus === 'error' && (
                 <div className="text-red-300 bg-red-900/50 px-4 py-2 rounded-lg text-sm">{cameraError}</div>
               )}
               
               <button 
                onClick={onStartCamera}
                className="px-8 py-3 rounded-full bg-white text-black font-bold tracking-widest uppercase hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]"
               >
                 开启摄像头
               </button>
           </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex justify-between items-center gap-4">
        <div className="text-xs text-gray-400 space-y-1">
             <p><span className="text-white font-bold">✊ 握拳</span> 聚合粒子 (Reveal)</p>
             <p><span className="text-white font-bold">🖐 张开</span> 散开粒子 (Scatter)</p>
        </div>
        <div className="text-right">
           <p className="text-[10px] text-gray-500 uppercase tracking-widest">System</p>
           <p className="text-white font-mono text-sm">{getStatusText()}</p>
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
