
import React, { useState } from 'react';
import { Request, UserRole } from '../types';
import { RequestWizard } from './RequestWizard';
import { RiskAnalysisModal } from './RiskAnalysisModal';
import { geminiService } from '../services/geminiService';

interface RequestsViewProps {
    requests: Request[];
    onAddRequest: (request: Request) => void;
    onSelectRequest: (id: number | string) => void;
    userRole: UserRole;
    onDeleteRequest?: (id: number | string) => void;
}

export const RequestsView: React.FC<RequestsViewProps> = ({ requests, onAddRequest, onSelectRequest, userRole, onDeleteRequest }) => {
    const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [showWizard, setShowWizard] = useState(false);
    const [showRiskModal, setShowRiskModal] = useState(false);
    const [riskData, setRiskData] = useState<any>(null);
    const [isRiskLoading, setIsRiskLoading] = useState(false);

    const filteredRequests = requests.filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAnalyzeRisk = async (e: React.MouseEvent, req: Request) => {
        e.stopPropagation();
        setShowRiskModal(true);
        setIsRiskLoading(true);
        setRiskData(null);
        
        try {
            const data = await geminiService.analyzeRecruitmentRisk(req);
            setRiskData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsRiskLoading(false);
        }
    };

    const handleDelete = (e: React.MouseEvent, id: number | string) => {
        e.stopPropagation();
        if (onDeleteRequest && confirm("Delete this request?")) {
            onDeleteRequest(id);
        }
    };

    const KANBAN_COLS = [
        { id: 'new', label: 'New', color: 'border-blue-500' },
        { id: 'in-progress', label: 'In Progress', color: 'border-purple-500' },
        { id: 'on-hold', label: 'Review / Hold', color: 'border-amber-500' },
        { id: 'filled', label: 'Filled / Closed', color: 'border-green-500' }
    ];

    const renderCard = (req: Request) => (
        <div key={req.id} onClick={() => onSelectRequest(req.id)} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-xl transition-all group hover:-translate-y-1 relative flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase border ${
                    req.status === 'open' || req.status === 'in-progress' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                }`}>
                    {req.status}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => handleAnalyzeRisk(e, req)}
                        className="p-1.5 hover:bg-purple-50 hover:text-purple-600 rounded text-slate-400 transition-colors" 
                        title="AI Risk Analysis"
                    >
                        <i className="fas fa-chart-pie"></i>
                    </button>
                    <button 
                        onClick={(e) => handleDelete(e, req.id)}
                        className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded text-slate-400 transition-colors"
                    >
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2 leading-tight flex-1">{req.title}</h3>
            
            <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <i className="fas fa-building w-4 text-center"></i> {req.department}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <i className="fas fa-map-marker-alt w-4 text-center"></i> {req.location}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <i className="fas fa-exclamation-circle w-4 text-center text-amber-500"></i> {req.urgency} Urgency
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <div className="flex -space-x-2">
                    {[...Array(Math.min(3, req.candidatesCount))].map((_, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 border-2 border-white dark:border-slate-800"></div>
                    ))}
                    {req.candidatesCount > 3 && (
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500">+{req.candidatesCount-3}</div>
                    )}
                </div>
                <span className="text-xs font-bold text-liberty-blue dark:text-blue-400 group-hover:underline">View Details</span>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col p-8 animate-fade-in">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Request Management</h2>
                    <p className="text-sm text-slate-500 mt-1">Track and manage all job requisitions.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                        >
                            <i className="fas fa-th-large"></i> Grid
                        </button>
                        <button 
                            onClick={() => setViewMode('kanban')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'kanban' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                        >
                            <i className="fas fa-columns"></i> Pipeline
                        </button>
                    </div>
                    <button onClick={() => setShowWizard(true)} className="px-5 py-2.5 bg-liberty-blue text-white rounded-xl text-sm font-bold shadow-lg hover:bg-liberty-light transition-all flex items-center gap-2">
                        <i className="fas fa-plus"></i> New Request
                    </button>
                </div>
            </div>

            <div className="mb-6 relative max-w-md">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                    type="text" 
                    placeholder="Search requests..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-liberty-blue/50"
                />
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto custom-scrollbar pb-10">
                    {filteredRequests.length > 0 ? filteredRequests.map(renderCard) : (
                        <div className="col-span-full text-center py-20 text-slate-400">No requests found.</div>
                    )}
                </div>
            ) : (
                <div className="flex gap-6 overflow-x-auto h-full pb-4">
                    {KANBAN_COLS.map(col => {
                        const colRequests = filteredRequests.filter(r => {
                            if (col.id === 'filled') return r.status === 'filled' || r.status === 'closed';
                            if (col.id === 'on-hold') return r.status === 'on-hold';
                            if (col.id === 'in-progress') return r.status === 'in-progress' || r.status === 'open';
                            return r.status === 'new';
                        });

                        return (
                            <div key={col.id} className="min-w-[320px] flex flex-col h-full">
                                <div className={`p-4 bg-white dark:bg-slate-800 border-t-4 ${col.color} rounded-t-xl shadow-sm mb-3 flex justify-between items-center`}>
                                    <h3 className="font-bold text-slate-700 dark:text-white text-sm uppercase">{col.label}</h3>
                                    <span className="bg-slate-100 dark:bg-slate-700 text-xs font-bold px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300">{colRequests.length}</span>
                                </div>
                                <div className="flex-1 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl p-2 space-y-3 overflow-y-auto custom-scrollbar border border-slate-100 dark:border-slate-800">
                                    {colRequests.map(renderCard)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showWizard && (
                <RequestWizard onClose={() => setShowWizard(false)} onAddRequest={onAddRequest} />
            )}

            <RiskAnalysisModal 
                isOpen={showRiskModal} 
                onClose={() => setShowRiskModal(false)}
                riskData={riskData}
                isLoading={isRiskLoading}
            />
        </div>
    );
};
