
import React, { useState, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import Experience from './components/Experience';
import HandTracker from './components/HandTracker';
import UIOverlay from './components/UIOverlay';
import Home from './components/Home';
import { GestureType, HandData } from './types';
import { COLORS, TARGET_IMAGE_URL } from './constants';

type ViewMode = 'home' | 'memory' | 'hero';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');

  // Shared Logic for 3D Experience
  const [currentGesture, setCurrentGesture] = useState<GestureType>(GestureType.NONE);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [imageSource, setImageSource] = useState<string>(TARGET_IMAGE_URL);
  
  const handDataRef = useRef<HandData>({
    gesture: GestureType.NONE,
    x: 0.5,
    y: 0.5,
    isDetected: false
  });
  
  const [cameraStatus, setCameraStatus] = useState<'loading' | 'active' | 'error' | 'idle'>('idle');
  const [cameraError, setCameraError] = useState<string | undefined>();
  const [shouldStartCamera, setShouldStartCamera] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Reset state when changing views
  const navigateTo = (view: ViewMode) => {
      // Reset camera when leaving an experience
      if (view === 'home') {
          setShouldStartCamera(false);
          setCameraStatus('idle');
      }
      setCurrentView(view);
  };

  const handleHandUpdate = useCallback((data: HandData) => {
    handDataRef.current = data;
    setCurrentGesture(prev => prev !== data.gesture ? data.gesture : prev);
    setIsHandDetected(prev => prev !== data.isDetected ? data.isDetected : prev);
  }, []);

  const handleCameraStatusChange = useCallback((status: 'loading' | 'active' | 'error', message?: string) => {
    setCameraStatus(status);
    if (status === 'error') {
        setCameraError(message);
        setShouldStartCamera(false); 
    }
  }, []);

  const triggerCameraStart = () => {
      setShouldStartCamera(true);
  };

  const triggerCameraStop = () => {
      setShouldStartCamera(false);
      setCameraStatus('idle');
      setIsHandDetected(false);
  };

  const handleScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.setAttribute('download', 'capture.png');
      link.setAttribute('href', canvas.toDataURL('image/png'));
      link.click();
    }
  };

  const handleImageUpload = (file: File) => {
      const objectUrl = URL.createObjectURL(file);
      setImageSource(objectUrl);
  };

  // --- RENDER ---

  if (currentView === 'home') {
      return <Home onNavigate={navigateTo} />;
  }

  // Common Experience Layout for both 'memory' and 'hero'
  const isHero = currentView === 'hero';

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      
      {/* 3D Scene */}
      <div className="absolute inset-0 z-10">
        <Canvas
          dpr={[1, 2]} 
          gl={{ antialias: false, toneMapping: 3, preserveDrawingBuffer: true }} 
          shadows
          ref={canvasRef}
        >
          <color attach="background" args={[COLORS.BG_DARK]} />
          <fog attach="fog" args={[COLORS.BG_DARK, 10, 50]} />
          
          <Experience 
            handDataRef={handDataRef} 
            currentGesture={currentGesture}
            isHandDetected={isHandDetected}
            imageSource={imageSource}
          />
        </Canvas>
      </div>

      {/* Shared Logic Layer */}
      <HandTracker 
        onHandUpdate={handleHandUpdate} 
        onCameraStatusChange={handleCameraStatusChange}
        shouldStart={shouldStartCamera}
      />

      {/* Dynamic UI Overlay based on Mode */}
      <UIOverlay 
        variant={isHero ? 'hero' : 'standard'}
        currentGesture={currentGesture}
        isHandDetected={isHandDetected}
        cameraStatus={cameraStatus}
        cameraError={cameraError}
        onStartCamera={triggerCameraStart}
        onStopCamera={triggerCameraStop}
        onScreenshot={handleScreenshot}
        onUploadImage={handleImageUpload}
        onBack={() => navigateTo('home')}
      />
      
      <Loader 
        containerStyles={{ background: 'black' }} 
        innerStyles={{ width: '200px', background: '#333' }} 
        barStyles={{ background: 'white' }}
        dataStyles={{ color: 'white', fontFamily: 'Cinzel' }}
      />
    </div>
  );
}

export default App;
