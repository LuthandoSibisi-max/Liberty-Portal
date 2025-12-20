
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
        { id: AppView.ADMIN_COSTS, label: 'Cost Analysis', icon: 'fa-file-invoice-dollar', section: 'Operations' },
    ];

    const mnoRecruiterNav: NavItem[] = [
        { id: AppView.DASHBOARD, label: 'Recruiter Dashboard', icon: 'fa-chart-pie', section: 'Overview' },
        { id: AppView.REQUESTS, label: 'Open Jobs', icon: 'fa-inbox', section: 'Work' },
        { id: AppView.TALENT_POOL, label: 'Talent Pool', icon: 'fa-users-viewfinder', section: 'Work' },
        { id: AppView.PIPELINE, label: 'My Pipeline', icon: 'fa-stream', section: 'Work' },
        { id: AppView.CANDIDATES_DATABASE, label: 'Sourcing DB', icon: 'fa-database', section: 'Work' },
    ];

    const libertyClientNav: NavItem[] = [
        { id: AppView.DASHBOARD, label: 'My Dashboard', icon: 'fa-chart-pie', section: 'Overview' },
        { id: AppView.REQUESTS, label: 'My Requests', icon: 'fa-file-signature', section: 'Hiring' },
        { id: AppView.PIPELINE, label: 'Candidate Board', icon: 'fa-columns', section: 'Hiring' },
    ];

    let activeNav = isMNOAdmin ? mnoAdminNav : (isMNORecruiter ? mnoRecruiterNav : libertyClientNav);

    const groupedItems = activeNav.reduce((acc, item) => {
        if (!acc[item.section]) acc[item.section] = [];
        acc[item.section].push(item);
        return acc;
    }, {} as Record<string, NavItem[]>);

    return (
        <aside className="w-72 bg-white dark:bg-[#0B1120] border-r border-slate-100 dark:border-slate-800 flex flex-col shadow-sm z-30 h-full relative transition-colors duration-500">
            <div className="px-8 py-10 shrink-0">
                <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white tracking-tight mb-4">NextOpp.</h1>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${isClient ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-slate-900 border-slate-700 text-white'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isClient ? 'bg-blue-500' : 'bg-green-400'} animate-pulse`}></span>
                    {isMNOAdmin ? 'ADMIN PORTAL' : (isMNORecruiter ? 'RECRUITER HUB' : 'CLIENT PORTAL')}
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-6 pb-4 space-y-8">
                {Object.entries(groupedItems).map(([section, items]) => (
                    <div key={section}>
                        <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{section}</h3>
                        <div className="space-y-1">
                            {items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setView(item.id)}
                                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative ${currentView === item.id ? 'bg-slate-50 dark:bg-slate-800 text-blue-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                >
                                    <span className="w-5 flex justify-center"><i className={`fas ${item.icon}`}></i></span>
                                    <span>{item.label}</span>
                                    {item.badge && <span className="ml-auto text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-red-500">{item.badge}</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 shrink-0 flex flex-col gap-3">
                {!isClient && (
                    <button 
                        onClick={() => {
                            if (confirm("Reset current session and reload data?")) {
                                window.location.reload();
                            }
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 transition-all"
                    >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500"><i className="fas fa-sync"></i></div>
                        <div className="flex-1 text-left">
                            <h4 className="text-xs font-bold">Reset Interface</h4>
                        </div>
                    </button>
                )}

                <button onClick={onLogout} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 group transition-all">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-200 text-slate-600 font-bold">{isClient ? 'KM' : 'LS'}</div>
                    <div className="flex-1 text-left">
                        <h4 className="text-xs font-bold truncate">{isClient ? 'Katlego Maetle' : 'Luthando Sibisi'}</h4>
                        <p className="text-[10px] text-slate-400">Logout</p>
                    </div>
                    <i className="fas fa-sign-out-alt text-slate-300 group-hover:text-red-500 transition-colors"></i>
                </button>
            </div>
        </aside>
    );
};
