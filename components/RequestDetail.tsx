
import React, { useState, useRef, useEffect } from 'react';
import { Request, UserRole, Candidate, Submission, RequestComment } from '../types';
import { geminiService } from '../services/geminiService';
import { SubmitCandidateModal } from './SubmitCandidateModal';

interface RequestDetailProps {
    requestId: number | string;
    onBack: () => void;
    userRole: UserRole;
    requests: Request[];
    submissions: Submission[];
    candidates: Candidate[];
    onCandidateSubmit: (submission: Partial<Submission>, candidate: Partial<Candidate>) => void;
    onSmartMatch?: (requestId: number | string) => void;
    comments?: RequestComment[];
    onAddComment?: (text: string) => void;
    onGenerateVideo?: (prompt: string) => void;
    isPartnerTyping?: boolean;
    onUpdateRequest?: (id: number | string, updates: Partial<Request>) => void;
    onDeleteRequest?: (id: number | string) => void;
}

const CandidateListItem: React.FC<{ cand: Candidate; onDiscuss: (name: string) => void }> = ({ cand, onDiscuss }) => (
    <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group border-b last:border-0 border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-liberty-blue text-white flex items-center justify-center font-bold text-xs">
                {cand.avatarInitials}
            </div>
            <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                    {cand.name}
                    {cand.isRE5Certified && <span className="text-[9px] bg-teal-100 text-teal-700 px-1.5 rounded font-bold">RE5</span>}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{cand.role}</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                <span className="text-[10px] font-bold">{cand.matchScore}%</span>
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); onDiscuss(cand.name); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-50 text-slate-300 hover:text-liberty-blue transition-colors"
            >
                <i className="far fa-comment-dots"></i>
            </button>
        </div>
    </div>
);

export const RequestDetail: React.FC<RequestDetailProps> = ({ 
    requestId, 
    onBack, 
    userRole,
    requests,
    submissions,
    candidates,
    onCandidateSubmit,
    onSmartMatch,
    comments = [],
    onAddComment,
    onGenerateVideo,
    isPartnerTyping = false,
    onUpdateRequest,
    onDeleteRequest
}) => {
    const request = requests.find(r => r.id == requestId);
    const relatedCandidates = candidates.filter(c => c.requestId == requestId);
    
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isScouting, setIsScouting] = useState(false);
    const [commentInput, setCommentInput] = useState('');
    const [isManageMenuOpen, setIsManageMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'candidates' | 'market'>('overview');

    const [marketAnalysis, setMarketAnalysis] = useState<{text: string, sources?: any[]} | null>(null);
    const [isAnalyzingMarket, setIsAnalyzingMarket] = useState(false);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [comments, isPartnerTyping]);

    if (!request) {
        return (
            <div className="p-8 text-center text-slate-500 h-full flex flex-col items-center justify-center">
                <p>Request not found or has been deleted.</p>
                <button onClick={onBack} className="mt-4 text-blue-600 font-bold hover:underline">Back to Requests</button>
            </div>
        );
    }

    const handleDelete = () => {
        if (onDeleteRequest && confirm(`Are you sure you want to permanently delete the request for "${request.title}"? This cannot be undone.`)) {
            onDeleteRequest(request.id);
        }
    };

    const handleMarketAnalysis = async () => {
        setIsAnalyzingMarket(true);
        try {
            const res = await geminiService.getMarketAnalysis(request.title, request.location);
            setMarketAnalysis(res);
        } catch (e) {
            alert("Market analysis failed.");
        } finally {
            setIsAnalyzingMarket(false);
        }
    };

    const handlePostComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (commentInput.trim() && onAddComment) {
            onAddComment(commentInput);
            setCommentInput('');
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-50/50 dark:bg-slate-900/50 animate-fade-in-up">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 px-6 py-4 flex-none sticky top-0 z-20">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <button onClick={onBack} className="hover:text-blue-600 transition-colors flex items-center gap-1 font-medium">
                        <i className="fas fa-arrow-left"></i> Back
                    </button>
                    <span>/</span>
                    <span className="text-slate-400">ID: #{request.id}</span>
                </div>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{request.title}</h1>
                        <p className="text-xs text-slate-500">{request.department} • {request.location}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-600 border border-blue-100`}>
                            {request.status}
                        </span>
                        
                        {/* Manage Menu - Accessible to Liberty & Partner */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsManageMenuOpen(!isManageMenuOpen)}
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                            >
                                <i className="fas fa-ellipsis-h"></i> Manage
                            </button>
                            
                            {isManageMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsManageMenuOpen(false)}></div>
                                    <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 z-20 overflow-hidden animate-fade-in-up">
                                        <button onClick={() => { setIsEditing(true); setIsManageMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                            <i className="fas fa-edit text-blue-500"></i> Edit Request
                                        </button>
                                        <button className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                            <i className="fas fa-pause text-amber-500"></i> Put on Hold
                                        </button>
                                        <div className="h-px bg-slate-100"></div>
                                        <button 
                                            onClick={handleDelete}
                                            className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <i className="fas fa-trash-alt"></i> DELETE REQUEST
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {userRole === UserRole.PARTNER ? (
                            <button onClick={() => setIsSubmitModalOpen(true)} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-all">
                                Submit Candidate
                            </button>
                        ) : (
                            <button onClick={handleMarketAnalysis} className="px-5 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-purple-700 transition-all">
                                <i className="fas fa-chart-line mr-2"></i> Market Data
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Split */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full min-h-[500px]">
                        <div className="flex border-b border-slate-100 dark:border-slate-700">
                            <button onClick={() => setActiveTab('overview')} className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-liberty-blue text-liberty-blue dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                                Overview
                            </button>
                            <button onClick={() => setActiveTab('candidates')} className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'candidates' ? 'border-liberty-blue text-liberty-blue dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                                Candidates ({relatedCandidates.length})
                            </button>
                            <button onClick={() => setActiveTab('market')} className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'market' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                                Market Intelligence
                            </button>
                        </div>

                        <div className="flex-1 p-0">
                            {activeTab === 'overview' && (
                                <div className="p-6 space-y-6 animate-fade-in">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2 space-y-2">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <i className="fas fa-bullseye text-blue-500"></i> Fulfillment Scope
                                            </h3>
                                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                                                    {request.description || "No description provided."}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 space-y-2">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <i className="fas fa-list-check text-purple-500"></i> Key Requirements
                                            </h3>
                                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                                                {request.requirements ? (
                                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                                        {request.requirements}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm text-slate-400 italic">No specific requirements listed.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <i className="fas fa-tags text-indigo-500"></i> Dimension Markers
                                            </h3>
                                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-wrap gap-2">
                                                {request.skills && request.skills.length > 0 ? (
                                                    request.skills.map((skill, i) => (
                                                        <span key={i} className="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-200 shadow-sm">
                                                            {skill}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">No skills tagged.</span>
                                                )}
                                            </div>
                                        </div>

                                        {request.partnerNotes && (
                                            <div className="space-y-2">
                                                <h3 className="text-xs font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                                    <i className="fas fa-file-signature"></i> Notes for MNO
                                                </h3>
                                                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-800/50">
                                                    <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed whitespace-pre-wrap">
                                                        "{request.partnerNotes}"
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'candidates' && (
                                <div className="divide-y divide-slate-50 dark:divide-slate-700">
                                    {relatedCandidates.map(c => <CandidateListItem key={c.id} cand={c} onDiscuss={(n) => setCommentInput(`@${n} `)} />)}
                                    {relatedCandidates.length === 0 && (
                                        <div className="py-20 text-center text-slate-400">
                                            <i className="fas fa-user-friends text-4xl mb-4 opacity-20"></i>
                                            <p>No candidates in pipeline for this search.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'market' && (
                                <div className="p-6">
                                    {!marketAnalysis && !isAnalyzingMarket ? (
                                        <div className="text-center py-20 flex flex-col items-center">
                                            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                                                <i className="fas fa-chart-line text-2xl text-purple-500"></i>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Market Intelligence</h3>
                                            <p className="text-slate-500 text-sm max-w-xs mb-6">Generate a live report on salary bands, competitor activity, and talent availability for {request.location}.</p>
                                            <button onClick={handleMarketAnalysis} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-900/20">
                                                Generate Live Report
                                            </button>
                                        </div>
                                    ) : isAnalyzingMarket ? (
                                        <div className="py-32 text-center">
                                            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                                            <p className="text-slate-500 font-medium">Analyzing market data...</p>
                                        </div>
                                    ) : (
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <div className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300 leading-relaxed p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                                {marketAnalysis?.text}
                                            </div>
                                            {marketAnalysis?.sources && marketAnalysis.sources.length > 0 && (
                                                <div className="mt-6">
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Sources</h4>
                                                    <ul className="space-y-2">
                                                        {marketAnalysis.sources.map((source: any, i: number) => (
                                                            <li key={i} className="flex items-center gap-2 text-xs">
                                                                <i className="fas fa-external-link-alt text-slate-400"></i>
                                                                <a href={source.uri} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-md">
                                                                    {source.title || source.uri}
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Collaboration Hub */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col h-[600px] shadow-sm">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
                        <h3 className="font-bold text-sm text-slate-800 dark:text-white">Collaboration Hub</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Live</span>
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50" ref={chatContainerRef}>
                        {comments.map(c => (
                            <div key={c.id} className={`flex flex-col ${c.role === userRole ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs shadow-sm ${
                                    c.role === userRole 
                                        ? 'bg-liberty-blue text-white rounded-br-none' 
                                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-600'
                                }`}>
                                    <div className="flex justify-between items-center gap-4 mb-1 border-b border-white/10 pb-1">
                                        <p className="font-bold uppercase opacity-90">{c.author}</p>
                                        <p className="opacity-60 text-[9px]">{c.timestamp}</p>
                                    </div>
                                    <p className="leading-relaxed">{c.text}</p>
                                </div>
                            </div>
                        ))}
                        {comments.length === 0 && (
                            <div className="text-center py-10 text-slate-400 text-xs">
                                <p>No comments yet.</p>
                                <p>Start a discussion about this request.</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <form onSubmit={handlePostComment} className="flex gap-2">
                            <input 
                                type="text" 
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                placeholder="Type message..." 
                                className="flex-1 bg-slate-100 dark:bg-slate-700 border-none rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-liberty-blue/50 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all"
                            />
                            <button type="submit" className="w-10 h-10 bg-liberty-blue text-white rounded-xl flex items-center justify-center hover:bg-liberty-light transition-colors shadow-lg active:scale-95">
                                <i className="fas fa-paper-plane text-xs"></i>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {isSubmitModalOpen && (
                <SubmitCandidateModal 
                    request={request} 
                    onClose={() => setIsSubmitModalOpen(false)} 
                    onSubmit={onCandidateSubmit}
                />
            )}
        </div>
    );
};
