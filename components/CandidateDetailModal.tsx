
import React, { useState, useEffect } from 'react';
import { Candidate, HistoryEvent, Review, Note, GeneratedQuestion } from '../types';
import { geminiService } from '../services/geminiService';

interface CandidateDetailModalProps {
    candidate: Candidate;
    onClose: () => void;
    onAddNote?: (candidateId: number, text: string) => void;
    onUpdateCandidate?: (id: number, updates: Partial<Candidate>) => void;
}

interface AIAnalysisResult {
    score: number;
    analysis: string;
    strengths: string[];
    weaknesses: string[];
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({ candidate, onClose, onAddNote, onUpdateCandidate }) => {
    const [activeTab, setActiveTab] = useState<'history' | 'reviews' | 'notes' | 'ai_analysis' | 'interview_prep'>('history');
    const [newNote, setNewNote] = useState('');
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
    const [interviewQuestions, setInterviewQuestions] = useState<GeneratedQuestion[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
    const [analysisMode, setAnalysisMode] = useState<'fast' | 'deep'>('fast');
    const [showResume, setShowResume] = useState(false);
    
    // Local state for immediate UI feedback
    const [currentStatus, setCurrentStatus] = useState(candidate.status);
    const [currentRating, setCurrentRating] = useState(candidate.rating);

    const PIPELINE_STEPS = [
        { id: 'new', label: 'New' },
        { id: 'screen', label: 'Screening' },
        { id: 'shortlist', label: 'Shortlist' },
        { id: 'interview', label: 'Interview' },
        { id: 'offer', label: 'Offer' },
        { id: 'hired', label: 'Hired' }
    ];

    const currentStepIndex = PIPELINE_STEPS.findIndex(s => s.id === currentStatus) === -1 
        ? (currentStatus === 'rejected' ? -1 : 0) 
        : PIPELINE_STEPS.findIndex(s => s.id === currentStatus);

    useEffect(() => {
        if (candidate.aiAnalysis) {
            try {
                const parsed = JSON.parse(candidate.aiAnalysis);
                if (parsed.score !== undefined) {
                    setAiAnalysis(parsed);
                }
            } catch (e) {
                console.warn("Could not parse existing AI analysis as JSON");
            }
        }
        if (candidate.interviewGuide) {
            try {
                setInterviewQuestions(JSON.parse(candidate.interviewGuide));
            } catch(e) {
                console.warn("Could not parse interview guide");
            }
        }
    }, [candidate]);

    const handleAddNote = () => {
        if (!newNote.trim()) return;
        if (onAddNote) {
            onAddNote(candidate.id, newNote);
        }
        setNewNote('');
        setActiveTab('notes'); 
    };

    const handleStepClick = (stepId: string) => {
        if (confirm(`Move candidate to ${stepId.toUpperCase()}?`)) {
            const newStatus = stepId as Candidate['status'];
            setCurrentStatus(newStatus);
            if (onUpdateCandidate) onUpdateCandidate(candidate.id, { status: newStatus });
        }
    };

    const handleRatingUpdate = (newRating: number) => {
        setCurrentRating(newRating);
        if (onUpdateCandidate) onUpdateCandidate(candidate.id, { rating: newRating });
    };

    const handleReject = () => {
        if (confirm(`Are you sure you want to reject ${candidate.name}?`)) {
            setCurrentStatus('rejected');
            if (onUpdateCandidate) onUpdateCandidate(candidate.id, { status: 'rejected' });
        }
    };

    const runAIAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const context = `Role: ${candidate.role}. Experience: ${candidate.experience}. Skills: ${candidate.skills?.join(', ')}. Target Company: Liberty Group.`;
            
            const candidateData = {
                candidateName: candidate.name,
                experience: candidate.experience,
                currentRole: candidate.role,
                currentCompany: candidate.currentCompany || 'Unknown',
                skills: candidate.skills?.join(', ') || '',
                cvText: candidate.cvText || "N/A"
            };

            let result;
            if (analysisMode === 'deep') {
                // Uses Gemini 3 Pro with Thinking Config
                result = await geminiService.deepScreenCandidate(candidateData, context);
            } else {
                // Uses Gemini 3 Flash
                result = await geminiService.screenCandidate(candidateData, context);
            }
            
            setAiAnalysis(result);
            if (onUpdateCandidate) {
                onUpdateCandidate(candidate.id, { aiAnalysis: JSON.stringify(result), matchScore: result.score });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const generateInterviewGuide = async () => {
        setIsGeneratingQuestions(true);
        try {
            const candidateData = {
                candidateName: candidate.name,
                experience: candidate.experience,
                skills: candidate.skills?.join(', ') || '',
                weaknesses: aiAnalysis?.weaknesses || []
            };
            const result = await geminiService.generateInterviewQuestions(candidateData, candidate.role);
            setInterviewQuestions(result);
            if (onUpdateCandidate) {
                onUpdateCandidate(candidate.id, { interviewGuide: JSON.stringify(result) });
            }
        } catch(e) {
            console.error(e);
        } finally {
            setIsGeneratingQuestions(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
            {/* Resume Viewer Modal */}
            {showResume && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-3xl h-[85vh] rounded-3xl flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in-up overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Resume Artifact</h3>
                                <p className="text-xs text-slate-500">{candidate.name}</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-500">
                                    <i className="fas fa-download"></i>
                                </button>
                                <button onClick={() => setShowResume(false)} className="w-10 h-10 flex items-center justify-center hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors text-slate-500">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 bg-slate-100 dark:bg-slate-950 font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            {candidate.cvText ? (
                                <div className="bg-white dark:bg-slate-900 p-10 shadow-sm min-h-full whitespace-pre-wrap rounded-xl border border-slate-200 dark:border-slate-800">
                                    {candidate.cvText}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <i className="fas fa-file-excel text-5xl mb-4 opacity-20"></i>
                                    <p className="font-bold">No binary resume data found.</p>
                                    <p className="text-xs mt-1">Artifact was sourced via text-only ingestion.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-[#0B1120] rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-800">
                {/* Header Section */}
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex gap-6 w-full">
                            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-liberty-blue to-liberty-light text-white text-2xl font-bold flex items-center justify-center shadow-lg relative shrink-0">
                                {candidate.avatarInitials}
                                {candidate.source?.includes('AI') && (
                                    <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white text-[9px] px-2 py-0.5 rounded-full border-2 border-white dark:border-[#0B1120] font-black uppercase tracking-tighter">AI Scout</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                            {candidate.name}
                                            <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800 font-bold uppercase tracking-widest">{candidate.source}</span>
                                        </h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-lg mt-1">{candidate.role}</p>
                                    </div>
                                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">
                                        <i className="fas fa-times text-xl"></i>
                                    </button>
                                </div>
                                <div className="flex items-center gap-6 mt-4">
                                    <div className="flex items-center gap-1.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button 
                                                key={star}
                                                onClick={() => handleRatingUpdate(star)}
                                                className={`text-base focus:outline-none transition-all hover:scale-125 ${star <= currentRating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                                            >
                                                <i className="fas fa-star"></i>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
                                    {(candidate.re5 === 'certified' || candidate.isRE5Certified) && (
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 text-xs font-black uppercase tracking-widest">
                                            <i className="fas fa-certificate"></i> RE5 Certified
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Journey */}
                    <div className="relative flex justify-between items-center px-4 py-2">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 rounded-full"></div>
                        <div 
                            className="absolute top-1/2 left-0 h-1 bg-liberty-blue dark:bg-blue-500 transition-all duration-700 -translate-y-1/2 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
                            style={{ width: `${currentStatus === 'rejected' ? 0 : (currentStepIndex / (PIPELINE_STEPS.length - 1)) * 100}%` }}
                        ></div>

                        {PIPELINE_STEPS.map((step, index) => {
                            const isCompleted = index <= currentStepIndex && currentStatus !== 'rejected';
                            const isCurrent = index === currentStepIndex && currentStatus !== 'rejected';
                            
                            return (
                                <div key={step.id} className="relative z-10 flex flex-col items-center group cursor-pointer" onClick={() => handleStepClick(step.id)}>
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-300 border-2 ${
                                        isCurrent 
                                            ? 'bg-liberty-blue border-liberty-blue text-white scale-125 shadow-xl rotate-3' 
                                            : isCompleted 
                                                ? 'bg-white dark:bg-[#0B1120] border-liberty-blue text-liberty-blue' 
                                                : 'bg-white dark:bg-[#0B1120] border-slate-200 dark:border-slate-800 text-slate-300'
                                    }`}>
                                        {isCompleted && !isCurrent ? <i className="fas fa-check"></i> : index + 1}
                                    </div>
                                    <span className={`absolute top-full mt-4 text-[10px] font-black uppercase tracking-widest transition-colors ${
                                        isCurrent ? 'text-liberty-blue dark:text-blue-400' : isCompleted ? 'text-slate-600 dark:text-slate-300' : 'text-slate-300'
                                    }`}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white dark:bg-[#0B1120]">
                    {/* Sidebar: Details */}
                    <div className="w-full md:w-80 bg-slate-50/30 dark:bg-slate-900/10 p-8 border-r border-slate-100 dark:border-slate-800 overflow-y-auto">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Contact Intelligence</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Electronic Mail</label>
                                        <a href={`mailto:${candidate.email}`} className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-liberty-blue transition-colors flex items-center gap-2 group">
                                            <i className="fas fa-envelope text-slate-300 group-hover:text-liberty-blue"></i> {candidate.email}
                                        </a>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Phone Protocol</label>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                            <i className="fas fa-phone-alt text-slate-300"></i> {candidate.phone}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Match Index</label>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full shadow-[0_0_5px_rgba(0,0,0,0.1)] ${
                                                        candidate.matchScore >= 80 ? 'bg-emerald-500' :
                                                        candidate.matchScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                                                    }`} 
                                                    style={{ width: `${candidate.matchScore}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-black text-slate-900 dark:text-white">{candidate.matchScore}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Executive Actions</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    <button 
                                        onClick={() => setShowResume(true)}
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <i className="fas fa-file-pdf text-rose-500"></i> View Artifact
                                    </button>
                                    <button className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm">
                                        <i className="fab fa-linkedin text-blue-600"></i> LinkedIn Profile
                                    </button>
                                    <button className="w-full px-4 py-4 bg-liberty-blue text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-liberty-light transition-all shadow-lg shadow-blue-900/20 mt-2">
                                        Schedule Board
                                    </button>
                                    {currentStatus !== 'rejected' && (
                                        <button 
                                            onClick={handleReject}
                                            className="w-full px-4 py-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 border border-rose-100 dark:border-rose-900/50 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all mt-4"
                                        >
                                            Decline Pipeline
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Workspace */}
                    <div className="flex-1 flex flex-col min-h-0">
                        {/* Tab Navigation */}
                        <div className="flex gap-2 px-8 pt-4 bg-white dark:bg-[#0B1120] border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
                            {[
                                { id: 'history', label: 'History', icon: 'fa-history' },
                                { id: 'reviews', label: 'Reviews', icon: 'fa-star' },
                                { id: 'ai_analysis', label: 'AI Insights', icon: 'fa-sparkles', premium: true },
                                { id: 'interview_prep', label: 'Interview Prep', icon: 'fa-clipboard-question', premium: true },
                                { id: 'notes', label: 'Collaborate', icon: 'fa-comments' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-6 py-4 text-xs font-black uppercase tracking-[0.15em] border-b-2 transition-all flex items-center gap-3 whitespace-nowrap ${
                                        activeTab === tab.id 
                                            ? 'border-liberty-blue text-liberty-blue dark:text-blue-400' 
                                            : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                    }`}
                                >
                                    <i className={`fas ${tab.icon} ${tab.premium && activeTab === tab.id ? 'text-purple-500 animate-pulse' : ''}`}></i>
                                    {tab.label}
                                    {tab.premium && <span className="text-[8px] bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-full font-black">AI</span>}
                                </button>
                            ))}
                        </div>

                        {/* Tab Viewport */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {activeTab === 'history' && (
                                <div className="space-y-8 max-w-2xl">
                                    {candidate.history?.map((event, index) => (
                                        <div key={event.id} className="flex gap-6 group relative">
                                            <div className="flex flex-col items-center shrink-0">
                                                <div className="w-4 h-4 bg-liberty-blue rounded-full ring-4 ring-blue-50 dark:ring-blue-900/20 group-hover:scale-125 transition-transform"></div>
                                                {index !== (candidate.history?.length || 0) - 1 && <div className="w-0.5 h-full bg-slate-100 dark:bg-slate-800 my-2"></div>}
                                            </div>
                                            <div className="pb-8">
                                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{event.action}</p>
                                                <p className="text-xs text-slate-400 mt-1 font-bold">{event.date}</p>
                                                {event.description && <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">{event.description}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {candidate.reviews?.map((review) => (
                                        <div key={review.id} className="bg-white dark:bg-[#0B1120] p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-black text-slate-500">
                                                        {review.reviewer.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 dark:text-white">{review.reviewer}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{review.date}</p>
                                                    </div>
                                                </div>
                                                <div className="flex text-amber-400 text-[10px]">
                                                    {[...Array(5)].map((_, i) => (
                                                        <i key={i} className={`fas fa-star ${i < review.rating ? '' : 'text-slate-200 dark:text-slate-800'}`}></i>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic border-l-4 border-slate-100 dark:border-slate-800 pl-4">
                                                "{review.comment}"
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'ai_analysis' && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className={`p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden transition-colors duration-500 ${
                                        analysisMode === 'deep' 
                                            ? 'bg-gradient-to-br from-indigo-900 to-purple-900 shadow-purple-900/30' 
                                            : 'bg-gradient-to-br from-indigo-600 to-purple-700 shadow-indigo-900/20'
                                    }`}>
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                                            <div className="max-w-xl">
                                                <h4 className="font-serif font-bold text-2xl mb-2 flex items-center gap-2">
                                                    Gemini Fitting Intelligence
                                                    {analysisMode === 'deep' && <span className="bg-purple-500/30 border border-purple-400/50 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Deep Audit</span>}
                                                </h4>
                                                <p className="text-indigo-100 text-sm leading-relaxed opacity-90 font-light">
                                                    {analysisMode === 'deep' 
                                                        ? "Thinking Mode engaged. Analyzing career trajectory, implicit skills, and cultural fit vectors." 
                                                        : "Standard analysis active. Cross-referencing explicit artifacts with job specifications."}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-2 shrink-0">
                                                <div className="flex bg-black/20 p-1 rounded-xl">
                                                    <button 
                                                        onClick={() => setAnalysisMode('fast')}
                                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${analysisMode === 'fast' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-200 hover:text-white'}`}
                                                    >
                                                        Fast
                                                    </button>
                                                    <button 
                                                        onClick={() => setAnalysisMode('deep')}
                                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${analysisMode === 'deep' ? 'bg-purple-500 text-white shadow-sm' : 'text-indigo-200 hover:text-white'}`}
                                                    >
                                                        Deep Audit
                                                    </button>
                                                </div>
                                                <button 
                                                    onClick={runAIAnalysis}
                                                    disabled={isAnalyzing}
                                                    className="px-8 py-3 bg-white text-indigo-900 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                                >
                                                    {isAnalyzing ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-bolt-lightning"></i>}
                                                    {isAnalyzing ? 'Thinking...' : 'Execute'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {isAnalyzing ? (
                                        <div className="flex flex-col items-center justify-center py-24 bg-slate-50 dark:bg-slate-800/20 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                                            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                                            <h4 className="font-serif font-bold text-xl text-slate-800 dark:text-white">Neural Processing...</h4>
                                            <p className="text-slate-400 text-sm mt-2 max-w-xs text-center font-light leading-relaxed">
                                                {analysisMode === 'deep' ? "Simulating recruiter reasoning chains (Gemini Pro)..." : "Parsing semantic structures (Gemini Flash)..."}
                                            </p>
                                        </div>
                                    ) : aiAnalysis ? (
                                        <div className="space-y-8 animate-fade-in-up">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="bg-white dark:bg-[#0B1120] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
                                                    <div className="relative w-32 h-32 mb-4">
                                                        <svg className="w-full h-full transform -rotate-90 drop-shadow-xl">
                                                            <circle cx="64" cy="64" r="58" className="text-slate-100 dark:text-slate-800" strokeWidth="10" fill="none" stroke="currentColor"/>
                                                            <circle cx="64" cy="64" r="58" className="text-indigo-600 dark:text-indigo-400" strokeWidth="10" fill="none" stroke="currentColor" strokeDasharray={`${aiAnalysis.score * 3.64} 364`} strokeLinecap="round"/>
                                                        </svg>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                            <span className="text-4xl font-black text-indigo-700 dark:text-indigo-300">{aiAnalysis.score}</span>
                                                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Match Index</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="md:col-span-2 bg-white dark:bg-[#0B1120] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                                                    <h3 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
                                                        <i className="fas fa-file-contract text-indigo-500"></i> Decision Summary
                                                    </h3>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light italic">
                                                        "{aiAnalysis.analysis}"
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="bg-emerald-50/20 dark:bg-emerald-900/10 p-8 rounded-[3rem] border border-emerald-100 dark:border-emerald-900/30">
                                                    <h4 className="font-black text-emerald-700 dark:text-emerald-400 mb-6 text-[10px] uppercase tracking-[0.3em] flex items-center gap-3">
                                                        <i className="fas fa-shield-check"></i> High-Affinity Markers
                                                    </h4>
                                                    <ul className="space-y-4">
                                                        {aiAnalysis.strengths?.map((s, i) => (
                                                            <li key={i} className="flex items-start gap-4 text-sm text-slate-700 dark:text-slate-200">
                                                                <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg flex items-center justify-center text-[10px] text-emerald-700 dark:text-emerald-400 shrink-0 font-black">{i+1}</span>
                                                                <span className="font-light">{s}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                
                                                <div className="bg-rose-50/20 dark:bg-rose-900/10 p-8 rounded-[3rem] border border-rose-100 dark:border-rose-900/30">
                                                    <h4 className="font-black text-rose-700 dark:text-rose-400 mb-6 text-[10px] uppercase tracking-[0.3em] flex items-center gap-3">
                                                        <i className="fas fa-triangle-exclamation"></i> Identified Risk Deltas
                                                    </h4>
                                                    <ul className="space-y-4">
                                                        {aiAnalysis.weaknesses?.map((w, i) => (
                                                            <li key={i} className="flex items-start gap-4 text-sm text-slate-700 dark:text-slate-200">
                                                                <span className="w-6 h-6 bg-rose-100 dark:bg-rose-800/50 rounded-lg flex items-center justify-center text-[10px] text-rose-700 dark:text-rose-400 shrink-0 font-black">{i+1}</span>
                                                                <span className="font-light">{w}</span>
                                                            </li>
                                                        ))}
                                                        {(!aiAnalysis.weaknesses || aiAnalysis.weaknesses.length === 0) && (
                                                            <li className="text-sm text-slate-400 italic py-4 font-light text-center">Neural Audit detected no high-priority risks.</li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-32 bg-slate-50/50 dark:bg-slate-800/20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                                            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
                                                <i className="fas fa-microchip text-4xl text-slate-200"></i>
                                            </div>
                                            <h4 className="font-serif font-bold text-xl text-slate-700 dark:text-slate-300">Neural Workspace Ready</h4>
                                            <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto font-light">Invoke the Gemini Execute engine to perform a deep-scan analysis of this candidate's fit profile.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'interview_prep' && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                                            <div>
                                                <h4 className="font-serif font-bold text-2xl mb-2 flex items-center gap-2">
                                                    <i className="fas fa-clipboard-question"></i> Interview Generator
                                                </h4>
                                                <p className="text-blue-100 text-sm leading-relaxed opacity-90 font-light max-w-md">
                                                    Generate a structured interview guide tailored to probe this candidate's specific weaknesses and experience gaps.
                                                </p>
                                            </div>
                                            <button 
                                                onClick={generateInterviewGuide}
                                                disabled={isGeneratingQuestions}
                                                className="px-8 py-3 bg-white text-blue-700 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                            >
                                                {isGeneratingQuestions ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
                                                {isGeneratingQuestions ? 'Drafting...' : 'Generate Guide'}
                                            </button>
                                        </div>
                                    </div>

                                    {isGeneratingQuestions ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                            <i className="fas fa-pen-nib fa-spin text-3xl mb-4 text-blue-500"></i>
                                            <p>Drafting personalized questions...</p>
                                        </div>
                                    ) : interviewQuestions.length > 0 ? (
                                        <div className="grid gap-6">
                                            {interviewQuestions.map((q, i) => (
                                                <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase">{q.category}</span>
                                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                                q.difficulty === 'Hard' ? 'bg-red-100 text-red-700' : 
                                                                q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                                            }`}>{q.difficulty}</span>
                                                        </div>
                                                        <span className="text-slate-300 font-black text-2xl">0{i+1}</span>
                                                    </div>
                                                    <h5 className="font-bold text-slate-800 dark:text-white text-lg mb-3">{q.question}</h5>
                                                    <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Recruiter Rationale</p>
                                                        <p className="text-sm text-slate-600 dark:text-slate-300 italic">{q.rationale}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 text-slate-400 bg-slate-50 dark:bg-slate-900/20 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                                            <p>No interview guide generated yet.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'notes' && (
                                <div className="flex flex-col h-full max-w-4xl mx-auto">
                                    <div className="mb-10 group bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 focus-within:border-liberty-blue transition-all">
                                        <textarea
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            placeholder="Capture shared intelligence..."
                                            className="w-full p-4 bg-transparent rounded-2xl text-sm focus:outline-none resize-none h-32 text-slate-800 dark:text-white placeholder:text-slate-400 font-light leading-relaxed"
                                        ></textarea>
                                        <div className="flex justify-end mt-4">
                                            <button 
                                                onClick={handleAddNote}
                                                className="px-8 py-3 bg-liberty-blue text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-liberty-light disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                                                disabled={!newNote.trim()}
                                            >
                                                Publish Note
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        {candidate.notes?.map((note) => (
                                            <div key={note.id} className="bg-white dark:bg-[#0B1120] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 animate-fade-in group hover:shadow-lg transition-all">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-black text-indigo-600 uppercase tracking-tighter">
                                                            {note.author.charAt(0)}
                                                        </div>
                                                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{note.author}</span>
                                                    </div>
                                                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{note.date}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-light leading-relaxed pl-11">
                                                    {note.text}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
