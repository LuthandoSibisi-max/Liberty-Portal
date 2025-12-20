
import React, { useState, useMemo } from 'react';
import { Candidate, Request } from '../types';
import { CandidateDetailModal } from './CandidateDetailModal';
import { geminiService } from '../services/geminiService';

interface CandidateDatabaseProps {
    candidates?: Candidate[]; 
    requests?: Request[];
    onAddNote?: (candidateId: number, text: string) => void;
    onUpdateCandidate?: (id: number, updates: Partial<Candidate>) => void;
    onAddCandidate?: (candidate: Partial<Candidate>) => void;
}

// Importing MOCK_CANDIDATES locally as fallback if props aren't passed, though ideally they are.
import { MOCK_CANDIDATES as FALLBACK_CANDIDATES } from '../constants';

type SortKey = 'name' | 'matchScore' | 'status' | 'source' | 'lastContacted';

// Optimization: Memoized Row Component
const CandidateRow = React.memo(({ candidate, screeningId, onSelect, onScreen }: { candidate: Candidate, screeningId: number | null, onSelect: (c: Candidate) => void, onScreen: (e: React.MouseEvent, c: Candidate) => void }) => {
    return (
        <tr 
            onClick={() => onSelect(candidate)}
            className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
        >
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                        {candidate.avatarInitials}
                    </div>
                    <div>
                        <div className="font-bold text-slate-800 dark:text-white text-sm">{candidate.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{candidate.email}</div>
                    </div>
                </div>
            </td>
            <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{candidate.role}</td>
            <td className="p-4 text-sm">
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                    candidate.source === 'MNO Partner' 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800'
                        : candidate.source === 'Internal DB (AI)'
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800'
                        : 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                }`}>
                    {candidate.source}
                </span>
            </td>
            <td className="p-4">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                    candidate.status === 'shortlist' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                    candidate.status === 'interview' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                    candidate.status === 'hired' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                    'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400'
                }`}>
                    {candidate.status}
                </span>
            </td>
            <td className="p-4">
                <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-200 dark:bg-slate-600 rounded-full h-1.5 overflow-hidden">
                        <div 
                            className={`h-full rounded-full ${
                                candidate.matchScore >= 90 ? 'bg-green-500' : 
                                candidate.matchScore >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} 
                            style={{width: `${candidate.matchScore}%`}}
                        ></div>
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{candidate.matchScore}%</span>
                </div>
            </td>
            <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                {candidate.lastContacted ? (
                    <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                        {candidate.lastContacted}
                    </span>
                ) : (
                    <span className="text-xs text-slate-400">-</span>
                )}
            </td>
            <td className="p-4">
                <div className="flex gap-2">
                    <button 
                        onClick={(e) => onScreen(e, candidate)}
                        className={`p-2 rounded-lg transition-colors border ${
                            screeningId === candidate.id 
                                ? 'bg-purple-50 text-purple-600 border-purple-200 cursor-wait' 
                                : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50 border-transparent hover:border-purple-200'
                        }`}
                        title="Trigger AI Screening"
                    >
                        <i className={`fas ${screeningId === candidate.id ? 'fa-circle-notch fa-spin' : 'fa-robot'}`}></i>
                    </button>
                    <button className="text-slate-400 hover:text-liberty-blue dark:hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-600">
                        <i className="fas fa-ellipsis-h"></i>
                    </button>
                </div>
            </td>
        </tr>
    );
});

export const CandidateDatabase: React.FC<CandidateDatabaseProps> = ({ 
    candidates = FALLBACK_CANDIDATES, 
    requests = [],
    onAddNote,
    onUpdateCandidate,
    onAddCandidate
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
    const [screeningId, setScreeningId] = useState<number | null>(null);
    
    // Sort State
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
        key: 'matchScore',
        direction: 'desc'
    });

    // Re-fetch the candidate from the list to ensure we have latest state (AI analysis results, etc.)
    const activeCandidate = useMemo(() => 
        candidates.find(c => c.id === selectedCandidateId) || null
    , [candidates, selectedCandidateId]);

    // Derive unique sources for the filter dropdown
    const sources = Array.from(new Set(candidates.map(c => c.source || 'Unknown')));

    // Combined Filter & Sort Logic
    const processedCandidates = useMemo(() => {
        let result = candidates.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  c.role.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
            const matchesSource = sourceFilter === 'all' || c.source === sourceFilter;
            
            return matchesSearch && matchesStatus && matchesSource;
        });

        return result.sort((a, b) => {
            const { key, direction } = sortConfig;
            let valA: any = a[key];
            let valB: any = b[key];

            // Handle undefined values
            if (valA === undefined) valA = '';
            if (valB === undefined) valB = '';

            // Handle numeric sort (Match Score)
            if (key === 'matchScore') {
                return direction === 'asc' ? valA - valB : valB - valA;
            }

            // Handle String sort (Name, Status, Source, Last Contacted)
            valA = valA.toString().toLowerCase();
            valB = valB.toString().toLowerCase();

            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [candidates, searchTerm, statusFilter, sourceFilter, sortConfig]);

    const handleSort = (key: SortKey) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const getSortIcon = (key: SortKey) => {
        if (sortConfig.key !== key) return <i className="fas fa-sort text-slate-300 ml-1"></i>;
        return <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} text-liberty-blue ml-1`}></i>;
    };

    const handleAIScreen = async (e: React.MouseEvent, candidate: Candidate) => {
        e.stopPropagation();
        setScreeningId(candidate.id);
        
        try {
            // Attempt to find the full job description
            const req = requests.find(r => r.id === candidate.requestId) || requests.find(r => r.title === candidate.role);
            const jd = req?.description || `Role: ${candidate.role}`;
            
            const result = await geminiService.screenCandidate({
                candidateName: candidate.name,
                experience: candidate.experience,
                currentRole: candidate.role,
                currentCompany: candidate.currentCompany || 'Unknown',
                skills: candidate.skills?.join(', ') || '',
                cvText: candidate.cvText || `Summary for ${candidate.name}`
            }, jd);

            if (onUpdateCandidate) {
                onUpdateCandidate(candidate.id, {
                    matchScore: result.score,
                    aiAnalysis: JSON.stringify(result)
                });
            }
        } catch (error) {
            console.error("Screening failed", error);
            alert("AI Screening failed. Please try again.");
        } finally {
            setScreeningId(null);
        }
    };

    const handleExportCSV = () => {
        const headers = ["Name", "Email", "Role", "Source", "Status", "Match Score", "Experience", "Last Contacted"];
        const rows = processedCandidates.map(c => [
            c.name, c.email, c.role, c.source, c.status, c.matchScore, c.experience, c.lastContacted
        ].map(field => `"${field || ''}"`).join(","));
        
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "candidates_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleAdd = () => {
        const name = prompt("Enter candidate name:");
        if (!name) return;
        const email = prompt("Enter email:", name.toLowerCase().replace(' ', '.') + "@example.com");
        const role = prompt("Enter role applied for:", "General");
        
        if (onAddCandidate) {
            onAddCandidate({ name, email: email || '', role: role || 'General' });
        }
    };

    return (
        <div className="p-6 h-full flex flex-col animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Candidate Database</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Centralized view of all talent profiles.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleExportCSV} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-200 shadow-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <i className="fas fa-file-export"></i> Export CSV
                    </button>
                    <button onClick={handleAdd} className="px-4 py-2 bg-liberty-blue text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/10 hover:bg-liberty-light transition-colors flex items-center gap-2">
                        <i className="fas fa-user-plus"></i> Add Candidate
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 flex flex-col flex-1 overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-slate-200/60 dark:border-slate-700 flex gap-4 items-center flex-wrap">
                    <div className="relative flex-1 max-w-md min-w-[200px]">
                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input 
                            type="text" 
                            placeholder="Search by name, email, or skills..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:border-liberty-blue dark:focus:border-blue-400 text-slate-800 dark:text-white"
                        />
                    </div>
                    
                    <div className="flex gap-3">
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:border-liberty-blue dark:focus:border-blue-400 text-slate-800 dark:text-white"
                        >
                            <option value="all">All Statuses</option>
                            <option value="new">New</option>
                            <option value="screen">Reviewed</option>
                            <option value="shortlist">Shortlist</option>
                            <option value="interview">Interview</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        <select 
                            value={sourceFilter}
                            onChange={(e) => setSourceFilter(e.target.value)}
                            className="p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:border-liberty-blue dark:focus:border-blue-400 text-slate-800 dark:text-white"
                        >
                            <option value="all">All Sources</option>
                            {sources.map(source => (
                                <option key={source} value={source}>{source}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0 z-10">
                            <tr>
                                <th 
                                    onClick={() => handleSort('name')}
                                    className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600/50 transition-colors select-none"
                                >
                                    Candidate {getSortIcon('name')}
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                                <th 
                                    onClick={() => handleSort('source')}
                                    className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600/50 transition-colors select-none"
                                >
                                    Source {getSortIcon('source')}
                                </th>
                                <th 
                                    onClick={() => handleSort('status')}
                                    className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600/50 transition-colors select-none"
                                >
                                    Status {getSortIcon('status')}
                                </th>
                                <th 
                                    onClick={() => handleSort('matchScore')}
                                    className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600/50 transition-colors select-none"
                                >
                                    Match {getSortIcon('matchScore')}
                                </th>
                                <th 
                                    onClick={() => handleSort('lastContacted')}
                                    className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600/50 transition-colors select-none"
                                >
                                    Last Contacted {getSortIcon('lastContacted')}
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {processedCandidates.length > 0 ? (
                                processedCandidates.map(candidate => (
                                    <CandidateRow 
                                        key={candidate.id} 
                                        candidate={candidate} 
                                        screeningId={screeningId} 
                                        onSelect={(c) => setSelectedCandidateId(c.id)} 
                                        onScreen={handleAIScreen} 
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                                                <i className="fas fa-users-slash text-2xl text-slate-300 dark:text-slate-500"></i>
                                            </div>
                                            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">No candidates found</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                                                We couldn't find any candidates matching your current filters. Try clearing them to see all profiles.
                                            </p>
                                            <button 
                                                onClick={() => {setSearchTerm(''); setStatusFilter('all'); setSourceFilter('all');}}
                                                className="mt-4 text-sm font-bold text-liberty-blue dark:text-blue-400 hover:underline"
                                            >
                                                Clear Filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {activeCandidate && (
                <CandidateDetailModal 
                    candidate={activeCandidate} 
                    onClose={() => setSelectedCandidateId(null)} 
                    onAddNote={onAddNote}
                    onUpdateCandidate={onUpdateCandidate}
                />
            )}
        </div>
    );
};
