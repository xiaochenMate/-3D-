
import React from 'react';

interface HomeProps {
  onNavigate: (view: 'memory' | 'hero') => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="relative w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden font-inter text-white selection:bg-pink-500/30">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] animate-pulse"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="z-10 text-center space-y-12 max-w-4xl px-6">
        
        {/* Header */}
        <div className="space-y-4">
            <h1 className="font-cinzel text-5xl md:text-7xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                PARTICLE MEMORY
            </h1>
            <p className="text-gray-400 tracking-[0.3em] uppercase text-xs md:text-sm">
                Next-Gen WebGL Interaction Demo
            </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 w-full">
            
            {/* Card 1: Tool App */}
            <button 
                onClick={() => onNavigate('memory')}
                className="group relative h-64 border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] text-left p-8 flex flex-col justify-end"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 opacity-60"></div>
                <div className="absolute top-0 right-0 p-4 opacity-30 group-hover:opacity-100 transition-opacity">
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                
                <div className="relative z-10">
                    <h2 className="font-cinzel text-2xl mb-2 group-hover:text-purple-300 transition-colors">功能演示</h2>
                    <p className="text-gray-400 text-xs leading-relaxed">
                        完整的粒子交互应用。支持上传图片、截图、手势控制（握拳聚合、张开散开）。
                    </p>
                    <div className="mt-6 flex items-center text-xs uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                        进入应用 <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                    </div>
                </div>
            </button>

            {/* Card 2: Hero Section */}
            <button 
                onClick={() => onNavigate('hero')}
                className="group relative h-64 border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(236,72,153,0.2)] text-left p-8 flex flex-col justify-end"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 opacity-60"></div>
                <div className="absolute top-0 right-0 p-4 opacity-30 group-hover:opacity-100 transition-opacity">
                    <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>

                <div className="relative z-10">
                    <h2 className="font-cinzel text-2xl mb-2 group-hover:text-pink-300 transition-colors">创意网页 Hero</h2>
                    <p className="text-gray-400 text-xs leading-relaxed">
                        设计师个人网站首屏案例。粒子作为背景，通过摄像头权限捕捉手势，与访客进行互动。
                    </p>
                    <div className="mt-6 flex items-center text-xs uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                        查看案例 <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                    </div>
                </div>
            </button>
        </div>

        <div className="pt-12 text-gray-600 text-[10px] uppercase tracking-[0.2em]">
            Powered by React Three Fiber & MediaPipe
        </div>
      </div>
    </div>
  );
};

export default Home;
