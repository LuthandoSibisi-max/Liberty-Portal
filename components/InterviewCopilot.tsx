
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { UserRole } from '../types';

interface InterviewQuestion {
    id: number;
    text: string;
    completed: boolean;
    score?: number;
    notes?: string;
}

interface InterviewCopilotProps {
    userRole?: UserRole;
}

export const InterviewCopilot: React.FC<InterviewCopilotProps> = ({ userRole }) => {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    // Start with empty questions
    const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
    const [generating, setGenerating] = useState(false);
    const [micActive, setMicActive] = useState(false);
    const [videoActive, setVideoActive] = useState(true);

    const isClient = userRole === UserRole.LIBERTY;
    const sessionTitle = isClient ? "LIVE INTERVIEW" : "CANDIDATE SCREENING";

    const handleStartSession = () => {
        setIsSessionActive(true);
        // In a real app, this would initialize WebRTC
    };

    const handleScore = (score: number) => {
        if (!questions[currentQuestionIndex]) return;
        const updatedQuestions = [...questions];
        updatedQuestions[currentQuestionIndex].score = score;
        updatedQuestions[currentQuestionIndex].completed = true;
        setQuestions(updatedQuestions);
    };

    const handleNotes = (text: string) => {
        if (!questions[currentQuestionIndex]) return;
        const updatedQuestions = [...questions];
        updatedQuestions[currentQuestionIndex].notes = text;
        setQuestions(updatedQuestions);
    };

    const generateFollowUp = async () => {
        setGenerating(true);
        try {
            const context = questions[currentQuestionIndex]?.text || "General Interview Context";
            const prompt = `Based on the interview question: "${context}", suggest a probing follow-up question to test depth of knowledge.`;
            const followUpText = await geminiService.chat(prompt);
            
            setQuestions(prev => [
                ...prev.slice(0, currentQuestionIndex + 1),
                { id: Date.now(), text: followUpText, completed: false },
                ...prev.slice(currentQuestionIndex + 1)
            ]);
        } catch (e) {
            console.error(e);
        } finally {
            setGenerating(false);
        }
    };

    // Add function to start initial questions
    const startInitialQuestions = () => {
        setQuestions([
            { id: 1, text: "Can you tell me about yourself?", completed: false },
            { id: 2, text: "What interests you about this role?", completed: false }
        ]);
        setIsSessionActive(true);
    };

    if (!isSessionActive) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-900 text-white p-6 animate-fade-in">
                <div className="max-w-md text-center">
                    <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-700">
                        <i className="fas fa-headset text-4xl text-blue-400"></i>
                    </div>
                    <h2 className="text-3xl font-bold mb-3">{sessionTitle}</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Ready to begin? The AI Copilot will transcribe audio in real-time and suggest follow-up questions based on candidate responses.
                    </p>
                    <button 
                        onClick={startInitialQuestions}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-900/20 transition-all transform hover:-translate-y-1"
                    >
                        Start Session
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-slate-900 text-white animate-fade-in overflow-hidden">
            {/* Top Bar */}
            <div className="h-16 border-b border-slate-700 bg-slate-800/50 flex items-center justify-between px-6 shrink-0 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <div>
                        <h2 className="font-bold text-sm tracking-wide">{sessionTitle}</h2>
                        <div className="text-xs text-slate-400">Candidate: --</div>
                    </div>
                    <div className="h-6 w-px bg-slate-700 mx-2"></div>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
                        <i className="far fa-clock"></i> 00:00:00
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => setMicActive(!micActive)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${micActive ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-500 hover:bg-red-600'}`}
                    >
                        <i className={`fas fa-microphone${micActive ? '' : '-slash'}`}></i>
                    </button>
                    <button 
                        onClick={() => setVideoActive(!videoActive)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${videoActive ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-500 hover:bg-red-600'}`}
                    >
                        <i className={`fas fa-video${videoActive ? '' : '-slash'}`}></i>
                    </button>
                    <button 
                        onClick={() => setIsSessionActive(false)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg"
                    >
                        End Session
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Video Area (Simulated) */}
                <div className="flex-1 bg-black relative flex flex-col items-center justify-center p-4">
                    {/* Remote Video Placeholder */}
                    <div className="w-full h-full rounded-2xl bg-slate-800 overflow-hidden relative border border-slate-700 shadow-2xl flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-32 h-32 rounded-full bg-slate-700 flex items-center justify-center mb-4 border-4 border-slate-600 mx-auto">
                                <span className="text-4xl font-bold text-slate-500">--</span>
                            </div>
                            <p className="text-slate-500 font-medium">Waiting for candidate...</p>
                        </div>
                        
                        {/* Local Video Pip */}
                        <div className="absolute bottom-4 right-4 w-48 h-32 bg-slate-900 rounded-lg border border-slate-700 shadow-lg flex items-center justify-center overflow-hidden">
                            <div className="text-xs text-slate-500">You</div>
                        </div>
                    </div>
                </div>

                {/* Right Copilot Panel */}
                <div className="w-96 bg-slate-800 border-l border-slate-700 flex flex-col shadow-2xl z-20">
                    <div className="p-4 border-b border-slate-700 bg-slate-800">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-sm tracking-wide text-blue-400">
                                {isClient ? "AI INTERVIEWER" : "SCREENING ASSISTANT"}
                            </h3>
                            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-bold">BETA</span>
                        </div>
                        <div className="flex gap-2 text-xs">
                             <div className="flex-1 bg-slate-700 rounded h-1.5 overflow-hidden">
                                <div className="bg-blue-500 h-full" style={{width: questions.length > 0 ? `${((currentQuestionIndex + 1) / questions.length) * 100}%` : '0%'}}></div>
                             </div>
                             <span className="text-slate-400">{questions.length > 0 ? currentQuestionIndex + 1 : 0}/{questions.length}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {/* Current Question Card */}
                        {questions.length > 0 ? (
                            <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-4 rounded-xl border border-blue-500/30 shadow-lg relative group">
                                <div className="absolute -left-1 top-4 w-1 h-8 bg-blue-500 rounded-r"></div>
                                <h4 className="text-sm font-semibold text-white mb-3 leading-relaxed">
                                    {questions[currentQuestionIndex].text}
                                </h4>
                                
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Quick Score</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => handleScore(star)}
                                                    className={`flex-1 py-1.5 rounded transition-colors text-xs font-bold ${
                                                        (questions[currentQuestionIndex].score || 0) >= star 
                                                            ? 'bg-yellow-500 text-slate-900' 
                                                            : 'bg-slate-900 text-slate-500 hover:bg-slate-600'
                                                    }`}
                                                >
                                                    <i className="fas fa-star"></i>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Observation Notes</label>
                                        <textarea 
                                            placeholder="Candidate mentioned..."
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-xs text-white focus:border-blue-500 focus:outline-none resize-none h-16 placeholder:text-slate-600"
                                            value={questions[currentQuestionIndex].notes || ''}
                                            onChange={(e) => handleNotes(e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-slate-500 py-10">
                                <p className="text-sm">No questions generated yet.</p>
                            </div>
                        )}

                        {/* AI Actions */}
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={generateFollowUp}
                                disabled={generating || questions.length === 0}
                                className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 p-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-2 disabled:opacity-50"
                            >
                                <i className={`fas fa-magic text-lg ${generating ? 'animate-spin' : ''}`}></i>
                                {generating ? 'Generating...' : 'Suggest Follow-up'}
                            </button>
                             <button className="bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 p-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-2">
                                <i className="fas fa-search text-lg"></i>
                                Fact Check
                            </button>
                        </div>

                        {/* Upcoming Questions */}
                        {questions.length > currentQuestionIndex + 1 && (
                            <div className="pt-4 border-t border-slate-700">
                                 <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Upcoming</h5>
                                 <div className="space-y-2 opacity-50">
                                    {questions.slice(currentQuestionIndex + 1).map((q, i) => (
                                        <div key={q.id} className="p-3 bg-slate-700/50 rounded-lg border border-slate-700 text-xs text-slate-400 truncate">
                                            {i + 1}. {q.text}
                                        </div>
                                    ))}
                                 </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-between gap-3">
                         <button 
                            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                            disabled={currentQuestionIndex === 0}
                            className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-bold disabled:opacity-50 hover:bg-slate-600 transition-colors"
                        >
                            Back
                        </button>
                        <button 
                            onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                            disabled={questions.length === 0 || currentQuestionIndex === questions.length - 1}
                            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:bg-slate-600"
                        >
                            Next Question
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
