
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface Stat {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    icon: string;
    color: string;
}

export const AdminAdvancedTools: React.FC = () => {
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    
    // Feature States
    const [csvTemplateType, setCsvTemplateType] = useState('candidates');
    const [csvFormat, setCsvFormat] = useState('basic');
    const [generatedCsv, setGeneratedCsv] = useState('');
    const [emailCampaignType, setEmailCampaignType] = useState('invitation');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [docType, setDocType] = useState('contract');

    // Stats Data
    const stats: Stat[] = [
        { label: 'Active Candidates', value: '247', change: '12% from last week', trend: 'up', icon: 'fa-users', color: 'bg-blue-500' },
        { label: 'Open Positions', value: '18', change: '3 filled this week', trend: 'down', icon: 'fa-briefcase', color: 'bg-green-500' },
        { label: 'Interviews Today', value: '7', change: 'Next in 45 mins', trend: 'neutral', icon: 'fa-calendar-check', color: 'bg-amber-500' },
        { label: 'Time to Hire', value: '32d', change: 'Improved by 5 days', trend: 'up', icon: 'fa-chart-line', color: 'bg-cyan-500' },
    ];

    // Mock Chart Data
    const hiresData = [
        { name: 'Jan', value: 12 }, { name: 'Feb', value: 15 }, { name: 'Mar', value: 18 },
        { name: 'Apr', value: 14 }, { name: 'May', value: 22 }, { name: 'Jun', value: 19 },
        { name: 'Jul', value: 25 }, { name: 'Aug', value: 28 }, { name: 'Sep', value: 24 },
        { name: 'Oct', value: 30 }, { name: 'Nov', value: 27 }, { name: 'Dec', value: 32 }
    ];

    const sourceData = [
        { name: 'LinkedIn', value: 45, color: '#0077b5' },
        { name: 'MNO Portal', value: 38, color: '#003366' },
        { name: 'Referrals', value: 28, color: '#0d9d58' },
        { name: 'Career Site', value: 22, color: '#E31837' },
        { name: 'Job Boards', value: 18, color: '#f59e0b' }
    ];

    useEffect(() => {
        // Init activity log
        setRecentActivity([
            { action: 'Generated CSV template', time: '2 hours ago' },
            { action: 'Sent 5 interview invites', time: '4 hours ago' },
            { action: 'Updated analytics', time: 'Yesterday' },
            { action: 'API Sync: LinkedIn', time: '2 days ago' }
        ]);
    }, []);

    const logActivity = (action: string) => {
        setRecentActivity(prev => [{ action, time: 'Just now' }, ...prev.slice(0, 4)]);
    };

    // --- CSV Generator Logic ---
    const generateCSV = () => {
        let headers = [];
        let row = [];
        
        switch(csvTemplateType) {
            case 'candidates':
                headers = ['ID', 'First Name', 'Last Name', 'Email', 'Position', 'Experience', 'RE5'];
                row = ['001', 'John', 'Doe', 'john@example.com', 'Advisor', '5 Years', 'Yes'];
                break;
            case 'interviews':
                headers = ['ID', 'Candidate', 'Position', 'Date', 'Time', 'Interviewer', 'Type'];
                row = ['INT01', 'Jane Doe', 'Analyst', '2025-01-20', '14:00', 'Manager', 'Technical'];
                break;
            // Add other cases...
            default:
                headers = ['Column 1', 'Column 2'];
                row = ['Data 1', 'Data 2'];
        }

        let content = headers.join(',') + '\n';
        for(let i=0; i<5; i++) content += row.join(',') + '\n';
        
        setGeneratedCsv(content);
        setActiveModal('csv');
        logActivity(`Generated ${csvTemplateType} CSV`);
    };

    const downloadCSV = () => {
        const blob = new Blob([generatedCsv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${csvTemplateType}_template.csv`;
        link.click();
        setActiveModal(null);
    };

    // --- Email Builder Logic ---
    const loadEmailTemplate = (type: string) => {
        setEmailCampaignType(type);
        let subj = '';
        let body = '';
        
        if (type === 'rejection') {
            subj = 'Regarding your application for {{position}}';
            body = `Dear {{candidate_name}},\n\nThank you for your interest in the {{position}} role. After careful consideration...`;
        } else if (type === 'invitation') {
            subj = 'Interview Invitation: {{position}}';
            body = `Dear {{candidate_name}},\n\nWe are pleased to invite you for an interview on {{date}}...`;
        } else if (type === 'offer') {
            subj = 'Job Offer: {{position}} at Liberty';
            body = `Dear {{candidate_name}},\n\nWe are delighted to offer you the position of {{position}}...`;
        }
        
        setEmailSubject(subj);
        setEmailBody(body);
        setActiveModal('email');
    };

    // --- Document Generator Logic ---
    const generateDocument = () => {
        const doc = new jsPDF();
        
        // Header
        doc.setFillColor(0, 51, 102);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text('LIBERTY', 20, 25);
        doc.setFontSize(10);
        doc.text('Group Limited', 20, 32);
        
        // Content
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text(docType.toUpperCase().replace('_', ' '), 20, 60);
        
        doc.setFontSize(12);
        const content = `This is a generated ${docType} document.\n\nDate: ${new Date().toLocaleDateString()}\nID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}\n\nThis document serves as an official record.`;
        doc.text(content, 20, 80);
        
        // Save
        doc.save(`Liberty_${docType}_${new Date().toISOString().slice(0,10)}.pdf`);
        logActivity(`Generated ${docType} PDF`);
        alert("Document downloaded successfully.");
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <i className="fas fa-toolbox text-blue-500"></i> Advanced Recruitment Tools
                    </h2>
                    <p className="text-slate-400 mt-1">Professional utilities for Liberty & MNO partnership.</p>
                </div>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">RM</div>
                    <div>
                        <div className="text-xs font-bold text-white">Recruitment Manager</div>
                        <div className="text-[10px] text-slate-400">Last login: Just now</div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-[#0B1120] p-6 rounded-2xl border border-white/5 shadow-lg border-l-4 border-l-blue-500 hover:-translate-y-1 transition-transform">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl ${stat.color} shadow-lg`}>
                                <i className={`fas ${stat.icon}`}></i>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">{stat.label}</div>
                                <div className="text-2xl font-black text-white">{stat.value}</div>
                                <div className={`text-[10px] font-bold flex items-center gap-1 ${stat.trend === 'up' ? 'text-green-400' : stat.trend === 'down' ? 'text-red-400' : 'text-amber-400'}`}>
                                    <i className={`fas fa-arrow-${stat.trend === 'up' ? 'up' : stat.trend === 'down' ? 'down' : 'right'}`}></i>
                                    {stat.change}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                
                {/* CSV Generator */}
                <div className="bg-[#0B1120] rounded-2xl p-6 border border-white/5 shadow-lg flex flex-col hover:border-blue-500/30 transition-colors group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-blue-900/30 text-blue-400 flex items-center justify-center text-xl border border-blue-500/20">
                            <i className="fas fa-file-csv"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">CSV Templates</h3>
                            <p className="text-xs text-slate-400">Bulk upload structures</p>
                        </div>
                    </div>
                    <div className="space-y-4 flex-1">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Template Type</label>
                            <select 
                                value={csvTemplateType} 
                                onChange={(e) => setCsvTemplateType(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none"
                            >
                                <option value="candidates">Candidate Upload</option>
                                <option value="interviews">Interview Schedule</option>
                                <option value="feedback">Feedback Form</option>
                            </select>
                        </div>
                        <button onClick={generateCSV} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-900/20">
                            <i className="fas fa-magic mr-2"></i> Generate Template
                        </button>
                    </div>
                </div>

                {/* Email Builder */}
                <div className="bg-[#0B1120] rounded-2xl p-6 border border-white/5 shadow-lg flex flex-col hover:border-purple-500/30 transition-colors group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-purple-900/30 text-purple-400 flex items-center justify-center text-xl border border-purple-500/20">
                            <i className="fas fa-envelope-open-text"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">Email Campaigns</h3>
                            <p className="text-xs text-slate-400">Automated candidate comms</p>
                        </div>
                    </div>
                    <div className="space-y-4 flex-1">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Campaign Type</label>
                            <select 
                                onChange={(e) => loadEmailTemplate(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-purple-500 outline-none"
                            >
                                <option value="">Select template...</option>
                                <option value="invitation">Interview Invite</option>
                                <option value="rejection">Rejection Letter</option>
                                <option value="offer">Job Offer</option>
                            </select>
                        </div>
                        <button onClick={() => loadEmailTemplate('invitation')} className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-purple-900/20">
                            <i className="fas fa-edit mr-2"></i> Open Builder
                        </button>
                    </div>
                </div>

                {/* Analytics */}
                <div className="bg-[#0B1120] rounded-2xl p-6 border border-white/5 shadow-lg flex flex-col hover:border-amber-500/30 transition-colors group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-amber-900/30 text-amber-400 flex items-center justify-center text-xl border border-amber-500/20">
                            <i className="fas fa-chart-pie"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">Deep Analytics</h3>
                            <p className="text-xs text-slate-400">Pipeline health & trends</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-white/5 p-2 rounded-lg text-center">
                            <div className="text-lg font-bold text-white">87%</div>
                            <div className="text-[10px] text-slate-500 uppercase">Fill Rate</div>
                        </div>
                        <div className="bg-white/5 p-2 rounded-lg text-center">
                            <div className="text-lg font-bold text-white">32d</div>
                            <div className="text-[10px] text-slate-500 uppercase">Avg Time</div>
                        </div>
                    </div>
                    <button onClick={() => setActiveModal('analytics')} className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-amber-900/20 mt-auto">
                        <i className="fas fa-chart-bar mr-2"></i> View Dashboard
                    </button>
                </div>

                {/* Document Gen */}
                <div className="bg-[#0B1120] rounded-2xl p-6 border border-white/5 shadow-lg flex flex-col hover:border-teal-500/30 transition-colors group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-teal-900/30 text-teal-400 flex items-center justify-center text-xl border border-teal-500/20">
                            <i className="fas fa-file-contract"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">Doc Generator</h3>
                            <p className="text-xs text-slate-400">Contracts & Offers</p>
                        </div>
                    </div>
                    <div className="space-y-4 flex-1">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Document Type</label>
                            <select 
                                value={docType}
                                onChange={(e) => setDocType(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-teal-500 outline-none"
                            >
                                <option value="contract">Employment Contract</option>
                                <option value="offer">Offer Letter</option>
                                <option value="nda">NDA</option>
                            </select>
                        </div>
                        <button onClick={generateDocument} className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-teal-900/20">
                            <i className="fas fa-file-download mr-2"></i> Generate PDF
                        </button>
                    </div>
                </div>

                {/* API Integration */}
                <div className="bg-[#0B1120] rounded-2xl p-6 border border-white/5 shadow-lg flex flex-col hover:border-cyan-500/30 transition-colors group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-cyan-900/30 text-cyan-400 flex items-center justify-center text-xl border border-cyan-500/20">
                            <i className="fas fa-plug"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">API Integration</h3>
                            <p className="text-xs text-slate-400">External HR Systems</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-3 rounded-lg mb-4">
                        <span className="text-xs font-bold text-green-400">System Status</span>
                        <span className="text-[10px] font-black bg-green-500 text-black px-2 py-0.5 rounded">CONNECTED</span>
                    </div>
                    <button onClick={() => alert("System integration active. No configuration needed.")} className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-cyan-900/20 mt-auto">
                        <i className="fas fa-cog mr-2"></i> Configure API
                    </button>
                </div>

                {/* Calendar Sync */}
                <div className="bg-[#0B1120] rounded-2xl p-6 border border-white/5 shadow-lg flex flex-col hover:border-indigo-500/30 transition-colors group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-indigo-900/30 text-indigo-400 flex items-center justify-center text-xl border border-indigo-500/20">
                            <i className="fas fa-calendar-alt"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">Calendar Sync</h3>
                            <p className="text-xs text-slate-400">Automated Scheduling</p>
                        </div>
                    </div>
                    <div className="flex gap-2 mb-4">
                        <div className="flex-1 bg-white/5 rounded-lg p-2 text-center text-xs text-slate-400">Google</div>
                        <div className="flex-1 bg-white/5 rounded-lg p-2 text-center text-xs text-slate-400">Outlook</div>
                        <div className="flex-1 bg-white/5 rounded-lg p-2 text-center text-xs text-slate-400">Teams</div>
                    </div>
                    <button onClick={() => alert("Calendars synced.")} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-900/20 mt-auto">
                        <i className="fas fa-sync mr-2"></i> Sync Now
                    </button>
                </div>
            </div>

            {/* Quick Actions & Recent */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#0B1120] rounded-2xl p-8 border border-white/5 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <i className="fas fa-bolt text-yellow-400"></i> Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Import Data', icon: 'fa-upload' },
                            { label: 'Export All', icon: 'fa-download' },
                            { label: 'Backup', icon: 'fa-database' },
                            { label: 'Diagnostics', icon: 'fa-stethoscope' },
                            { label: 'Cleanup', icon: 'fa-broom' },
                            { label: 'Report', icon: 'fa-file-chart' },
                            { label: 'Sync', icon: 'fa-sync' },
                            { label: 'Clear Cache', icon: 'fa-trash' }
                        ].map((action, i) => (
                            <button key={i} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group">
                                <i className={`fas ${action.icon} text-slate-400 group-hover:text-white text-lg`}></i>
                                <span className="text-xs font-bold text-slate-400 group-hover:text-white">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-[#0B1120] rounded-2xl p-8 border border-white/5 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <i className="fas fa-history text-slate-400"></i> Recent Activity
                    </h3>
                    <div className="space-y-4">
                        {recentActivity.map((act, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                <span className="text-sm font-bold text-slate-200">{act.action}</span>
                                <span className="text-xs text-slate-500 font-mono">{act.time}</span>
                            </div>
                        ))}
                        {recentActivity.length === 0 && <div className="text-slate-500 text-sm">No recent activity.</div>}
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {activeModal === 'csv' && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0B1120] rounded-3xl w-full max-w-2xl border border-white/10 shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Generated CSV Template</h3>
                            <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><i className="fas fa-times"></i></button>
                        </div>
                        <div className="p-6">
                            <div className="bg-black/30 p-4 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre border border-white/5 mb-6">
                                {generatedCsv}
                            </div>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setActiveModal(null)} className="px-6 py-2 rounded-xl text-slate-400 hover:text-white font-bold text-sm">Cancel</button>
                                <button onClick={downloadCSV} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm">Download</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'email' && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0B1120] rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col border border-white/10 shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-purple-900/20">
                            <h3 className="text-xl font-bold text-white">Email Campaign Builder</h3>
                            <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><i className="fas fa-times"></i></button>
                        </div>
                        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Subject</label>
                                    <input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Body</label>
                                    <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="w-full h-64 bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none resize-none font-mono text-sm leading-relaxed" />
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {['{{candidate_name}}', '{{position}}', '{{company}}', '{{date}}'].map(v => (
                                        <button key={v} onClick={() => setEmailBody(prev => prev + v)} className="px-3 py-1 bg-white/5 rounded-lg text-xs font-mono text-purple-400 hover:bg-purple-900/30 border border-white/5">
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-3">
                            <button onClick={() => setActiveModal(null)} className="px-6 py-3 rounded-xl text-slate-400 hover:text-white font-bold text-sm">Cancel</button>
                            <button onClick={() => { setActiveModal(null); logActivity('Sent Test Email'); alert('Test email sent'); }} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm">Send Test</button>
                            <button onClick={() => { setActiveModal(null); logActivity('Saved Email Template'); alert('Template saved'); }} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-sm shadow-lg">Save Template</button>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'analytics' && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0B1120] rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col border border-white/10 shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-amber-900/20">
                            <h3 className="text-xl font-bold text-white">Deep Analytics Dashboard</h3>
                            <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><i className="fas fa-times"></i></button>
                        </div>
                        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                    <h4 className="text-white font-bold mb-4">Monthly Hiring Velocity</h4>
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={hiresData}>
                                                <defs>
                                                    <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#94a3b8'}} />
                                                <YAxis stroke="#64748b" tick={{fill: '#94a3b8'}} />
                                                <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff'}} />
                                                <Area type="monotone" dataKey="value" stroke="#f59e0b" fillOpacity={1} fill="url(#colorHires)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                    <h4 className="text-white font-bold mb-4">Source Performance</h4>
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={sourceData} layout="vertical">
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="name" type="category" width={80} tick={{fill: '#94a3b8'}} />
                                                <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff'}} />
                                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                                    {sourceData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                <h4 className="text-white font-bold mb-4">Predictive Insights</h4>
                                <div className="text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                                    • Expected hires next month: 18-22
                                    • Best performing source: LinkedIn (32% conversion)
                                    • Optimal interview-to-offer ratio: 4:1
                                    • Predicted time to fill open positions: 28-35 days
                                    
                                    Recommendations:
                                    1. Increase LinkedIn budget by 15%
                                    2. Focus on technical roles in Q3
                                    3. Improve interview scheduling efficiency
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
