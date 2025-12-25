
import React, { useState } from 'react';
import { Candidate } from '../types';
import { CandidateDetailModal } from './CandidateDetailModal';

interface KanbanBoardProps {
    candidates: Candidate[];
    onStatusChange?: (candidateId: number, newStatus: Candidate['status']) => void;
    onAddNote?: (candidateId: number, text: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ candidates, onStatusChange, onAddNote }) => {
    // Map of internal status IDs to display labels
    const stages = [
        { id: 'new', label: 'New', color: 'border-slate-400' },
        { id: 'screen', label: 'Reviewed', color: 'border-blue-500' },
        { id: 'shortlist', label: 'Shortlist', color: 'border-purple-500' },
        { id: 'interview', label: 'Interview', color: 'border-yellow-500' },
        { id: 'offer', label: 'Offer', color: 'border-green-500' },
        { id: 'hired', label: 'Hired', color: 'border-teal-500' }
    ];
    
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [filterPriority, setFilterPriority] = useState<string>('all');
    
    // Filter candidates based on local filter
    const getCandidatesByStage = (stage: string) => {
        return candidates.filter(c => 
            c.status === stage && 
            (filterPriority === 'all' || c.priority === filterPriority)
        );
    };

    const handleStageChange = (candidate: Candidate, newStage: string) => {
        if (onStatusChange) {
            onStatusChange(candidate.id, newStage as Candidate['status']);
        }
    };

    return (
        <div className="flex flex-col h-full p-6 animate-fade-in-up relative">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Pipeline Board</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Drag and drop to manage candidate progress.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                            <i className="fas fa-filter text-slate-400"></i> 
                            {filterPriority === 'all' ? 'All Priority' : filterPriority.charAt(0).toUpperCase() + filterPriority.slice(1)}
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 hidden group-hover:block z-10 p-1">
                            {['all', 'high', 'medium', 'low'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setFilterPriority(p)}
                                    className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 ${filterPriority === p ? 'text-liberty-blue dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-600 dark:text-slate-300'}`}
                                >
                                    {p === 'all' ? 'All Priority' : p.charAt(0).toUpperCase() + p.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {stages.map(stage => (
                    <div key={stage.id} className="flex-none w-80 flex flex-col h-full min-h-0">
                        {/* Column Header */}
                        <div className={`p-4 bg-white dark:bg-slate-800 rounded-t-xl border-t-4 ${stage.color} shadow-sm mb-3 shrink-0 flex justify-between items-center`}>
                            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wide">{stage.label}</h3>
                            <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                {getCandidatesByStage(stage.id).length}
                            </span>
                        </div>
                        
                        {/* Droppable Area */}
                        <div className="flex-1 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl p-2 space-y-3 overflow-y-auto custom-scrollbar border border-slate-100 dark:border-slate-800/50">
                            {getCandidatesByStage(stage.id).map(candidate => (
                                <CandidateCard 
                                    key={candidate.id} 
                                    candidate={candidate} 
                                    onClick={() => setSelectedCandidate(candidate)}
                                    onMove={(direction) => {
                                        const currentIndex = stages.findIndex(s => s.id === stage.id);
                                        const nextStage = stages[currentIndex + direction];
                                        if (nextStage) handleStageChange(candidate, nextStage.id);
                                    }}
                                />
                            ))}
                            {getCandidatesByStage(stage.id).length === 0 && (
                                <div className="h-32 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                                    <i className="fas fa-inbox text-xl mb-2 opacity-50"></i>
                                    <span className="text-xs font-medium italic">No Candidates</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {selectedCandidate && (
                <CandidateDetailModal 
                    candidate={selectedCandidate} 
                    onClose={() => setSelectedCandidate(null)}
                    onAddNote={onAddNote}
                />
            )}
        </div>
    );
};

interface CandidateCardProps {
    candidate: Candidate;
    onClick: () => void;
    onMove: (direction: number) => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onClick, onMove }) => {
    // Simulate days in stage (random for demo)
    const daysInStage = candidate.daysInStage || Math.floor(Math.random() * 10);
    const isStagnant = daysInStage > 5;

    return (
        <div className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 group relative cursor-pointer ${isStagnant ? 'border-red-200 dark:border-red-900/30' : 'border-slate-200 dark:border-slate-700'}`}>
            <div onClick={onClick}>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0 border border-slate-200 dark:border-slate-600">
                            {candidate.avatarInitials}
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{candidate.name}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{candidate.role}</p>
                        </div>
                    </div>
                    {candidate.priority === 'high' && (
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>
                    )}
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${candidate.matchScore >= 80 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                            {candidate.matchScore}% Match
                        </div>
                        {isStagnant && (
                            <div className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                                <i className="fas fa-clock"></i> {daysInStage}d
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Quick Move Controls */}
            <div className="absolute top-1/2 -translate-y-1/2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={(e) => { e.stopPropagation(); onMove(1); }} className="w-6 h-6 bg-slate-100 dark:bg-slate-700 hover:bg-blue-500 hover:text-white rounded-full text-[10px] text-slate-500 shadow-sm flex items-center justify-center transition-colors">
                    <i className="fas fa-chevron-right"></i>
                 </button>
            </div>
             <div className="absolute top-1/2 -translate-y-1/2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={(e) => { e.stopPropagation(); onMove(-1); }} className="w-6 h-6 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-[10px] text-slate-500 shadow-sm flex items-center justify-center transition-colors">
                    <i className="fas fa-chevron-left"></i>
                 </button>
            </div>
        </div>
    );
};
