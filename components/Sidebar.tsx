
import React from 'react';
import { AppView, UserRole } from '../types';

interface SidebarProps {
    currentView: AppView;
    setView: (view: AppView) => void;
    userRole: UserRole;
    setUserRole: (role: UserRole) => void;
    onLogout: () => void;
}

type NavItem = {
    id: AppView;
    label: string;
    icon: string;
    section: string;
    badge?: string;
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, userRole, setUserRole, onLogout }) => {
    const isMNOAdmin = userRole === UserRole.PARTNER;
    const isMNORecruiter = userRole === UserRole.RECRUITER;
    const isClient = userRole === UserRole.LIBERTY;

    const mnoAdminNav: NavItem[] = [
        { id: AppView.PARTNER_DASHBOARD, label: 'Overview', icon: 'fa-building', section: 'Executive' },
        { id: AppView.ADMIN_CLIENTS, label: 'Client Management', icon: 'fa-briefcase', section: 'Executive' },
        { id: AppView.ADMIN_ENGAGEMENT, label: 'Client Engagement', icon: 'fa-handshake', section: 'Executive', badge: 'Live' },
        { id: AppView.ADMIN_PERFORMANCE, label: 'System Health', icon: 'fa-server', section: 'Operations' },
        { id: AppView.ADMIN_TOOLS, label: 'Advanced Tools', icon: 'fa-toolbox', section: 'Operations' },
        { id: AppView.ADMIN_COSTS, label: 'Cost Analysis', icon: 'fa-file-invoice-dollar', section: 'Operations' },
    ];

    const mnoRecruiterNav: NavItem[] = [
        { id: AppView.DASHBOARD, label: 'Recruiter Dashboard', icon: 'fa-chart-pie', section: 'Overview' },
        { id: AppView.REQUESTS, label: 'Open Jobs', icon: 'fa-inbox', section: 'Work' },
        { id: AppView.TALENT_POOL, label: 'Talent Pool', icon: 'fa-users-viewfinder', section: 'Work' },
        { id: AppView.PIPELINE, label: 'My Pipeline', icon: 'fa-stream', section: 'Work' },
        { id: AppView.CANDIDATES_DATABASE, label: 'Sourcing DB', icon: 'fa-database', section: 'Work' },
        { id: AppView.ANALYTICS, label: 'Analytics', icon: 'fa-chart-bar', section: 'Reports' },
    ];

    const libertyClientNav: NavItem[] = [
        { id: AppView.DASHBOARD, label: 'My Dashboard', icon: 'fa-chart-pie', section: 'Overview' },
        { id: AppView.REQUESTS, label: 'My Requests', icon: 'fa-file-signature', section: 'Hiring' },
        { id: AppView.PIPELINE, label: 'Candidate Board', icon: 'fa-columns', section: 'Hiring' },
        { id: AppView.INTERVIEW_COPILOT, label: 'Interview Copilot', icon: 'fa-headset', section: 'Tools' },
        { id: AppView.MEDIA_STUDIO, label: 'Media Studio', icon: 'fa-video', section: 'Tools' },
    ];

    let activeNav = isMNOAdmin ? mnoAdminNav : (isMNORecruiter ? mnoRecruiterNav : libertyClientNav);

    const groupedItems = activeNav.reduce((acc, item) => {
        if (!acc[item.section]) acc[item.section] = [];
        acc[item.section].push(item);
        return acc;
    }, {} as Record<string, NavItem[]>);

    return (
        <aside className="w-72 bg-[#0B1120] border-r border-white/5 flex flex-col shadow-2xl z-30 h-full relative transition-colors duration-500">
            {/* Logo Area */}
            <div className="px-8 py-10 shrink-0">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center font-serif font-bold text-white text-lg shadow-lg shadow-blue-500/20">M</div>
                    <h1 className="text-xl font-serif font-bold text-white tracking-tight">NextOpp.</h1>
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 text-[10px] font-bold uppercase tracking-wider bg-white/5 text-slate-300`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isClient ? 'bg-blue-500' : isMNORecruiter ? 'bg-emerald-400' : 'bg-indigo-500'} animate-pulse`}></span>
                    {isMNOAdmin ? 'ADMIN PORTAL' : (isMNORecruiter ? 'RECRUITER HUB' : 'CLIENT PORTAL')}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-6 pb-4 space-y-8 custom-scrollbar">
                {Object.entries(groupedItems).map(([section, items]) => (
                    <div key={section}>
                        <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{section}</h3>
                        <div className="space-y-1">
                            {items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setView(item.id)}
                                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative border ${
                                        currentView === item.id 
                                            ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' 
                                            : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <span className={`w-5 flex justify-center transition-colors ${currentView === item.id ? 'text-blue-400' : 'text-slate-500 group-hover:text-white'}`}>
                                        <i className={`fas ${item.icon}`}></i>
                                    </span>
                                    <span>{item.label}</span>
                                    {item.badge && <span className="ml-auto text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-red-500 shadow-md shadow-red-900/20">{item.badge}</span>}
                                    
                                    {/* Active Indicator Bar */}
                                    {currentView === item.id && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-6 border-t border-white/5 bg-[#030712]/50 shrink-0 flex flex-col gap-3">
                {!isClient && (
                    <button 
                        onClick={() => {
                            if (confirm("Reset current session and reload data?")) {
                                window.location.reload();
                            }
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-slate-300 hover:text-white"
                    >
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><i className="fas fa-sync text-xs"></i></div>
                        <div className="flex-1 text-left">
                            <h4 className="text-xs font-bold">Reset Interface</h4>
                        </div>
                    </button>
                )}

                <button onClick={onLogout} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 group transition-all">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 text-white font-bold text-xs shadow-lg">
                        {isClient ? 'KM' : 'LS'}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <h4 className="text-xs font-bold truncate text-white">{isClient ? 'Katlego Maetle' : 'Luthando Sibisi'}</h4>
                        <p className="text-[10px] text-slate-500">Logout</p>
                    </div>
                    <i className="fas fa-sign-out-alt text-slate-500 group-hover:text-red-400 transition-colors"></i>
                </button>
            </div>
        </aside>
    );
};
