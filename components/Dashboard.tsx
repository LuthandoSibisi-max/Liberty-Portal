
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
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
        <div className="w-16 h-16 bg-[#030712] rounded-2xl flex items-center justify-center mb-4 border border-white/5 shadow-inner text-slate-600">
            <i className={`fas ${icon} text-2xl`}></i>
        </div>
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-[200px]">{desc}</p>
    </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ setView, requests = [], candidates = [], onAddRequest, activities = [] }) => {
    const [showRequestWizard, setShowRequestWizard] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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

    const stagnantCandidates = candidates.filter(c => (c.daysInStage || 0) > 5).length;

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-6 animate-fade-in-up">
            <div className="flex flex-col gap-6">
                
                {/* Enterprise Welcome Header */}
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0B1120] to-[#030712] border border-white/5 shadow-2xl p-10 shrink-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold uppercase tracking-widest mb-4 backdrop-blur-md text-blue-400">
                                <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)] animate-pulse"></span>
                                Client Portal Active
                            </div>
                            <h1 className="text-4xl font-serif font-bold mb-3 tracking-tight text-white">Welcome back, Liberty Group.</h1>
                            <p className="text-slate-400 text-lg font-light leading-relaxed max-w-xl">
                                Your recruitment workspace is fresh and optimized. Start by creating a new search request or exploring the global talent pool.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                            <button 
                                onClick={() => setView(AppView.TALENT_POOL)}
                                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold backdrop-blur-xl transition-all flex items-center justify-center gap-3 text-white shadow-lg"
                            >
                                <i className="fas fa-users-viewfinder"></i> Explore Pool
                            </button>
                            <button 
                                onClick={() => setShowRequestWizard(true)}
                                className="px-8 py-4 bg-white text-[#0B1120] rounded-2xl text-sm font-black shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-white/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
                            >
                                <i className="fas fa-plus text-blue-600 group-hover:rotate-90 transition-transform duration-500"></i> 
                                Create Request
                            </button>
                        </div>
                    </div>
                </div>

                {/* AI Morning Brief Widget */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-[#0B1120] p-6 rounded-2xl border border-white/5 shadow-sm flex items-start gap-4">
                        <div className="w-12 h-12 bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/20">
                            <i className="fas fa-robot text-2xl"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                                AI Daily Brief <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">GENERATED</span>
                            </h3>
                            <div className="space-y-2">
                                <p className="text-sm text-slate-300 flex items-start gap-2">
                                    <i className="fas fa-exclamation-triangle text-amber-500 mt-1 text-xs"></i>
                                    <span><span className="font-bold text-white">{stagnantCandidates} candidates</span> are stalling in the pipeline for more than 5 days.</span>
                                </p>
                                <p className="text-sm text-slate-300 flex items-start gap-2">
                                    <i className="fas fa-check-circle text-green-500 mt-1 text-xs"></i>
                                    <span><span className="font-bold text-white">{candidates.filter(c => c.status === 'new').length} new applicants</span> need screening for "Financial Advisor" roles.</span>
                                </p>
                                <p className="text-sm text-slate-300 flex items-start gap-2">
                                    <i className="fas fa-chart-line text-blue-500 mt-1 text-xs"></i>
                                    <span>Market Trend: Salary expectations for "Senior Developers" have risen 5% this week.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-[#0B1120] p-6 rounded-2xl border border-white/5 shadow-sm flex flex-col justify-center text-center relative overflow-hidden group cursor-pointer hover:border-blue-500/30 transition-colors" onClick={() => setView(AppView.PIPELINE)}>
                        <div className="absolute top-0 right-0 p-[1px] bg-gradient-to-bl from-blue-500/10 to-transparent w-20 h-20 rounded-bl-full"></div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Priority Focus</div>
                        <div className="text-3xl font-black text-white mb-1">Screening</div>
                        <div className="text-xs text-blue-400 font-bold group-hover:text-blue-300 transition-colors flex items-center justify-center gap-1">
                            View Pending Tasks <i className="fas fa-arrow-right"></i>
                        </div>
                    </div>
                </div>

                {/* Quick Actions & Filters Bar */}
                <div className="flex justify-between items-center bg-[#0B1120] p-4 rounded-2xl shadow-sm border border-white/5">
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${showAdvancedFilters ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                        >
                            <i className="fas fa-sliders-h"></i> Advanced Filters
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-xs text-slate-500 font-medium self-center mr-2">Quick Access:</span>
                        <button onClick={() => setView(AppView.REQUESTS)} className="w-8 h-8 rounded-full bg-blue-900/20 text-blue-400 border border-blue-500/20 flex items-center justify-center hover:scale-110 transition-transform" title="Requests">
                            <i className="fas fa-briefcase text-xs"></i>
                        </button>
                        <button onClick={() => setView(AppView.PIPELINE)} className="w-8 h-8 rounded-full bg-purple-900/20 text-purple-400 border border-purple-500/20 flex items-center justify-center hover:scale-110 transition-transform" title="Pipeline">
                            <i className="fas fa-stream text-xs"></i>
                        </button>
                        <button onClick={() => setView(AppView.CALENDAR)} className="w-8 h-8 rounded-full bg-green-900/20 text-green-400 border border-green-500/20 flex items-center justify-center hover:scale-110 transition-transform" title="Calendar">
                            <i className="fas fa-calendar-alt text-xs"></i>
                        </button>
                    </div>
                </div>

                {/* Performance Grid Headings */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Pipeline Capacity', value: totalCandidates, icon: 'fa-users', color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-500/20' },
                        { label: 'Active Searches', value: activeRequests, icon: 'fa-briefcase', color: 'text-purple-400', bg: 'bg-purple-900/20 border-purple-500/20' },
                        { label: 'Pending Reviews', value: candidates.filter(c => c.status === 'new').length, icon: 'fa-clock', color: 'text-amber-400', bg: 'bg-amber-900/20 border-amber-500/20' },
                        { label: 'Success Rate', value: '12%', icon: 'fa-trophy', color: 'text-green-400', bg: 'bg-green-900/20 border-green-500/20' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#0B1120] p-6 rounded-3xl border border-white/5 shadow-sm hover:border-white/10 transition-all duration-300 group">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} border flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform`}>
                                <i className={`fas ${stat.icon}`}></i>
                            </div>
                            <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Timeline Visualization */}
                <div className="bg-[#0B1120] p-8 rounded-[2rem] border border-white/5 shadow-sm">
                    <h3 className="font-serif font-bold text-xl text-white mb-6">Hiring Timeline</h3>
                    <div className="relative h-20 flex items-center px-4">
                        <div className="absolute left-0 right-0 top-1/2 h-1 bg-white/5 -translate-y-1/2 rounded-full"></div>
                        
                        {/* Timeline Markers */}
                        {['Request', 'Sourcing', 'Screening', 'Interview', 'Offer', 'Hired'].map((stage, i) => (
                            <div key={stage} className="relative z-10 flex flex-col items-center" style={{ width: '16.66%' }}>
                                <div className={`w-4 h-4 rounded-full border-4 border-[#0B1120] shadow-sm ${i === 0 ? 'bg-blue-500 scale-125 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-700'}`}></div>
                                <span className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{stage}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        
                        {/* Global Progress Heading */}
                        <div className="bg-[#0B1120] p-8 rounded-[2rem] border border-white/5 shadow-sm relative overflow-hidden">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h3 className="font-serif font-bold text-2xl text-white">Fulfillment Progress</h3>
                                    <p className="text-sm text-slate-400 mt-1">Live tracking of hiring goals across all clients.</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-white">{hiredCount} <span className="text-slate-600 text-xl">/ {totalTargetHires || 0}</span></div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hires Confirmed</div>
                                </div>
                            </div>
                            <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-1000 relative" style={{ width: `${globalProgress}%` }}>
                                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>
                            {totalTargetHires === 0 && <div className="mt-4 text-[10px] text-slate-500 italic">Assign targets in the Request Detail view.</div>}
                        </div>

                        {/* Recent Activity Heading */}
                        <div className="bg-[#0B1120] p-8 rounded-[2rem] border border-white/5 shadow-sm flex-1 min-h-[400px]">
                            <h3 className="font-serif font-bold text-2xl text-white mb-8 flex items-center gap-3">
                                <i className="fas fa-bolt text-amber-500 text-xl"></i>
                                Audit Stream
                            </h3>
                            {activities.length > 0 ? (
                                <div className="space-y-6">
                                    {activities.map((act, idx) => (
                                        <div key={act.id || idx} className="flex gap-4 items-start animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                                            <div className="w-10 h-10 rounded-full bg-blue-900/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                                                <i className={`fas ${act.type === 'request' ? 'fa-file-alt' : act.type === 'candidate' ? 'fa-user-plus' : 'fa-info-circle'}`}></i>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{act.title}</h4>
                                                <p className="text-xs text-slate-400 mt-1">{act.description}</p>
                                                <span className="text-[10px] text-slate-500 block mt-1">{act.time}</span>
                                            </div>
                                        </div>
                                    ))}
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
                        <div className="bg-[#0B1120] p-8 rounded-[2rem] border border-white/5 shadow-sm min-h-[400px] flex flex-col">
                            <h3 className="font-serif font-bold text-2xl text-white mb-2">Talent Funnel</h3>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-8">Candidate Distribution</p>
                            
                            <div className="flex-1 flex flex-col justify-center">
                                {totalCandidates > 0 ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie data={PIE_DATA} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                                {PIE_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{backgroundColor: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}} />
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
                        <div className="bg-[#0B1120] rounded-[2rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
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
