
import React, { useState, useMemo } from 'react';
import { AppView, Request, Submission, Client, FeatureRequest, AuditLogEntry, SecurityConfig } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { MOCK_CLIENTS, MOCK_FEATURE_REQUESTS, MOCK_AUDIT_LOGS, MOCK_ACTIVITIES } from '../constants';

interface PartnerDashboardProps {
    setView?: (view: AppView) => void;
    onSelectRequest?: (id: number | string) => void;
    requests?: Request[];
    submissions?: Submission[];
    currentView?: AppView;
}

export const PartnerDashboard: React.FC<PartnerDashboardProps> = ({ setView, onSelectRequest, requests = [], submissions = [], currentView }) => {
    
    const showSecurity = currentView === AppView.ADMIN_SECURITY;
    const showCosts = currentView === AppView.ADMIN_COSTS;
    const showUsers = currentView === AppView.ADMIN_USERS;
    const showClients = currentView === AppView.ADMIN_CLIENTS;
    const showEngagement = currentView === AppView.ADMIN_ENGAGEMENT;
    const showPerformance = currentView === AppView.ADMIN_PERFORMANCE;
    const showOverview = !showSecurity && !showCosts && !showUsers && !showClients && !showEngagement && !showPerformance;

    const [clients] = useState<Client[]>(MOCK_CLIENTS);
    
    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-8 animate-fade-in-up bg-slate-50/30 dark:bg-slate-900/30">
            
            {/* structural Header Preservation */}
            <div className="mb-10 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                        <i className="fas fa-shield-halved"></i> Global Administrator
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-slate-800 dark:text-white tracking-tight">
                        {showEngagement ? 'Client Engagement' : 
                         showPerformance ? 'System Health' :
                         showSecurity ? 'Security Center' : 
                         'Executive Console'}
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Monitoring multi-tenant architecture and fulfillment performance.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold shadow-sm hover:shadow-md transition-all">
                        <i className="fas fa-download mr-2"></i> Report
                    </button>
                    <button className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-bold shadow-xl hover:bg-black transition-all">
                        <i className="fas fa-gear mr-2"></i> Settings
                    </button>
                </div>
            </div>

            {showOverview && (
                <div className="space-y-8">
                    {/* High-Level Analytical Headings */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Uptime', value: '99.98%', icon: 'fa-server', color: 'text-green-500' },
                            { label: 'API Health', value: 'Nominal', icon: 'fa-bolt', color: 'text-blue-500' },
                            { label: 'Active Clients', value: clients.length, icon: 'fa-building', color: 'text-purple-500' },
                            { label: 'Security Threats', value: '0', icon: 'fa-shield-virus', color: 'text-slate-400' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex flex-col items-center text-center">
                                <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-700/50 ${stat.color} flex items-center justify-center text-xl mb-4 border border-slate-100 dark:border-slate-600`}>
                                    <i className={`fas ${stat.icon}`}></i>
                                </div>
                                <div className="text-2xl font-black text-slate-800 dark:text-white">{stat.value}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Placeholder for Performance Heading */}
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-700/50 shadow-sm min-h-[350px] flex flex-col">
                            <h3 className="font-serif font-bold text-xl text-slate-800 dark:text-white mb-8">Infrastructure Performance</h3>
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                                <i className="fas fa-chart-line text-6xl mb-6 opacity-20"></i>
                                <p className="text-sm font-bold text-slate-400">Awaiting System Metrics...</p>
                            </div>
                        </div>

                        {/* Placeholder for Revenue Heading */}
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-700/50 shadow-sm min-h-[350px] flex flex-col">
                            <h3 className="font-serif font-bold text-xl text-slate-800 dark:text-white mb-8">Revenue Analysis</h3>
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                                <i className="fas fa-coins text-6xl mb-6 opacity-20"></i>
                                <p className="text-sm font-bold text-slate-400">No Billing Cycles Found</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Other Sections (Clients, Engagement, etc) follow the same "Headings Preserved" logic */}
            {showClients && (
                <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-slate-800 dark:text-white">Client Portfolio</h2>
                            <p className="text-slate-500 mt-1 font-medium">Managing enterprise relationships and tenant access.</p>
                        </div>
                        <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all">
                            <i className="fas fa-plus mr-2"></i> Onboard New Client
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {clients.map((client, i) => (
                            <div key={i} className="p-8 border border-slate-100 dark:border-slate-700/50 rounded-3xl bg-slate-50/30 dark:bg-slate-800/30 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-white shadow-xl text-2xl font-serif mb-6" style={{backgroundColor: client.primaryColor}}>
                                    {client.name.substring(0, 2).toUpperCase()}
                                </div>
                                <h3 className="font-bold text-2xl text-slate-800 dark:text-white mb-1 font-serif">{client.name}</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{client.industry}</p>
                                <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-700">
                                    <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full uppercase tracking-widest">{client.status}</span>
                                    <i className="fas fa-arrow-right text-slate-300"></i>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
