
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Request, Activity, Candidate } from '../types';

interface RecruiterDashboardProps {
    requests: Request[];
    candidates: Candidate[];
    activities: Activity[];
}

const COLORS = ['#003366', '#E31837', '#0d9d58', '#f59e0b'];

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ requests, candidates, activities }) => {
    
    // Calculate Stats
    const activeRequests = requests.filter(r => r.status === 'open' || r.status === 'in-progress').length;
    const urgentRequests = requests.filter(r => r.urgency === 'high' && r.status !== 'closed').length;
    const filledPositions = candidates.filter(c => c.status === 'hired').length;
    const pipelineSize = candidates.filter(c => ['new', 'screen', 'shortlist', 'interview'].includes(c.status)).length;

    // Derived Data for Charts
    const deptCounts = requests.reduce((acc, curr) => {
        acc[curr.department] = (acc[curr.department] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    const chartData = Object.keys(deptCounts).map(dept => ({
        name: dept,
        value: deptCounts[dept]
    }));

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-8 animate-fade-in-up">
            <div className="mb-10">
                <h1 className="text-4xl font-serif font-bold text-slate-800 dark:text-white tracking-tight mb-2">Recruitment Overview</h1>
                <p className="text-slate-500 dark:text-slate-400">Welcome back. Here's your high-level pipeline status.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-700 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Requests</p>
                        <h3 className="text-4xl font-black text-slate-800 dark:text-white">{activeRequests}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full w-fit">
                        <i className="fas fa-bolt text-amber-500"></i> {urgentRequests} Urgent
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-700 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-green-500/10 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Positions Filled</p>
                        <h3 className="text-4xl font-black text-slate-800 dark:text-white">{filledPositions}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full w-fit">
                        <i className="fas fa-arrow-up"></i> YTD
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-700 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/10 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pipeline Volume</p>
                        <h3 className="text-4xl font-black text-slate-800 dark:text-white">{pipelineSize}</h3>
                    </div>
                    <div className="text-xs text-slate-400">
                        Candidates in process
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-lg flex flex-col justify-between h-40">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Time to Fill</p>
                        <h3 className="text-4xl font-black">24 <span className="text-lg font-medium text-slate-400">days</span></h3>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-400 h-full w-3/4"></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Requests by Department</h3>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-700 shadow-sm flex flex-col">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Recent Activity</h3>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {activities.length > 0 ? (
                            <div className="space-y-6">
                                {activities.slice(0, 6).map((act, idx) => (
                                    <div key={idx} className="flex gap-4 relative">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 ${
                                                act.type === 'request' ? 'bg-blue-500' : 'bg-green-500'
                                            }`}></div>
                                            {idx !== activities.length - 1 && <div className="w-0.5 h-full bg-slate-100 dark:bg-slate-800 my-1"></div>}
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold mb-0.5">{act.time}</p>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{act.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{act.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-slate-400 py-10 text-sm">No recent activity</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
