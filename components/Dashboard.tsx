
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AppView, Request, Candidate, Activity } from '../types';
import { RequestWizard } from './RequestWizard';

interface DashboardProps {
    setView: (view: AppView) => void;
    requests?: Request[];
    candidates?: Candidate[];
    onAddRequest?: (request: Request) => void;
    activities?: Activity[];
}

const PIE_COLORS = ['#003366', '#E31837', '#0d9d58', '#f59e0b'];

const DashboardEmptyState: React.FC<{ title: string; desc: string; icon: string }> = ({ title, desc, icon }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700 shadow-sm text-slate-300">
            <i className={`fas ${icon} text-2xl`}></i>
        </div>
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">{title}</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-[200px]">{desc}</p>
    </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ setView, requests = [], candidates = [], onAddRequest, activities = [] }) => {
    const [showRequestWizard, setShowRequestWizard] = useState(false);

    // Dynamic Calculations
    const totalCandidates = candidates.length;
    const activeRequests = requests.filter(r => r.status === 'open' || r.status === 'in-progress').length;
    const hiredCount = candidates.filter(c => c.status === 'hired').length;
    const totalTargetHires = requests.reduce((sum, r) => sum + (r.targetHires || 1), 0);
    const globalProgress = totalTargetHires > 0 ? (hiredCount / totalTargetHires) * 100 : 0;

    const PIE_DATA = totalCandidates > 0 ? [
        { name: 'New/Screen', value: candidates.filter(c => c.status === 'new' || c.status === 'screen').length },
        { name: 'Shortlist', value: candidates.filter(c => c.status === 'shortlist').length },
        { name: 'Interview', value: candidates.filter(c => c.status === 'interview').length },
        { name: 'Offer/Hired', value: candidates.filter(c => c.status === 'offer' || c.status === 'hired').length }
    ] : [{ name: 'No Data', value: 1 }];

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-6 animate-fade-in-up">
            <div className="flex flex-col gap-6">
                
                {/* Enterprise Welcome Header */}
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-liberty-blue via-blue-900 to-indigo-950 text-white shadow-2xl p-10 border border-white/5 shrink-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest mb-4 backdrop-blur-md">
                                <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                                Platform Initialized
                            </div>
                            <h1 className="text-4xl font-serif font-bold mb-3 tracking-tight">Ready for your next opportunity.</h1>
                            <p className="text-blue-100/70 text-lg font-light leading-relaxed max-w-xl">
                                Your recruitment workspace is fresh and optimized. Start by creating a new search request or exploring the global talent pool.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                            <button 
                                onClick={() => setView(AppView.TALENT_POOL)}
                                className="px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl text-sm font-bold backdrop-blur-xl transition-all flex items-center justify-center gap-3 text-white shadow-xl"
                            >
                                <i className="fas fa-users-viewfinder"></i> Explore Pool
                            </button>
                            <button 
                                onClick={() => setShowRequestWizard(true)}
                                className="px-8 py-4 bg-white text-liberty-blue rounded-2xl text-sm font-black shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-white/10 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
                            >
                                <i className="fas fa-plus text-liberty-accent group-hover:rotate-90 transition-transform duration-500"></i> 
                                Create Request
                            </button>
                        </div>
                    </div>
                </div>

                {/* Performance Grid Headings */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Pipeline Capacity', value: totalCandidates, icon: 'fa-users', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                        { label: 'Active Searches', value: activeRequests, icon: 'fa-briefcase', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                        { label: 'Pending Reviews', value: 0, icon: 'fa-clock', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                        { label: 'Success Rate', value: '0%', icon: 'fa-trophy', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-500 group">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform`}>
                                <i className={`fas ${stat.icon}`}></i>
                            </div>
                            <div className="text-2xl font-black text-slate-800 dark:text-white mb-1">{stat.value}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        
                        {/* Global Progress Heading */}
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200/60 dark:border-slate-700 shadow-sm relative overflow-hidden">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h3 className="font-serif font-bold text-2xl text-slate-800 dark:text-white">Fulfillment Progress</h3>
                                    <p className="text-sm text-slate-400 mt-1">Live tracking of hiring goals across all clients.</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-slate-800 dark:text-white">{hiredCount} <span className="text-slate-300 dark:text-slate-600 text-xl">/ {totalTargetHires || 0}</span></div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hires Confirmed</div>
                                </div>
                            </div>
                            <div className="w-full h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-1000" style={{ width: `${globalProgress}%` }}></div>
                            </div>
                            {totalTargetHires === 0 && <div className="mt-4 text-[10px] text-slate-400 italic">Assign targets in the Request Detail view.</div>}
                        </div>

                        {/* Recent Activity Heading */}
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200/60 dark:border-slate-700 shadow-sm flex-1 min-h-[400px]">
                            <h3 className="font-serif font-bold text-2xl text-slate-800 dark:text-white mb-8 flex items-center gap-3">
                                <i className="fas fa-bolt text-amber-500 text-xl"></i>
                                Audit Stream
                            </h3>
                            {activities.length > 0 ? (
                                <div className="space-y-6">
                                    {/* Activity items would go here */}
                                </div>
                            ) : (
                                <DashboardEmptyState 
                                    title="System Log Empty" 
                                    desc="Your activity history will appear here once you start managing requests." 
                                    icon="fa-history" 
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Pipeline Funnel Heading */}
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200/60 dark:border-slate-700 shadow-sm min-h-[400px] flex flex-col">
                            <h3 className="font-serif font-bold text-2xl text-slate-800 dark:text-white mb-2">Talent Funnel</h3>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-8">Candidate Distribution</p>
                            
                            <div className="flex-1 flex flex-col justify-center">
                                {totalCandidates > 0 ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie data={PIE_DATA} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                                {PIE_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <DashboardEmptyState 
                                        title="No Active Pipelines" 
                                        desc="Candidate distribution will visualize here as you shortlist talent." 
                                        icon="fa-chart-pie" 
                                    />
                                )}
                            </div>
                        </div>

                        {/* Quick Tips Preservation */}
                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <i className="fas fa-lightbulb text-yellow-400"></i> Platform Tips
                            </h3>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-blue-400"><i className="fas fa-robot"></i></div>
                                    <p className="text-xs text-slate-300 leading-relaxed">Use <strong>AI Scout</strong> inside any request to automatically find matches from the 26k talent database.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-purple-400"><i className="fas fa-video"></i></div>
                                    <p className="text-xs text-slate-300 leading-relaxed">Generate personalized <strong>Veo Recruitment Videos</strong> in the Media Studio for higher conversion.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showRequestWizard && (
                <RequestWizard onClose={() => setShowRequestWizard(false)} onAddRequest={onAddRequest} />
            )}
        </div>
    );
};
