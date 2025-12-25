
import React, { useState } from 'react';
import { UserRole, UserAccount } from '../types';

interface LandingPageProps {
    onLogin: (user: UserAccount) => void;
    users: UserAccount[];
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, users }) => {
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulate network delay
        setTimeout(() => {
            // Find user matching role (if specified) OR matching both email AND password correctly
            const user = users.find(u => 
                u.email.toLowerCase() === email.toLowerCase() && 
                u.password === password
            );
            
            if (user) {
                if (user.status === 'locked') {
                    setError('This account has been suspended. Please contact admin.');
                    setIsLoading(false);
                } else if (selectedRole && user.role !== selectedRole) {
                    setError(`These credentials do not have access to the ${selectedRole} portal.`);
                    setIsLoading(false);
                } else {
                    onLogin(user);
                }
            } else {
                setError('Invalid email or password. Please try again.');
                setIsLoading(false);
            }
        }, 1000);
    };

    const resetSelection = () => {
        setSelectedRole(null);
        setEmail('');
        setPassword('');
        setError('');
    };
    
    return (
        <div className="min-h-screen w-full bg-[#030712] text-white overflow-x-hidden relative font-sans selection:bg-indigo-500/30 flex flex-col">
            
            {/* --- Background Effects --- */}
            <div className="absolute inset-0 z-0">
                <div 
                    className="absolute inset-0 opacity-[0.15]" 
                    style={{
                        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
                        backgroundSize: '80px 80px',
                        transform: 'perspective(1000px) rotateX(60deg) translateY(0)',
                        transformOrigin: 'top center',
                    }}
                ></div>
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
                    <i className="fas fa-life-ring"></i> Support
                </button>
            </nav>

            {/* --- Main Content --- */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 w-full max-w-7xl mx-auto">
                
                {!selectedRole ? (
                    <div className="animate-fade-in w-full flex flex-col items-center">
                        {/* Hero Section */}
                        <div className="text-center mb-16 animate-fade-in-up">
                            <h2 className="text-blue-200 uppercase tracking-[0.2em] text-xs font-bold mb-4">Authority • Trust • Opportunity</h2>
                            <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-200 to-slate-500 drop-shadow-2xl">
                                Multi-Tenant <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Recruitment Portal</span>
                            </h1>
                            <p className="text-slate-400 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
                                Select a portal to access your secure environment.
                            </p>
                        </div>

                        {/* Grid of Portals */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full animate-fade-in-up" style={{animationDelay: '200ms'}}>
                            {/* 1. Admin Portal */}
                            <div 
                                onClick={() => setSelectedRole(UserRole.PARTNER)}
                                className="group relative bg-[#0B1120] border border-white/5 hover:border-indigo-500/50 rounded-3xl p-8 flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-[1px] bg-gradient-to-bl from-indigo-500/20 to-transparent w-32 h-32 rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-inner">
                                    <i className="fas fa-shield-halved text-2xl"></i>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">Admin Portal</h3>
                                <p className="text-sm text-slate-400 leading-relaxed mb-8 flex-1">Global oversight and user management.</p>
                                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider group-hover:gap-4 transition-all">Secure Entry <i className="fas fa-arrow-right"></i></div>
                            </div>

                            {/* 2. Client Portal */}
                            <div 
                                onClick={() => setSelectedRole(UserRole.LIBERTY)}
                                className="group relative bg-[#0B1120] border border-white/5 hover:border-blue-500/50 rounded-3xl p-8 flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-[1px] bg-gradient-to-bl from-blue-500/20 to-transparent w-32 h-32 rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner">
                                    <i className="fas fa-building-columns text-2xl"></i>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">Client Portal</h3>
                                <p className="text-sm text-slate-400 leading-relaxed mb-8 flex-1">For corporate clients to manage requests.</p>
                                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider group-hover:gap-4 transition-all">Secure Entry <i className="fas fa-arrow-right"></i></div>
                            </div>

                            {/* 3. MNO Hub */}
                            <div 
                                onClick={() => setSelectedRole(UserRole.RECRUITER)}
                                className="group relative bg-[#0B1120] border border-white/5 hover:border-emerald-500/50 rounded-3xl p-8 flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-[1px] bg-gradient-to-bl from-emerald-500/20 to-transparent w-32 h-32 rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-inner">
                                    <i className="fas fa-network-wired text-2xl"></i>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">MNO Hub</h3>
                                <p className="text-sm text-slate-400 leading-relaxed mb-8 flex-1">For internal recruiters to source talent.</p>
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider group-hover:gap-4 transition-all">Secure Entry <i className="fas fa-arrow-right"></i></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in-up w-full max-w-md">
                        {/* Login Form View */}
                        <div className="bg-[#0B1120] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                            <button 
                                onClick={resetSelection}
                                className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors"
                            >
                                <i className="fas fa-arrow-left mr-2"></i> Portals
                            </button>

                            <div className="flex flex-col items-center mb-10 mt-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl mb-6 ${
                                    selectedRole === UserRole.PARTNER ? 'bg-indigo-600' :
                                    selectedRole === UserRole.LIBERTY ? 'bg-blue-600' :
                                    'bg-emerald-600'
                                }`}>
                                    <i className={`fas ${
                                        selectedRole === UserRole.PARTNER ? 'fa-shield-halved' :
                                        selectedRole === UserRole.LIBERTY ? 'fa-building-columns' :
                                        'fa-network-wired'
                                    }`}></i>
                                </div>
                                <h2 className="text-2xl font-serif font-bold text-white text-center">
                                    {selectedRole === UserRole.PARTNER ? 'Admin Access' : 
                                     selectedRole === UserRole.LIBERTY ? 'Client Access' : 
                                     'MNO Hub Access'}
                                </h2>
                                <p className="text-slate-500 text-sm mt-2 text-center">Authorized personnel only.</p>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username / Email</label>
                                    <input 
                                        type="email" 
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-600"
                                        placeholder="Enter registered email..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Password</label>
                                    <input 
                                        type="password" 
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-600"
                                        placeholder="••••••••"
                                    />
                                </div>

                                {error && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold animate-pulse text-center">
                                        <i className="fas fa-exclamation-circle mr-2"></i> {error}
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className={`w-full py-4 text-white rounded-xl font-black text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-[0.1em] ${
                                        selectedRole === UserRole.PARTNER ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/20' :
                                        selectedRole === UserRole.LIBERTY ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20' :
                                        'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20'
                                    }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Authenticating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-lock-open text-[10px]"></i> Sign In
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>

            {/* --- Footer --- */}
            <footer className="relative z-10 py-8 text-center border-t border-white/5 bg-[#030712]">
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.15em]">
                    © 2025 My Next Opportunity. Authority. Trust. Opportunity.
                </p>
            </footer>
        </div>
    );
};
