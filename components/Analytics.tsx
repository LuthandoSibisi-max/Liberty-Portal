
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const FUNNEL_DATA = [
    { stage: 'Applied', count: 0 },
    { stage: 'Screened', count: 0 },
    { stage: 'Interview', count: 0 },
    { stage: 'Offer', count: 0 },
    { stage: 'Hired', count: 0 },
];

const TREND_DATA = [
    { month: 'Jan', applications: 0, hires: 0 },
    { month: 'Feb', applications: 0, hires: 0 },
    { month: 'Mar', applications: 0, hires: 0 },
    { month: 'Apr', applications: 0, hires: 0 },
    { month: 'May', applications: 0, hires: 0 },
    { month: 'Jun', applications: 0, hires: 0 },
];

const DEPT_DATA = [
    { name: 'Finance', value: 0 },
    { name: 'IT', value: 0 },
    { name: 'Sales', value: 0 },
    { name: 'Ops', value: 0 },
];

const COLORS = ['#003366', '#E31837', '#0d9d58', '#f59e0b'];

export const Analytics: React.FC = () => {
    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-6 animate-fade-in-up">
             <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Recruitment Analytics</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Deep dive into hiring performance and trends.</p>
                </div>
                <div className="flex gap-2">
                    <select className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-3 py-2 text-slate-700 dark:text-white shadow-sm focus:outline-none focus:border-liberty-blue">
                        <option>Last 6 Months</option>
                        <option>Year to Date</option>
                    </select>
                    <button className="px-4 py-2 bg-liberty-blue text-white rounded-lg text-sm font-bold shadow hover:bg-liberty-light transition-colors">
                        <i className="fas fa-download mr-2"></i> Export Report
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-liberty-blue dark:text-blue-400 flex items-center justify-center text-xl">
                            <i className="fas fa-stopwatch"></i>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-slate-800 dark:text-white">0 Days</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Avg Time to Fill</div>
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-green-600 font-bold flex items-center gap-1">
                        <i className="fas fa-minus"></i> No data available
                    </div>
                </div>

                 <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl">
                            <i className="fas fa-users"></i>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-slate-800 dark:text-white">0</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Total Hires</div>
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-green-600 font-bold flex items-center gap-1">
                        <i className="fas fa-minus"></i> No data available
                    </div>
                </div>

                 <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-xl">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-slate-800 dark:text-white">0%</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Acceptance Rate</div>
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-400 font-medium">
                        Based on 0 offers extended
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Recruitment Funnel */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Recruitment Funnel</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={FUNNEL_DATA} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="stage" type="category" tick={{fontSize: 12, fill: '#64748b'}} width={80} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                                <Bar dataKey="count" fill="#003366" radius={[0, 4, 4, 0]} barSize={30}>
                                    {FUNNEL_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === FUNNEL_DATA.length - 1 ? '#0d9d58' : '#003366'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Hiring Trends */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Hiring Trends</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={TREND_DATA}>
                                <defs>
                                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#003366" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#003366" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0d9d58" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#0d9d58" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                                <XAxis dataKey="month" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                                <Area type="monotone" dataKey="applications" stroke="#003366" fillOpacity={1} fill="url(#colorApps)" strokeWidth={2} name="Applications" />
                                <Area type="monotone" dataKey="hires" stroke="#0d9d58" fillOpacity={1} fill="url(#colorHires)" strokeWidth={2} name="Hires" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Hires by Department</h3>
                    <div className="h-[250px] relative">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={DEPT_DATA}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {DEPT_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-extrabold text-slate-800 dark:text-white">--</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Distribution</span>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4 flex-wrap">
                        {DEPT_DATA.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 text-white flex flex-col justify-center items-center text-center shadow-lg">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-2xl mb-4 backdrop-blur-md">
                        <i className="fas fa-file-alt text-blue-300"></i>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Need a custom report?</h3>
                    <p className="text-slate-300 max-w-md mb-6">Use the AI Toolkit to generate comprehensive partner performance reports or specific hiring analysis in seconds.</p>
                    <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg">
                        Go to AI Toolkit
                    </button>
                </div>
            </div>
        </div>
    );
};
