
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppView, Request, Submission, Client, UserRole, Activity, Candidate, UserAccount } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, Cell } from 'recharts';
import { geminiService } from '../services/geminiService';
import { ReportModal } from './ReportModal';
import { AdminSystemConfig } from './AdminSystemConfig';
import { AdminUserManagement } from './AdminUserManagement';
import { storageService } from '../services/storageService';

interface PartnerDashboardProps {
    setView?: (view: AppView) => void;
    onSelectRequest?: (id: number | string) => void;
    requests: Request[];
    candidates: Candidate[];
    submissions: Submission[];
    activities: Activity[];
    currentView?: AppView;
    // New Props for Auth Management
    allUsers: UserAccount[];
    setAllUsers: (users: UserAccount[]) => void;
}

export const PartnerDashboard: React.FC<PartnerDashboardProps> = ({ 
    setView, onSelectRequest, requests, candidates, submissions, activities, currentView,
    allUsers, setAllUsers
}) => {
    
    // View Routing
    const showSecurity = currentView === AppView.ADMIN_SECURITY;
    const showCosts = currentView === AppView.ADMIN_COSTS;
    const showUsers = currentView === AppView.ADMIN_USERS;
    const showClients = currentView === AppView.ADMIN_CLIENTS;
    const showEngagement = currentView === AppView.ADMIN_ENGAGEMENT;
    const showPerformance = currentView === AppView.ADMIN_PERFORMANCE;
    const showOverview = !showSecurity && !showCosts && !showUsers && !showClients && !showEngagement && !showPerformance;

    // -- Calculations --
    const uptime = "99.98%";
    const openRoles = requests.filter(r => r.status !== 'filled').length;
    const totalSubmissions = submissions.length;

    // -- Usage & Costs --
    const [aiUsage, setAiUsage] = useState(() => storageService.load('ai_usage', { flash: 0, pro: 0, veo: 0 }));
    
    useEffect(() => {
        const interval = setInterval(() => {
            setAiUsage(storageService.load('ai_usage', { flash: 0, pro: 0, veo: 0 }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const estimatedBill = useMemo(() => {
        return (aiUsage.flash * 0.01 + aiUsage.pro * 0.05 + aiUsage.veo * 0.50).toFixed(2);
    }, [aiUsage]);

    const costGraphData = [
        { name: 'Flash', count: aiUsage.flash, color: '#3b82f6' },
        { name: 'Pro', count: aiUsage.pro, color: '#8b5cf6' },
        { name: 'Veo', count: aiUsage.veo, color: '#ec4899' },
    ];

    // -- Live Tracking --
    const [livePoints, setLivePoints] = useState(Array.from({ length: 20 }, (_, i) => ({ time: i, load: 10 + Math.random() * 10 })));

    useEffect(() => {
        const interval = setInterval(() => {
            setLivePoints(prev => [...prev.slice(1), { time: Date.now(), load: 15 + (activities.length * 2) + Math.random() * 10 }]);
        }, 2000);
        return () => clearInterval(interval);
    }, [activities]);

    // -- Report State --
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportHtml, setReportHtml] = useState('');
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    const handleGenerateReport = async () => {
        setIsGeneratingReport(true);
        try {
            const html = await geminiService.generatePerformanceReport({ 
                openRoles, 
                totalSubmissions, 
                hired: candidates.filter(c => c.status === 'hired').length,
                aiUsage 
            });
            setReportHtml(html);
            setShowReportModal(true);
        } catch (e) {
            alert("Failed to generate report");
        } finally {
            setIsGeneratingReport(false);
        }
    };
    
    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-8 animate-fade-in-up bg-[#030712] text-white">
            
            {/* Global Header */}
            <div className="mb-10 flex justify-between items-end border-b border-white/5 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                        <i className="fas fa-shield-halved"></i> Global Administrator
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-white tracking-tight flex items-center gap-3">
                        {showUsers ? 'Identity Governance' : 
                         showSecurity ? 'Security Center' : 
                         showCosts ? 'Financial Overview' :
                         showClients ? 'Client Management' :
                         'Executive Console'}
                         {showEngagement && <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]"></span>}
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium max-w-2xl">
                        Monitoring {allUsers.length} system users and global cloud consumption.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleGenerateReport}
                        disabled={isGeneratingReport}
                        className="px-5 py-2.5 bg-[#0B1120] border border-white/10 rounded-2xl text-xs font-bold text-white hover:bg-white/5 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isGeneratingReport ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-file-contract"></i>}
                        Monthly Report
                    </button>
                    <button onClick={() => setView && setView(AppView.ADMIN_PERFORMANCE)} className="px-5 py-2.5 bg-white text-slate-900 rounded-2xl text-xs font-bold shadow-xl hover:bg-slate-200 transition-all">
                        <i className="fas fa-sliders-h mr-2"></i> Settings
                    </button>
                </div>
            </div>

            {showOverview && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatItem label="System Uptime" value={uptime} icon="fa-server" color="text-green-400" />
                        <StatItem label="API Health" value="Nominal" icon="fa-bolt" color="text-blue-400" />
                        <StatItem label="System Users" value={allUsers.length} icon="fa-users" color="text-purple-400" />
                        <StatItem label="Cloud Cost" value={`$${estimatedBill}`} icon="fa-cloud" color="text-emerald-400" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-[#0B1120] p-8 rounded-[2.5rem] border border-white/5 shadow-sm min-h-[400px] flex flex-col">
                            <h3 className="font-bold text-xl text-white mb-6">Infrastructure Performance</h3>
                            <div className="flex-1 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={livePoints}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="time" hide />
                                        <YAxis hide domain={[0, 100]} />
                                        <Area type="monotone" dataKey="load" stroke="#3b82f6" fill="rgba(59,130,246,0.1)" strokeWidth={3} isAnimationActive={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-[#0B1120] p-8 rounded-[2.5rem] border border-white/5 shadow-sm flex flex-col">
                            <h3 className="font-bold text-xl text-white mb-6">Quick Actions</h3>
                            <div className="space-y-3 flex-1">
                                <button onClick={() => setView && setView(AppView.ADMIN_USERS)} className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-between transition-all border border-white/5 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-900/30 text-blue-400 flex items-center justify-center">
                                            <i className="fas fa-user-plus"></i>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-bold text-white">Create Account</div>
                                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Assign Roles</div>
                                        </div>
                                    </div>
                                    <i className="fas fa-chevron-right text-slate-600 group-hover:text-blue-400 transition-colors"></i>
                                </button>
                                <button onClick={() => setView && setView(AppView.ADMIN_SECURITY)} className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-between transition-all border border-white/5 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-900/30 text-purple-400 flex items-center justify-center">
                                            <i className="fas fa-key"></i>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-bold text-white">Security Audit</div>
                                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Credential Scan</div>
                                        </div>
                                    </div>
                                    <i className="fas fa-chevron-right text-slate-600 group-hover:text-purple-400 transition-colors"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showUsers && <AdminUserManagement users={allUsers} setUsers={setAllUsers} />}
            {showPerformance && <AdminSystemConfig />}
            
            {showCosts && (
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-[#0B1120] p-8 rounded-[2.5rem] border border-white/5 shadow-sm">
                            <h3 className="font-bold text-xl text-white mb-6">Model Usage Distribution</h3>
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={costGraphData}>
                                        <XAxis dataKey="name" stroke="#64748b" />
                                        <YAxis stroke="#64748b" />
                                        <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0B1120', border: 'none', borderRadius: '12px'}} />
                                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                            {costGraphData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-[#0B1120] p-8 rounded-[2.5rem] border border-white/5 shadow-sm flex flex-col items-center justify-center">
                            <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">Total Session Cost</h4>
                            <div className="text-6xl font-black text-indigo-400">${estimatedBill}</div>
                            <div className="mt-8 space-y-4 w-full">
                                <UsageRow label="Flash Calls" value={aiUsage.flash} color="bg-blue-500" />
                                <UsageRow label="Pro Calls" value={aiUsage.pro} color="bg-purple-500" />
                                <UsageRow label="Veo Videos" value={aiUsage.veo} color="bg-pink-500" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showEngagement && (
                <div className="bg-[#0B1120] rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col h-[calc(100vh-250px)]">
                    <div className="p-6 border-b border-white/5 bg-white/5 backdrop-blur-md flex justify-between items-center">
                        <h3 className="font-bold text-white">Live System Audit Feed</h3>
                        <span className="px-3 py-1 bg-green-900/30 text-green-400 text-[10px] font-black rounded-full border border-green-800">STREAMING</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-3 font-mono text-xs custom-scrollbar">
                        {activities.length > 0 ? activities.map((act, i) => (
                            <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-xl animate-fade-in">
                                <span className="text-blue-400">[{act.time}]</span> <span className="text-indigo-300 font-bold">{act.user}</span>: {act.title} - {act.description}
                            </div>
                        )) : (
                            <div className="text-slate-500 italic py-10 text-center">Awaiting platform events...</div>
                        )}
                    </div>
                </div>
            )}

            <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} reportHtml={reportHtml} />
        </div>
    );
};

const StatItem = ({ label, value, icon, color }: any) => (
    <div className="bg-[#0B1120] p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
        <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
            <i className={`fas ${icon} text-4xl ${color}`}></i>
        </div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{label}</div>
        <div className="text-3xl font-black text-white">{value}</div>
    </div>
);

const UsageRow = ({ label, value, color }: any) => (
    <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color}`}></div>
            <span className="text-xs text-slate-400">{label}</span>
        </div>
        <span className="font-bold text-white">{value}</span>
    </div>
);
