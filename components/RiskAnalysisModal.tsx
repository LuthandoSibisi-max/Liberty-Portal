
import React from 'react';

interface RiskAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    riskData: { riskScore: number, rationale: string, factors: string[] } | null;
    isLoading: boolean;
}

export const RiskAnalysisModal: React.FC<RiskAnalysisModalProps> = ({ isOpen, onClose, riskData, isLoading }) => {
    if (!isOpen) return null;

    const getRiskColor = (score: number) => {
        if (score < 40) return 'text-green-500';
        if (score < 70) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getRiskBg = (score: number) => {
        if (score < 40) return 'bg-green-500';
        if (score < 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                        <i className="fas fa-chart-line text-purple-500"></i> Recruitment Risk Analysis
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="p-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <i className="fas fa-circle-notch fa-spin text-4xl text-purple-500 mb-4"></i>
                            <p className="text-slate-500 font-medium">AI Analyzing Market Difficulty...</p>
                        </div>
                    ) : riskData ? (
                        <div className="animate-fade-in-up">
                            <div className="flex justify-center mb-8">
                                <div className="relative w-40 h-40">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-700" />
                                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                                            strokeDasharray={440} 
                                            strokeDashoffset={440 - (440 * riskData.riskScore) / 100} 
                                            className={`${getRiskColor(riskData.riskScore)} transition-all duration-1000 ease-out`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                                        <span className={`text-4xl font-bold ${getRiskColor(riskData.riskScore)}`}>{riskData.riskScore}</span>
                                        <span className="text-xs uppercase font-bold text-slate-400 mt-1">Risk Score</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-100 dark:border-slate-700 mb-6">
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-2">AI Rationale</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {riskData.rationale}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">Contributing Factors</h4>
                                <div className="space-y-2">
                                    {riskData.factors.map((factor, index) => (
                                        <div key={index} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                                            <div className={`w-2 h-2 rounded-full ${getRiskBg(riskData.riskScore)}`}></div>
                                            {factor}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-red-500">Failed to load analysis.</div>
                    )}
                </div>
            </div>
        </div>
    );
};
