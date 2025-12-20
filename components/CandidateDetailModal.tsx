
import React, { useState, useEffect } from 'react';
import { Candidate, HistoryEvent, Review, Note } from '../types';
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
    const [activeTab, setActiveTab] = useState<'history' | 'reviews' | 'notes' | 'ai_analysis'>('history');
    const [newNote, setNewNote] = useState('');
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showResume, setShowResume] = useState(false);
    
    // Local state for immediate UI feedback (simulating real-time updates)
    const [currentStatus, setCurrentStatus] = useState(candidate.status);
    const [currentRating, setCurrentRating] = useState(candidate.rating);

    // Live Tracking Config
    const PIPELINE_STEPS = [
        { id: 'new', label: 'New' },
        { id: 'screen', label: 'Screening' },
        { id: 'shortlist', label: 'Shortlist' },
        { id: 'interview', label: 'Interview' },
        { id: 'offer', label: 'Offer' },
        { id: 'hired', label: 'Hired' }
    ];

    const currentStepIndex = PIPELINE_STEPS.findIndex(s => s.id === currentStatus) === -1 
        ? (currentStatus === 'rejected' ? -1 : 0) // Default to 0 if unknown, -1 if rejected
        : PIPELINE_STEPS.findIndex(s => s.id === currentStatus);

    useEffect(() => {
        // Parse existing AI analysis if available
        if (candidate.aiAnalysis) {
            try {
                const parsed = JSON.parse(candidate.aiAnalysis);
                if (parsed.score !== undefined) {
                    setAiAnalysis(parsed);
                }
            } catch (e) {
                // Fallback if legacy text
                console.warn("Could not parse existing AI analysis as JSON");
            }
        }
    }, [candidate]);

    const handleAddNote = () => {
        if (!newNote.trim()) return;
        
        if (onAddNote) {
            onAddNote(candidate.id, newNote);
        }
        setNewNote('');
        setActiveTab('notes'); // Ensure we stay on notes tab
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
            // Re-construct minimal context for on-the-fly analysis if missing
            const context = `Role: ${candidate.role}. Experience: ${candidate.experience}. Skills: ${candidate.skills?.join(', ')}`;
            
            const result = await geminiService.screenCandidate({
                candidateName: candidate.name,
                experience: candidate.experience,
                currentRole: candidate.role,
                currentCompany: candidate.currentCompany || 'Unknown',
                skills: candidate.skills?.join(', ') || '',
                cvText: candidate.cvText || "N/A"
            }, context);
            
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

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            {/* Resume Viewer Modal */}
            {showResume && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-3xl h-[85vh] rounded-2xl flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 animate-fade-in-up">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800 rounded-t-2xl">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Resume Viewer</h3>
                                <p className="text-xs text-slate-500">{candidate.name}</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500">
                                    <i className="fas fa-download"></i>
                                </button>
                                <button onClick={() => setShowResume(false)} className="p-2 hover:bg-red-100 hover:text-red-500 rounded-lg transition-colors text-slate-500">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 bg-slate-100 dark:bg-slate-950 font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            {candidate.cvText ? (
                                <div className="bg-white dark:bg-slate-900 p-8 shadow-sm min-h-full whitespace-pre-wrap">
                                    {candidate.cvText}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <i className="fas fa-file-excel text-4xl mb-4"></i>
                                    <p>No resume text available for this candidate.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4 w-full">
                            <div className="h-16 w-16 rounded-full bg-liberty-blue text-white text-xl font-bold flex items-center justify-center border-4 border-white dark:border-slate-600 shadow-md relative">
                                {candidate.avatarInitials}
                                {candidate.source === 'Internal DB (AI)' && (
                                    <div className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-[8px] px-1.5 py-0.5 rounded-full border border-white">AI</div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                            {candidate.name}
                                            {candidate.source === 'Internal DB (AI)' && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-lg border border-purple-200">AI Scout Match</span>}
                                        </h2>
                                        <p className="text-slate-500 dark:text-slate-400">{candidate.role}</p>
                                    </div>
                                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                        <i className="fas fa-times text-xl"></i>
                                    </button>
                                </div>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button 
                                                key={star}
                                                onClick={() => handleRatingUpdate(star)}
                                                className={`text-sm focus:outline-none transition-transform hover:scale-110 ${star <= currentRating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
                                            >
                                                <i className="fas fa-star"></i>
                                            </button>
                                        ))}
                                    </div>
                                    {(candidate.re5 === 'certified' || candidate.isRE5Certified) && (
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                                            RE5 Certified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LIVE TRACKER STEPPER */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <i className="fas fa-route text-liberty-blue dark:text-blue-400"></i> Application Journey
                            </h4>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-medium text-slate-400">Time in Stage:</span>
                                <span className="text-xs font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    2 Days
                                </span>
                            </div>
                        </div>
                        {currentStatus === 'rejected' ? (
                            <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-lg p-3 flex items-center justify-center gap-3">
                                <i className="fas fa-ban text-red-500 text-lg"></i>
                                <span className="font-bold text-red-700 dark:text-red-300">Application Rejected</span>
                                <button 
                                    onClick={() => { setCurrentStatus('new'); if (onUpdateCandidate) onUpdateCandidate(candidate.id, {status: 'new'}); }}
                                    className="text-xs underline text-red-600 hover:text-red-800 ml-4"
                                >
                                    Reactivate
                                </button>
                            </div>
                        ) : (
                            <div className="relative flex justify-between items-center px-2">
                                {/* Connecting Line */}
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -z-0"></div>
                                <div 
                                    className="absolute top-1/2 left-0 h-0.5 bg-green-500 transition-all duration-500 -z-0" 
                                    style={{ width: `${(currentStepIndex / (PIPELINE_STEPS.length - 1)) * 100}%` }}
                                ></div>

                                {PIPELINE_STEPS.map((step, index) => {
                                    const isCompleted = index <= currentStepIndex;
                                    const isCurrent = index === currentStepIndex;
                                    
                                    return (
                                        <div key={step.id} className="relative z-10 flex flex-col items-center group cursor-pointer" onClick={() => handleStepClick(step.id)}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                                                isCurrent 
                                                    ? 'bg-liberty-blue border-liberty-blue text-white scale-110 shadow-md ring-2 ring-blue-200 dark:ring-blue-900' 
                                                    : isCompleted 
                                                        ? 'bg-green-50 border-green-50 text-white' 
                                                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'
                                            }`}>
                                                {isCompleted && !isCurrent ? <i className="fas fa-check"></i> : index + 1}
                                            </div>
                                            <span className={`absolute top-full mt-2 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap transition-colors ${
                                                isCurrent ? 'text-liberty-blue dark:text-blue-400' : isCompleted ? 'text-green-600 dark:text-green-400' : 'text-slate-400'
                                            }`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    {/* Sidebar Info */}
                    <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-800/50 p-6 border-r border-slate-100 dark:border-slate-700 overflow-y-auto">
                        
                        {/* Recruiter Notes Section (if available) */}
                        {candidate.submissionNotes && (
                            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl">
                                <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-2 text-xs uppercase tracking-wider flex items-center gap-2">
                                    <i className="fas fa-comment-alt"></i> Recruiter Notes
                                </h3>
                                <p className="text-sm text-amber-900 dark:text-amber-100 italic leading-relaxed">
                                    "{candidate.submissionNotes}"
                                </p>
                            </div>
                        )}

                        <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm uppercase tracking-wider">Contact & Info</h3>
                        <div className="space-y-4 text-sm">
                            <div>
                                <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold block mb-1">Email</label>
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <i className="fas fa-envelope text-slate-400 w-4"></i>
                                    <a href={`mailto:${candidate.email}`} className="hover:text-liberty-blue dark:hover:text-blue-400 hover:underline truncate">{candidate.email}</a>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold block mb-1">Phone</label>
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <i className="fas fa-phone text-slate-400 w-4"></i>
                                    <span>{candidate.phone}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold block mb-1">Experience</label>
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <i className="fas fa-briefcase text-slate-400 w-4"></i>
                                    <span>{candidate.experience}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold block mb-1">AI Match Score</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full ${
                                                candidate.matchScore >= 80 ? 'bg-green-500' :
                                                candidate.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`} 
                                            style={{ width: `${candidate.matchScore}%` }}
                                        ></div>
                                    </div>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{candidate.matchScore}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm uppercase tracking-wider">Actions</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => setShowResume(true)}
                                    className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-600 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 hover:text-liberty-blue dark:hover:text-blue-400 transition-colors"
                                >
                                    <i className="fas fa-file-pdf mr-2"></i> Resume
                                </button>
                                <button className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-600 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    <i className="fab fa-linkedin mr-2"></i> LinkedIn
                                </button>
                                <button className="px-3 py-2 bg-liberty-blue text-white rounded text-sm font-medium hover:bg-liberty-light transition-colors col-span-2 shadow-sm">
                                    <i className="fas fa-calendar-check mr-2"></i> Schedule Interview
                                </button>
                                {currentStatus !== 'rejected' && (
                                    <button 
                                        onClick={handleReject}
                                        className="px-3 py-2 bg-red-50 text-red-600 border border-red-100 rounded text-sm font-medium hover:bg-red-100 transition-colors col-span-2 mt-2"
                                    >
                                        <i className="fas fa-ban mr-2"></i> Reject Candidate
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col min-h-[400px]">
                        {/* Tabs */}
                        <div className="flex border-b border-slate-100 dark:border-slate-700 px-6 bg-white dark:bg-slate-800">
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'history' ? 'border-liberty-blue text-liberty-blue dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                            >
                                History
                            </button>
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'reviews' ? 'border-liberty-blue text-liberty-blue dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                            >
                                Reviews
                            </button>
                            <button
                                onClick={() => setActiveTab('ai_analysis')}
                                className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                                    activeTab === 'ai_analysis' ? 'border-purple-500 text-purple-600 dark:text-purple-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-purple-500'
                                }`}
                            >
                                <i className="fas fa-sparkles"></i> AI Insights
                            </button>
                            <button
                                onClick={() => setActiveTab('notes')}
                                className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                                    activeTab === 'notes' ? 'border-liberty-blue text-liberty-blue dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                            >
                                Notes
                                <span className="bg-red-500 text-white text-[9px] px-1 rounded animate-pulse">LIVE</span>
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-slate-800">
                            {activeTab === 'history' && (
                                <div className="space-y-6">
                                    {candidate.history?.map((event, index) => (
                                        <div key={event.id} className="flex gap-4 group">
                                            <div className="flex flex-col items-center">
                                                <div className="w-3 h-3 bg-liberty-blue dark:bg-blue-500 rounded-full ring-4 ring-blue-50 dark:ring-blue-900/30 group-hover:ring-blue-100 dark:group-hover:ring-blue-800 transition-shadow"></div>
                                                {index !== (candidate.history?.length || 0) - 1 && <div className="w-0.5 h-full bg-slate-100 dark:bg-slate-700 my-1"></div>}
                                            </div>
                                            <div className="pb-6">
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{event.action}</p>
                                                <p className="text-xs text-slate-400 mb-1">{event.date}</p>
                                                {event.description && <p className="text-sm text-slate-600 dark:text-slate-400">{event.description}</p>}
                                            </div>
                                        </div>
                                    ))}
                                    {(!candidate.history || candidate.history.length === 0) && (
                                        <div className="text-center text-slate-400 py-8 italic">No history available</div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="space-y-4">
                                    {candidate.reviews?.map((review) => (
                                        <div key={review.id} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                                        {review.reviewer.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{review.reviewer}</p>
                                                        <p className="text-xs text-slate-400">{review.date}</p>
                                                    </div>
                                                </div>
                                                <div className="flex text-yellow-400 text-xs">
                                                    {[...Array(5)].map((_, i) => (
                                                        <i key={i} className={`fas fa-star ${i < review.rating ? '' : 'text-slate-200 dark:text-slate-600'}`}></i>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{review.comment}"</p>
                                        </div>
                                    ))}
                                    {(!candidate.reviews || candidate.reviews.length === 0) && (
                                        <div className="text-center text-slate-400 py-8 italic">No reviews yet</div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'ai_analysis' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-800 dark:text-white">AI Screening Assistant</h4>
                                            <p className="text-xs text-slate-500">Run a deep analysis of this profile against the role requirements.</p>
                                        </div>
                                        <button 
                                            onClick={runAIAnalysis}
                                            disabled={isAnalyzing}
                                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {isAnalyzing ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-robot"></i>}
                                            {isAnalyzing ? 'Analyzing...' : (aiAnalysis ? 'Re-run Analysis' : 'Trigger AI Analysis')}
                                        </button>
                                    </div>

                                    {isAnalyzing ? (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">Processing profile with Gemini...</p>
                                        </div>
                                    ) : aiAnalysis ? (
                                        <div className="animate-fade-in-up">
                                            {/* Score Card */}
                                            <div className="bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-800 p-6 rounded-xl border border-purple-100 dark:border-purple-800 mb-6 flex items-center gap-6">
                                                <div className="relative w-20 h-20 flex items-center justify-center">
                                                    <svg className="w-full h-full transform -rotate-90">
                                                        <circle cx="40" cy="40" r="36" className="text-purple-100 dark:text-purple-900" strokeWidth="8" fill="none" stroke="currentColor"/>
                                                        <circle cx="40" cy="40" r="36" className="text-purple-600 dark:text-purple-400" strokeWidth="8" fill="none" stroke="currentColor" strokeDasharray={`${aiAnalysis.score * 2.26} 226`}/>
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                        <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">{aiAnalysis.score}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">Gemini Fit Summary</h3>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                        {aiAnalysis.analysis}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-3 text-xs uppercase tracking-wide flex items-center gap-2">
                                                        <i className="fas fa-check-circle text-green-500"></i> Identified Strengths
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {aiAnalysis.strengths?.map((s, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border border-green-100 dark:border-green-900/50">
                                                                <span className="text-green-600 dark:text-green-400 font-bold">•</span> {s}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-3 text-xs uppercase tracking-wide flex items-center gap-2">
                                                        <i className="fas fa-exclamation-triangle text-amber-500"></i> Identified Gaps
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {aiAnalysis.weaknesses?.map((w, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg border border-amber-100 dark:border-amber-800/50">
                                                                <span className="text-amber-600 dark:text-amber-400 font-bold">•</span> {w}
                                                            </li>
                                                        ))}
                                                        {(!aiAnalysis.weaknesses || aiAnalysis.weaknesses.length === 0) && (
                                                            <li className="text-sm text-slate-400 italic bg-slate-50 dark:bg-slate-700 p-2 rounded-lg">No significant gaps identified.</li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-slate-400 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                            <i className="fas fa-magic text-3xl mb-3 opacity-30"></i>
                                            <p className="text-sm">Click "Trigger AI Analysis" to get profile insights.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'notes' && (
                                <div className="flex flex-col h-full">
                                    <div className="mb-6">
                                        <textarea
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            placeholder="Type a real-time collaborative note..."
                                            className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-liberty-blue/20 resize-none h-24 text-slate-800 dark:text-white transition-all shadow-sm"
                                        ></textarea>
                                        <div className="flex justify-end mt-2">
                                            <button 
                                                onClick={handleAddNote}
                                                className="px-4 py-2 bg-liberty-blue text-white rounded-lg text-sm font-medium hover:bg-liberty-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                disabled={!newNote.trim()}
                                            >
                                                <span>Add Note</span>
                                                <i className="fas fa-paper-plane text-xs"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        {candidate.notes?.map((note) => (
                                            <div key={note.id} className="border-l-4 border-liberty-accent bg-slate-50 dark:bg-slate-700/50 p-3 rounded-r-lg animate-fade-in">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{note.author}</span>
                                                    <span className="text-[10px] text-slate-400 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-600">{note.date}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{note.text}</p>
                                            </div>
                                        ))}
                                        {(!candidate.notes || candidate.notes.length === 0) && (
                                            <div className="text-center text-slate-400 py-8 italic">
                                                <p className="mb-2">No notes added yet.</p>
                                                <p className="text-xs opacity-70">Start typing to collaborate in real-time.</p>
                                            </div>
                                        )}
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
