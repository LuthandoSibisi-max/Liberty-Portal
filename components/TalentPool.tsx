
import React, { useState, useMemo } from 'react';
import { TalentProfile, Request } from '../types';
import { geminiService } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MOCK_TALENT_POOL } from '../constants';

interface TalentPoolProps {
    requests: Request[];
}

const MARKET_DATA = [
    { name: 'FNB', count: 279, color: '#009999' },
    { name: 'Absa', count: 275, color: '#be0028' },
    { name: 'Standard Bank', count: 227, color: '#0033aa' },
    { name: 'Nedbank', count: 176, color: '#004f32' },
    { name: 'Discovery', count: 163, color: '#1f2a44' },
    { name: 'Capitec', count: 109, color: '#0087d1' },
    { name: 'Old Mutual', count: 87, color: '#009a44' },
    { name: 'Investec', count: 81, color: '#2d2d2d' },
    { name: 'Sanlam', count: 60, color: '#0074c9' }
];

type SortKey = 'matchScore' | 'name' | 'lastContacted';

export const TalentPool: React.FC<TalentPoolProps> = ({ requests }) => {
    const [talent, setTalent] = useState<TalentProfile[]>(MOCK_TALENT_POOL);
    const [selectedRequestId, setSelectedRequestId] = useState<number | string>('');
    const [isMatching, setIsMatching] = useState(false);
    const [outreachMessage, setOutreachMessage] = useState<string>('');
    const [selectedTalent, setSelectedTalent] = useState<TalentProfile | null>(null);
    const [isGeneratingOutreach, setIsGeneratingOutreach] = useState(false);
    
    // Status update states
    const [showContactDateInput, setShowContactDateInput] = useState(false);
    const [manualContactDate, setManualContactDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Sorting & Filtering State
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ 
        key: 'matchScore', 
        direction: 'desc' 
    });
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [skillSearch, setSkillSearch] = useState<string>(''); // Search within headline and AI Match Reason

    // Derived Sorted & Filtered List
    const processedTalent = useMemo(() => {
        let result = [...talent];

        // 1. Filter by Status
        if (statusFilter !== 'All') {
            result = result.filter(t => {
                if (statusFilter === 'Not Interested') return t.status === 'Not Interested' || t.status === 'Uninterested';
                return t.status === statusFilter;
            });
        }

        // 2. Filter by Skills/Keywords (Searches Name, Headline, and AI analysis text)
        if (skillSearch.trim()) {
            const term = skillSearch.toLowerCase();
            result = result.filter(t => 
                t.headline.toLowerCase().includes(term) || 
                (t.aiMatchReason && t.aiMatchReason.toLowerCase().includes(term)) ||
                t.name.toLowerCase().includes(term) ||
                t.currentCompany.toLowerCase().includes(term)
            );
        }

        // 3. Sort
        return result.sort((a, b) => {
            const { key, direction } = sortConfig;
            
            // Handle Match Score (Numeric)
            if (key === 'matchScore') {
                const scoreA = a.matchScore || 0;
                const scoreB = b.matchScore || 0;
                return direction === 'asc' ? scoreA - scoreB : scoreB - scoreA;
            }
            
            // Handle Name (String)
            if (key === 'name') {
                return direction === 'asc' 
                    ? a.name.localeCompare(b.name) 
                    : b.name.localeCompare(a.name);
            }

            // Handle Last Contacted (Date String)
            if (key === 'lastContacted') {
                const dateA = a.lastContacted ? new Date(a.lastContacted).getTime() : 0;
                const dateB = b.lastContacted ? new Date(b.lastContacted).getTime() : 0;
                return direction === 'asc' ? dateA - dateB : dateB - dateA;
            }

            return 0;
        });
    }, [talent, sortConfig, statusFilter, skillSearch]);

    const handleSort = (key: SortKey) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const getSortIcon = (key: SortKey) => {
        if (sortConfig.key !== key) return <i className="fas fa-sort text-slate-300 ml-1 opacity-50"></i>;
        return <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} text-indigo-600 dark:text-indigo-400 ml-1 scale-110`}></i>;
    };

    const handleSmartMatch = async () => {
        if (!selectedRequestId) {
            alert("Please select a job request to match against.");
            return;
        }
        setIsMatching(true);
        try {
            const req = requests.find(r => r.id == selectedRequestId);
            if (!req) return;

            const matches = await geminiService.findTalentMatches(talent, req.description || req.title);
            
            setTalent(prev => prev.map(t => {
                const match = matches.find((m: any) => m.id === t.id);
                if (match) {
                    return { ...t, status: 'Matched', matchScore: match.score, aiMatchReason: match.reason, matchedRequestId: req.id };
                }
                return t;
            }));
            
            // Default sort to match score after scanning
            setSortConfig({ key: 'matchScore', direction: 'desc' });
            setStatusFilter('All'); 

        } catch (e) {
            console.error(e);
            alert("Matching failed. Please try again.");
        } finally {
            setIsMatching(false);
        }
    };

    const handleGenerateMessage = async (t: TalentProfile) => {
        setSelectedTalent(t);
        setShowContactDateInput(false); 
        setManualContactDate(new Date().toISOString().split('T')[0]); 
        
        setIsGeneratingOutreach(true);
        try {
            const req = requests.find(r => r.id == selectedRequestId);
            const role = req ? req.title : "Financial Advisor";
            const company = "Liberty Group (Standard Bank)";

            const msg = await geminiService.generateOutreach(t.name, role, company);
            setOutreachMessage(msg);
        } catch(e) {
            console.error(e);
        } finally {
            setIsGeneratingOutreach(false);
        }
    };

    const handleSendOutreach = () => {
        if (selectedTalent) {
            const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            updateStatus(selectedTalent.id, 'Contacted', currentDate);
            alert(`Message sent to ${selectedTalent.name} and status updated to Contacted.`);
        }
    };

    const updateStatus = (id: string, status: TalentProfile['status'], date?: string) => {
        setTalent(prev => prev.map(t => t.id === id ? { 
            ...t, 
            status: status, 
            lastContacted: date || t.lastContacted 
        } : t));
        setSelectedTalent(null);
        setOutreachMessage('');
        setShowContactDateInput(false);
    };

    const handleManualContactClick = () => {
        setShowContactDateInput(true);
    };

    const confirmManualContact = () => {
        if (selectedTalent) {
            const dateObj = new Date(manualContactDate);
            const formattedDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            updateStatus(selectedTalent.id, 'Contacted', formattedDate);
        }
    };

    const handleMarkNotInterested = () => {
        if (selectedTalent) {
            if (confirm(`Mark ${selectedTalent.name} as Not Interested?`)) {
                updateStatus(selectedTalent.id, 'Not Interested');
            }
        }
    };

    return (
        <div className="p-6 h-full flex flex-col animate-fade-in-up">
            
            {/* Header / Report Summary */}
            <div className="mb-6">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Talent Pool Intelligence</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Manage connections, track outreach, and use AI to match talent.</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
                            <span className="text-xs font-bold text-slate-500">Target Role:</span>
                            <select 
                                className="bg-transparent border-none text-sm font-semibold text-slate-800 dark:text-white focus:outline-none w-40"
                                value={selectedRequestId}
                                onChange={(e) => setSelectedRequestId(e.target.value)}
                            >
                                <option value="">Select Request...</option>
                                {requests.filter(r => r.status === 'open' || r.status === 'in-progress').map(r => (
                                    <option key={r.id} value={r.id}>{r.title}</option>
                                ))}
                            </select>
                        </div>
                        <button 
                            onClick={handleSmartMatch}
                            disabled={isMatching || !selectedRequestId}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            <i className={`fas ${isMatching ? 'fa-circle-notch fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                            {isMatching ? 'Analyzing...' : 'AI Scan'}
                        </button>
                    </div>
                </div>

                {/* Report Stats Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Connections</div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-white">26,603</div>
                        <div className="text-[10px] text-green-600 font-bold mt-1">LinkedIn Network</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-liberty-blue">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Reachable Talent</div>
                        <div className="text-2xl font-bold text-liberty-blue dark:text-blue-400">3,847</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1">High Relevance</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Matched Candidates</div>
                        <div className="text-2xl font-bold text-purple-600">
                            {talent.filter(t => t.status === 'Matched').length}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1">AI Verified</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Conversion Rate</div>
                        <div className="text-2xl font-bold text-green-600">14.5%</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1">Potential Hires</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Talent List */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 flex justify-between items-center flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide">
                                Pool Results ({processedTalent.length})
                            </h3>
                            {skillSearch && (
                                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                                    Filtered by: {skillSearch}
                                </span>
                            )}
                        </div>
                        
                        {/* Filters */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="relative group">
                                <i className="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs transition-colors group-focus-within:text-liberty-blue"></i>
                                <input 
                                    type="text" 
                                    placeholder="Skills, Headline, or AI Reason..." 
                                    value={skillSearch}
                                    onChange={(e) => setSkillSearch(e.target.value)}
                                    className="pl-7 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-xs rounded-lg focus:outline-none focus:border-liberty-blue text-slate-700 dark:text-white w-56 shadow-sm"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-liberty-blue text-slate-700 dark:text-white shadow-sm"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Pool">Pool</option>
                                <option value="Matched">Matched</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Not Interested">Not Interested</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Table View */}
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th onClick={() => handleSort('name')} className="p-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600/50 transition-colors select-none">
                                        Candidate {getSortIcon('name')}
                                    </th>
                                    <th className="p-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Company</th>
                                    <th className="p-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th onClick={() => handleSort('matchScore')} className="p-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600/50 transition-colors select-none">
                                        Match {getSortIcon('matchScore')}
                                    </th>
                                    <th onClick={() => handleSort('lastContacted')} className="p-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600/50 transition-colors select-none">
                                        Last Contacted {getSortIcon('lastContacted')}
                                    </th>
                                    <th className="p-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {processedTalent.map(t => (
                                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0 shadow-sm border border-white dark:border-slate-600">
                                                    {t.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-slate-800 dark:text-white text-xs truncate">{t.name}</h4>
                                                        <a href={t.linkedInUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400"><i className="fab fa-linkedin text-xs"></i></a>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]" title={t.headline}>{t.headline}</p>
                                                    {t.aiMatchReason && (
                                                        <div className="text-[9px] text-purple-600 dark:text-purple-400 mt-0.5 flex items-center gap-1 truncate max-w-[180px]">
                                                            <i className="fas fa-robot"></i> {t.aiMatchReason}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{t.currentCompany}</span>
                                            <div className="text-[10px] text-slate-400">{t.location}</div>
                                        </td>
                                        <td className="p-3">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${
                                                t.status === 'Matched' ? 'bg-purple-100 text-purple-700 border-purple-200' : 
                                                t.status === 'Contacted' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                                                t.status === 'Not Interested' || t.status === 'Uninterested' ? 'bg-slate-200 text-slate-500 border-slate-300' : 'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${t.matchScore && t.matchScore >= 90 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                                                        style={{width: `${t.matchScore || 0}%`}}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.matchScore || 0}%</span>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <span className={`text-xs font-medium ${t.lastContacted ? 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded' : 'text-slate-400'}`}>
                                                {t.lastContacted || '-'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <button 
                                                onClick={() => handleGenerateMessage(t)}
                                                className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                                            >
                                                {t.status === 'Contacted' ? 'Follow Up' : 'Reach Out'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {processedTalent.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                                                    <i className="fas fa-search-minus text-2xl text-slate-300"></i>
                                                </div>
                                                <h4 className="text-slate-700 dark:text-slate-200 font-bold">No talent found</h4>
                                                <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
                                                <button onClick={() => {setSkillSearch(''); setStatusFilter('All');}} className="mt-3 text-xs text-liberty-blue font-bold hover:underline">Clear all filters</button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column: Key Talent Markets & Outreach */}
                <div className="flex flex-col gap-6 h-full">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 p-4 h-[300px] flex flex-col">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm uppercase tracking-wide">
                            Top Competitor Markets
                        </h3>
                        <div className="flex-1 w-full text-xs">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={MARKET_DATA} margin={{ left: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" tick={{fontSize: 10, fill: '#64748b'}} width={80} />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                                        {MARKET_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 p-6 flex flex-col flex-1 overflow-hidden">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-sm">
                            <i className="fas fa-paper-plane text-mno-blue"></i> Outreach Composer
                        </h3>
                        
                        {selectedTalent ? (
                            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pr-2">
                                <div className="mb-4">
                                    <div className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                                        Drafting for <span className="font-bold text-liberty-blue dark:text-blue-400">{selectedTalent.name}</span>
                                    </div>
                                    
                                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600 mb-4">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Manual Outreach Tracking</div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={handleManualContactClick} 
                                                className={`flex-1 py-1.5 rounded text-xs font-bold border transition-colors ${
                                                    showContactDateInput ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-blue-400'
                                                }`}
                                            >
                                                Mark Contacted
                                            </button>
                                            <button 
                                                onClick={handleMarkNotInterested}
                                                className="flex-1 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded text-xs font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                                            >
                                                Uninterested
                                            </button>
                                        </div>

                                        {showContactDateInput && (
                                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 animate-fade-in">
                                                <label className="block text-xs font-bold text-slate-500 mb-1">Outreach Date:</label>
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="date" 
                                                        value={manualContactDate}
                                                        onChange={(e) => setManualContactDate(e.target.value)}
                                                        className="flex-1 p-1.5 rounded text-xs border border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-1 focus:ring-blue-500"
                                                    />
                                                    <button 
                                                        onClick={confirmManualContact}
                                                        className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-500 transition-colors shadow-sm"
                                                    >
                                                        Log
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {isGeneratingOutreach ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 min-h-[150px]">
                                        <i className="fas fa-sparkles fa-spin text-2xl mb-2 text-purple-500"></i>
                                        <p className="text-xs font-medium">Personalizing message...</p>
                                    </div>
                                ) : (
                                    <>
                                        <textarea 
                                            value={outreachMessage} 
                                            onChange={(e) => setOutreachMessage(e.target.value)}
                                            className="w-full h-40 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none text-slate-800 dark:text-white mb-4 shadow-inner"
                                            placeholder="Write your LinkedIn outreach here..."
                                        ></textarea>
                                        <div className="flex gap-2">
                                            <button onClick={() => setSelectedTalent(null)} className="flex-1 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors">Discard</button>
                                            <button onClick={handleSendOutreach} className="flex-1 py-2 bg-liberty-blue text-white rounded-lg text-xs font-bold hover:bg-liberty-light transition-colors shadow-md active:scale-95">
                                                Send DM
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-4 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
                                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 shadow-sm border border-slate-100 dark:border-slate-700">
                                    <i className="fas fa-comment-dots text-xl text-slate-300"></i>
                                </div>
                                <p className="text-xs font-medium">Select a candidate from the pool to compose a personalized message.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
