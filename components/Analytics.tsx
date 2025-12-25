
import React, { useState, useEffect } from 'react';
import { Request, Candidate } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, ComposedChart
} from "recharts";
import { format, differenceInDays, parseISO, subMonths } from 'date-fns';
import {
  Users, UserCheck, Clock, Percent, Briefcase, TrendingUp, TrendingDown,
  ArrowRight, Target, DollarSign, Download, RefreshCw, Filter, MoreVertical,
  Eye, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon
} from "lucide-react";

// --- Mock UI Components (Replacing Shadcn) ---

const Card = ({ children, className = "" }: any) => (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm ${className}`}>
        {children}
    </div>
);
const CardHeader = ({ children, className = "" }: any) => <div className={`p-6 pb-2 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = "" }: any) => <h3 className={`font-bold text-lg text-slate-800 dark:text-white ${className}`}>{children}</h3>;
const CardDescription = ({ children, className = "" }: any) => <p className={`text-sm text-slate-500 dark:text-slate-400 mt-1 ${className}`}>{children}</p>;
const CardContent = ({ children, className = "" }: any) => <div className={`p-6 pt-4 ${className}`}>{children}</div>;
const CardFooter = ({ children, className = "" }: any) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

const Button = ({ children, variant = "primary", size = "md", className = "", ...props }: any) => {
    const base = "inline-flex items-center justify-center rounded-xl font-bold transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-95";
    const variants: any = {
        primary: "bg-slate-900 text-white hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 shadow-md",
        outline: "border border-slate-200 bg-transparent hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800",
        ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300",
    };
    const sizes: any = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 py-2 text-sm" };
    return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
};

const Badge = ({ children, variant = "default", className = "" }: any) => {
    const variants: any = {
        default: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-white",
        success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        destructive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ring-black/5 dark:ring-white/10 ${variants[variant] || variants.default} ${className}`}>{children}</span>;
};

const Progress = ({ value, className = "", indicatorClassName = "" }: any) => (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700 ${className}`}>
        <div className={`h-full bg-slate-900 dark:bg-blue-500 transition-all duration-500 ${indicatorClassName}`} style={{ width: `${value || 0}%` }} />
    </div>
);

// --- Constants & Types ---

const COLORS = {
    primary: '#003366',
    accent: '#E31837',
    success: '#0d9d58',
    warning: '#f59e0b',
    info: '#0ea5e9',
    muted: '#94a3b8'
};

interface AnalyticsProps {
    requests: Request[];
    candidates: Candidate[];
}

// --- Chart Components ---

const StatCard = ({ title, value, icon: Icon, trend, trendType, description, color = "primary", loading = false }: any) => {
    if (loading) return <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>;
    
    return (
        <Card className="relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                <Icon size={64} />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-black mb-2 text-slate-800 dark:text-white">{value}</div>
                <div className="flex items-center text-xs">
                    {trendType === 'positive' ? <TrendingUp className="mr-1 h-3 w-3 text-green-500" /> : <TrendingDown className="mr-1 h-3 w-3 text-red-500" />}
                    <span className={trendType === 'positive' ? 'text-green-600 font-bold' : trendType === 'negative' ? 'text-red-600 font-bold' : 'text-slate-500'}>
                        {trend}
                    </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">{description}</p>
            </CardContent>
        </Card>
    );
};

export const Analytics: React.FC<AnalyticsProps> = ({ requests, candidates }) => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [timeRange, setTimeRange] = useState('90d');

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    // --- Calculations ---
    const hiredCandidates = candidates.filter(c => c.status === 'hired');
    const totalHires = hiredCandidates.length;
    const activePipeline = candidates.filter(c => !['hired', 'rejected', 'sourced'].includes(c.status)).length;
    
    // Avg Time to Fill (Mock logic if dates missing)
    const avgTimeToFill = 24; // Hardcoded for demo stability or calculate if dates exist

    const openPositions = requests.reduce((acc, r) => r.status !== 'filled' && r.status !== 'closed' ? acc + (r.targetHires || 1) : acc, 0);
    const acceptanceRate = 92; // Mock
    
    // Funnel Data
    const funnelData = [
        { name: 'Applied', value: candidates.length },
        { name: 'Screened', value: candidates.filter(c => c.status !== 'new').length },
        { name: 'Interview', value: candidates.filter(c => ['interview', 'offer', 'hired'].includes(c.status)).length },
        { name: 'Offer', value: candidates.filter(c => ['offer', 'hired'].includes(c.status)).length },
        { name: 'Hired', value: totalHires },
    ];

    // Hires by Month (Mock Last 6 Months)
    const trendData = Array.from({ length: 6 }).map((_, i) => {
        const d = subMonths(new Date(), 5 - i);
        return {
            name: format(d, 'MMM'),
            hires: Math.floor(Math.random() * 10) + 2,
            applications: Math.floor(Math.random() * 50) + 20,
            interviews: Math.floor(Math.random() * 20) + 5
        };
    });

    // Hires by Dept
    const hiresByDept = hiredCandidates.reduce((acc: any, c) => {
        const req = requests.find(r => r.id == c.requestId);
        const dept = req?.department || 'General';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
    }, {});
    
    const pieData = Object.keys(hiresByDept).length > 0 
        ? Object.entries(hiresByDept).map(([name, value]) => ({ name, value }))
        : [{ name: 'No Data', value: 1 }];

    const PIE_COLORS = [COLORS.primary, COLORS.accent, COLORS.success, COLORS.warning, COLORS.info];

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-8 animate-fade-in-up space-y-8">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 text-liberty-blue dark:text-blue-400" />
                        Recruitment Analytics
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time insights into hiring velocity and quality.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        {['overview', 'funnel', 'quality'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold capitalize transition-all ${
                                    activeTab === tab 
                                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                </div>
            </div>

            {/* Content Based on Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    {/* KPI Cards */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard 
                            title="Avg. Time to Fill" 
                            value={`${avgTimeToFill}d`} 
                            icon={Clock} 
                            trend="-2 days" 
                            trendType="positive"
                            description="vs. 30 day target"
                            color="primary"
                            loading={loading}
                        />
                        <StatCard 
                            title="Total Hires" 
                            value={`${totalHires}`} 
                            icon={UserCheck} 
                            trend="+12%" 
                            trendType="positive"
                            description={`${openPositions} active roles`}
                            color="success"
                            loading={loading}
                        />
                        <StatCard 
                            title="Active Pipeline" 
                            value={`${activePipeline}`} 
                            icon={Users} 
                            trend="+8" 
                            trendType="neutral"
                            description="Candidates in process"
                            color="warning"
                            loading={loading}
                        />
                        <StatCard 
                            title="Offer Acceptance" 
                            value={`${acceptanceRate}%`} 
                            icon={Percent} 
                            trend="+1.5%" 
                            trendType="positive"
                            description="Industry avg: 85%"
                            color="info"
                            loading={loading}
                        />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LineChartIcon className="h-5 w-5 text-liberty-blue" /> Hiring Velocity
                                </CardTitle>
                                <CardDescription>Applications vs Hires over last 6 months</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                            />
                                            <Area type="monotone" dataKey="applications" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorApps)" strokeWidth={2} />
                                            <Bar dataKey="hires" barSize={20} fill={COLORS.success} radius={[4, 4, 0, 0]} />
                                            <Line type="monotone" dataKey="interviews" stroke={COLORS.warning} strokeWidth={2} dot={{r: 4}} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChartIcon className="h-5 w-5 text-liberty-blue" /> Hires by Dept
                                </CardTitle>
                                <CardDescription>Distribution across business units</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-center">
                                            <span className="text-3xl font-bold text-slate-800 dark:text-white">{totalHires}</span>
                                            <p className="text-xs text-slate-500 uppercase font-bold">Total</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'funnel' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Conversion Funnel</CardTitle>
                        <CardDescription>Candidate progression efficiency</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={funnelData}
                                    layout="vertical"
                                    margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} tick={{fontWeight: 'bold', fill: '#64748b'}} />
                                    <Tooltip cursor={{fill: 'transparent'}} />
                                    <Bar dataKey="value" fill={COLORS.primary} radius={[0, 4, 4, 0]} barSize={40}>
                                        {funnelData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === funnelData.length - 1 ? COLORS.success : COLORS.primary} opacity={1 - (index * 0.1)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'quality' && (
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Source Quality</CardTitle>
                            <CardDescription>Retention by recruitment channel</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {[
                                { source: 'LinkedIn Direct', score: 92 },
                                { source: 'Agency Referral', score: 88 },
                                { source: 'Careers Page', score: 75 },
                                { source: 'Job Boards', score: 64 }
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="flex justify-between mb-2 text-sm font-bold">
                                        <span>{item.source}</span>
                                        <span>{item.score}%</span>
                                    </div>
                                    <Progress value={item.score} indicatorClassName={item.score > 80 ? 'bg-green-500' : item.score > 70 ? 'bg-blue-500' : 'bg-amber-500'} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Diversity Metrics</CardTitle>
                            <CardDescription>Pipeline demographic breakdown</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center h-64 text-slate-400">
                            <div className="text-center">
                                <PieChartIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>Insufficient data for diversity analysis.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};
