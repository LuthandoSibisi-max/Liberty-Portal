
import React, { useState } from 'react';
import { MediaStudio } from './MediaStudio';
import { Request, Candidate } from '../types';
import { geminiService } from '../services/geminiService';
import { ReportModal } from './ReportModal';

interface AIToolkitProps {
    initialPrompt?: string;
    candidates: Candidate[];
    requests: Request[];
}

export const AIToolkit: React.FC<AIToolkitProps> = ({ initialPrompt, candidates, requests }) => {
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Results
    const [generatedJD, setGeneratedJD] = useState('');
    const [fitAnalysis, setFitAnalysis] = useState<any>(null);
    const [suggestedCandidates, setSuggestedCandidates] = useState<any[]>([]);
    
    // Inputs
    const [jdTitle, setJdTitle] = useState('');
    const [jdKeywords, setJdKeywords] = useState('');
    
    const [fitJD, setFitJD] = useState('');
    const [fitSkills, setFitSkills] = useState('');
    const [fitExp, setFitExp] = useState('');

    const [suggestJD, setSuggestJD] = useState('');

    // Report
    const [showReport, setShowReport] = useState(false);
    const [reportHtml, setReportHtml] = useState('');

    const handleGenerateJD = async () => {
        setIsLoading(true);
        try {
            const result = await geminiService.generateJobDescription(jdTitle, jdKeywords);
            setGeneratedJD(result);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyzeFit = async () => {
        setIsLoading(true);
        try {
            const candidateMock = { skills: fitSkills, experience: fitExp };
            const result = await geminiService.screenCandidate(candidateMock, fitJD);
            setFitAnalysis(result);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestCandidates = async () => {
        setIsLoading(true);
        try {
            const result = await geminiService.suggestCandidates(suggestJD, candidates);
            setSuggestedCandidates(result);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateReport = async () => {
        setIsLoading(true);
        try {
            const metrics = {
                activeRequests: requests.length,
                totalCandidates: candidates.length,
                placements: candidates.filter(c => c.status === 'hired').length
            };
            const result = await geminiService.generatePerformanceReport(metrics);
            setReportHtml(result);
            setShowReport(true);
        } finally {
            setIsLoading(false);
        }
    };

    const ToolCard = ({ id, title, description, icon, color, children }: any) => (
        <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 transition-all overflow-hidden ${activeTool === id ? 'ring-2 ring-liberty-blue dark:ring-blue-500' : 'hover:shadow-md'}`}>
            <div 
                className="p-6 cursor-pointer"
                onClick={() => setActiveTool(activeTool === id ? null : id)}
            >
                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${color}`}>
                        <i className={`fas ${icon}`}></i>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1 flex justify-between items-center">
                            {title}
                            <i className={`fas fa-chevron-down text-slate-400 text-sm transition-transform ${activeTool === id ? 'rotate-180' : ''}`}></i>
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
                    </div>
                </div>
            </div>
            
            {activeTool === id && (
                <div className="px-6 pb-6 pt-0 animate-fade-in">
                    <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-2">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-6 animate-fade-in-up">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                    <i className="fas fa-brain text-purple-500"></i> AI Toolkit
                </h2>
                <p className="text-slate-500 dark:text-slate-400">Leverage Gemini neural models to accelerate recruitment tasks.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                
                {/* JD Generator */}
                <ToolCard 
                    id="jd-gen"
                    title="Job Description Generator" 
                    description="Create comprehensive job descriptions from titles and keywords."
                    icon="fa-file-alt"
                    color="bg-blue-50 dark:bg-blue-900/30 text-liberty-blue dark:text-blue-400"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Job Title</label>
                            <input 
                                type="text" 
                                value={jdTitle} 
                                onChange={e => setJdTitle(e.target.value)}
                                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                placeholder="e.g. Senior Data Scientist"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Keywords (Optional)</label>
                            <input 
                                type="text" 
                                value={jdKeywords} 
                                onChange={e => setJdKeywords(e.target.value)}
                                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                placeholder="e.g. Python, Remote, Equity"
                            />
                        </div>
                        <button 
                            onClick={handleGenerateJD} 
                            disabled={isLoading || !jdTitle}
                            className="w-full py-2 bg-liberty-blue text-white rounded-lg font-bold text-sm hover:bg-liberty-light disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-magic"></i>} Generate
                        </button>
                        {generatedJD && (
                            <textarea 
                                readOnly 
                                value={generatedJD} 
                                className="w-full h-40 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm resize-none"
                            />
                        )}
                    </div>
                </ToolCard>

                {/* Candidate Fit */}
                <ToolCard 
                    id="cand-fit"
                    title="Candidate Fit Analyzer" 
                    description="Score candidate text against a job description."
                    icon="fa-user-check"
                    color="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Job Description</label>
                            <textarea 
                                value={fitJD}
                                onChange={e => setFitJD(e.target.value)}
                                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm h-20"
                                placeholder="Paste JD here..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Skills</label>
                                <input 
                                    type="text" 
                                    value={fitSkills} 
                                    onChange={e => setFitSkills(e.target.value)}
                                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                    placeholder="React, Node..."
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Experience</label>
                                <input 
                                    type="text" 
                                    value={fitExp} 
                                    onChange={e => setFitExp(e.target.value)}
                                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                    placeholder="5 years..."
                                />
                            </div>
                        </div>
                        <button 
                            onClick={handleAnalyzeFit} 
                            disabled={isLoading || !fitJD}
                            className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold text-sm hover:bg-purple-700 disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-bolt"></i>} Analyze
                        </button>
                        {fitAnalysis && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">Match Score</span>
                                    <span className="text-lg font-black text-purple-600">{fitAnalysis.score}%</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 text-xs">{fitAnalysis.analysis}</p>
                            </div>
                        )}
                    </div>
                </ToolCard>

                {/* Candidate Suggestions */}
                <ToolCard 
                    id="suggest"
                    title="Talent Suggestion Engine" 
                    description="Find top candidates from your database for a role."
                    icon="fa-users"
                    color="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Job Context / Description</label>
                            <textarea 
                                value={suggestJD}
                                onChange={e => setSuggestJD(e.target.value)}
                                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm h-24"
                                placeholder="Describe the role..."
                            />
                        </div>
                        <button 
                            onClick={handleSuggestCandidates} 
                            disabled={isLoading || !suggestJD}
                            className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-search"></i>} Find Candidates
                        </button>
                        {suggestedCandidates.length > 0 && (
                            <div className="space-y-2">
                                {suggestedCandidates.map((c: any, i) => (
                                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-slate-800 dark:text-white text-sm">{c.name}</div>
                                            <div className="text-xs text-slate-500">{c.reason}</div>
                                        </div>
                                        <span className="font-black text-green-600 text-sm">{c.matchScore}%</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </ToolCard>

                {/* Report Generator */}
                <ToolCard 
                    id="report"
                    title="Partner Report Generator" 
                    description="Generate executive performance reports instantly."
                    icon="fa-chart-pie"
                    color="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                >
                    <div className="text-center py-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Click below to generate a comprehensive analysis of current recruitment metrics, pipeline health, and partner performance.
                        </p>
                        <button 
                            onClick={handleGenerateReport} 
                            disabled={isLoading}
                            className="w-full py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-file-contract"></i>} Generate Report
                        </button>
                    </div>
                </ToolCard>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
                 <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Media Studio</h3>
                 <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 overflow-hidden">
                    <MediaStudio initialPrompt={initialPrompt} />
                 </div>
            </div>

            <ReportModal isOpen={showReport} onClose={() => setShowReport(false)} reportHtml={reportHtml} />
        </div>
    );
};
