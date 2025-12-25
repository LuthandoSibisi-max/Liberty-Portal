
import React from 'react';
import { UserRole } from '../types';

interface LandingPageProps {
    onLogin: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
    
    return (
        <div className="min-h-screen w-full bg-[#030712] text-white overflow-x-hidden relative font-sans selection:bg-indigo-500/30 flex flex-col">
            
            {/* --- Background Effects --- */}
            <div className="absolute inset-0 z-0">
                {/* Moving Grid */}
                <div 
                    className="absolute inset-0 opacity-[0.15]" 
                    style={{
                        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
                        backgroundSize: '80px 80px',
                        transform: 'perspective(1000px) rotateX(60deg) translateY(0)',
                        transformOrigin: 'top center',
                        animation: 'gridMove 40s linear infinite'
                    }}
                ></div>
                {/* Glow Orbs */}
                <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vh] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[10%] w-[30vw] h-[30vh] bg-indigo-600/10 rounded-full blur-[100px]"></div>
            </div>

            {/* --- Header / Nav --- */}
            <nav className="relative z-20 px-8 py-6 flex justify-between items-center border-b border-white/5 bg-[#030712]/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center font-serif font-bold text-lg shadow-lg shadow-blue-500/20">M</div>
                    <span className="font-bold tracking-tight text-sm text-slate-200">My Next Opportunity <span className="text-slate-600 mx-2">|</span> <span className="text-xs uppercase tracking-widest text-slate-500">Authority. Trust. Opportunity.</span></span>
                </div>
                <button className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10">
                    <i className="fas fa-life-ring"></i> Contact Support
                </button>
            </nav>

            {/* --- Main Content --- */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 w-full max-w-7xl mx-auto">
                
                {/* Hero Badge */}
                <div className="mb-8 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-400 uppercase tracking-widest shadow-[0_0_15px_rgba(74,222,128,0.2)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                        Platform V2.0 Live
                    </div>
                </div>

                {/* Hero Typography */}
                <div className="text-center mb-16 animate-fade-in-up" style={{animationDelay: '100ms'}}>
                    <h2 className="text-blue-200 uppercase tracking-[0.2em] text-xs font-bold mb-4">Authority • Trust • Opportunity</h2>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-200 to-slate-500 drop-shadow-2xl">
                        The Multi-Tenant <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Recruitment Ecosystem</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
                        Seamlessly connecting Admin oversight, Client needs, and MNO Recruiters in one unified, secure platform.
                    </p>
                </div>

                {/* The 3 Portals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full animate-fade-in-up" style={{animationDelay: '200ms'}}>
                    
                    {/* 1. Admin Portal */}
                    <div 
                        onClick={() => onLogin(UserRole.PARTNER)}
                        className="group relative bg-[#0B1120] border border-white/5 hover:border-indigo-500/50 rounded-3xl p-8 flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-[1px] bg-gradient-to-bl from-indigo-500/20 to-transparent w-32 h-32 rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-inner">
                            <i className="fas fa-shield-halved text-2xl"></i>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">Admin Portal</h3>
                        <p className="text-sm text-slate-400 leading-relaxed mb-8 flex-1">
                            Global oversight, client management, system configuration, and platform-wide analytics.
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider group-hover:gap-4 transition-all">
                            Enter Dashboard <i className="fas fa-arrow-right"></i>
                        </div>
                    </div>

                    {/* 2. Client Portal */}
                    <div 
                        onClick={() => onLogin(UserRole.LIBERTY)}
                        className="group relative bg-[#0B1120] border border-white/5 hover:border-blue-500/50 rounded-3xl p-8 flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-[1px] bg-gradient-to-bl from-blue-500/20 to-transparent w-32 h-32 rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner">
                            <i className="fas fa-building-columns text-2xl"></i>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">Client Portal</h3>
                        <p className="text-sm text-slate-400 leading-relaxed mb-8 flex-1">
                            For corporate clients (e.g., Liberty) to manage requests, view pipelines, and track performance.
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider group-hover:gap-4 transition-all">
                            Login as Liberty <i className="fas fa-arrow-right"></i>
                        </div>
                    </div>

                    {/* 3. MNO Hub */}
                    <div 
                        onClick={() => onLogin(UserRole.RECRUITER)}
                        className="group relative bg-[#0B1120] border border-white/5 hover:border-emerald-500/50 rounded-3xl p-8 flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-[1px] bg-gradient-to-bl from-emerald-500/20 to-transparent w-32 h-32 rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-inner">
                            <i className="fas fa-network-wired text-2xl"></i>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">MNO Hub</h3>
                        <p className="text-sm text-slate-400 leading-relaxed mb-8 flex-1">
                            For MNO internal recruiters to view active roles, submit candidates, and track placement success.
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider group-hover:gap-4 transition-all">
                            Access MNO Hub <i className="fas fa-arrow-right"></i>
                        </div>
                    </div>

                </div>
            </main>

            {/* --- Footer --- */}
            <footer className="relative z-10 py-8 text-center border-t border-white/5 bg-[#030712]">
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.15em]">
                    © 2025 My Next Opportunity. Secure Multi-Tenant Architecture.
                </p>
            </footer>

            <style>{`
                @keyframes gridMove {
                    0% { transform: perspective(1000px) rotateX(60deg) translateY(0); }
                    100% { transform: perspective(1000px) rotateX(60deg) translateY(80px); }
                }
            `}</style>
        </div>
    );
};
