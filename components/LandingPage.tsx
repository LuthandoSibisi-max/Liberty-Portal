
import React from 'react';
import { UserRole } from '../types';

interface LandingPageProps {
    onLogin: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
    
    const handleCardClick = (role: UserRole) => {
        // Direct access, bypassing login simulation
        onLogin(role);
    };

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#050914] text-white overflow-hidden relative font-sans selection:bg-blue-500/30">
            
            {/* Ambient Background Animation */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0B1120] via-[#0f172a] to-[#020617]"></div>
                
                <div 
                    className="absolute inset-0 opacity-[0.08]" 
                    style={{
                        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.3) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                        transform: 'perspective(500px) rotateX(60deg) translateY(0)',
                        transformOrigin: 'top center',
                        animation: 'gridMove 20s linear infinite'
                    }}
                ></div>

                <div className="absolute bottom-[-25%] left-1/2 -translate-x-1/2 w-[120vw] h-[50vh] bg-blue-600/10 rounded-[100%] blur-[80px]"></div>
                <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[80vw] h-[30vh] bg-indigo-500/10 rounded-[100%] blur-[60px] animate-pulse"></div>
            </div>

            {/* Content Container */}
            <div className="z-10 flex flex-col items-center text-center p-6 w-full max-w-7xl mx-auto transition-all duration-500">
                
                <h1 
                    className="font-serif font-bold tracking-tight mb-6"
                    style={{
                        fontSize: 'clamp(2.5rem, 6vw, 5rem)', 
                        lineHeight: '1.1',
                        background: 'linear-gradient(180deg, #FFFFFF 0%, #E2E8F0 40%, #94A3B8 60%, #CBD5E1 80%, #FFFFFF 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 0 40px rgba(255,255,255,0.1))'
                    }}
                >
                    MY NEXT OPPORTUNITY
                </h1>

                <p className="font-sans text-slate-400 opacity-90 mb-16 uppercase font-light tracking-[0.25em] text-sm md:text-base max-w-2xl border-t border-white/10 pt-6">
                    Authority. Trust. Opportunity.
                </p>

                {/* The 3 Doors */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4">
                    
                    {/* Card 1: Admin */}
                    <button 
                        onClick={() => handleCardClick(UserRole.PARTNER)}
                        className="group relative h-96 bg-gradient-to-b from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-slate-700/30 rounded-3xl p-8 flex flex-col items-center justify-center hover:border-indigo-500/50 hover:bg-slate-800/60 transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-2xl"
                    >
                        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-8 shadow-lg shadow-indigo-900/50 group-hover:scale-110 transition-transform duration-500">
                            <i className="fas fa-shield-alt text-4xl text-white"></i>
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-white mb-2 tracking-wide">Admin Portal</h3>
                        <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors font-light">Platform Owner & Executive</p>
                        <div className="mt-auto px-8 py-3 rounded-full border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                            Enter Console
                        </div>
                    </button>

                    {/* Card 2: MNO Hub (Recruiter) */}
                    <button 
                        onClick={() => handleCardClick(UserRole.RECRUITER)}
                        className="group relative h-96 bg-gradient-to-b from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-slate-700/30 rounded-3xl p-8 flex flex-col items-center justify-center hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-2xl"
                    >
                        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-8 shadow-lg shadow-emerald-900/50 group-hover:scale-110 transition-transform duration-500">
                            <i className="fas fa-network-wired text-4xl text-white"></i>
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-white mb-2 tracking-wide">MNO Hub</h3>
                        <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors font-light">Internal Operations</p>
                        <div className="mt-auto px-8 py-3 rounded-full border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                            Access Hub
                        </div>
                    </button>

                    {/* Card 3: Client Access */}
                    <button 
                        onClick={() => handleCardClick(UserRole.LIBERTY)}
                        className="group relative h-96 bg-gradient-to-b from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-slate-700/30 rounded-3xl p-8 flex flex-col items-center justify-center hover:border-blue-500/50 hover:bg-slate-800/60 transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-2xl"
                    >
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-8 shadow-lg shadow-blue-900/50 group-hover:scale-110 transition-transform duration-500">
                            <i className="fas fa-globe-africa text-4xl text-white"></i>
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-white mb-2 tracking-wide">Client Portal</h3>
                        <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors font-light">Hiring Managers & Partners</p>
                        <div className="mt-auto px-8 py-3 rounded-full border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                            Client Login
                        </div>
                    </button>
                </div>

                <div className="mt-24 text-slate-600 text-[10px] tracking-widest uppercase opacity-50">
                    Secure Multi-Tenant Architecture v2.5.0 • Powered by Google Cloud
                </div>
            </div>

            <style>{`
                @keyframes gridMove {
                    0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
                    100% { transform: perspective(500px) rotateX(60deg) translateY(60px); }
                }
            `}</style>
        </div>
    );
};
