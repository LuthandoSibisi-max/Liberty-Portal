
import React from 'react';
import { MediaStudio } from './MediaStudio';

interface AIToolkitProps {
    initialPrompt?: string;
}

export const AIToolkit: React.FC<AIToolkitProps> = ({ initialPrompt }) => {
    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-6 animate-fade-in-up">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">AI Toolkit</h2>
                <p className="text-slate-500 dark:text-slate-400">Powerful AI-driven tools to accelerate your recruitment workflow.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {/* Tool Card: Job Desc Gen */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 hover:shadow-md transition-all group cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-liberty-blue dark:text-blue-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                        <i className="fas fa-pen-nib"></i>
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Job Description Generator</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Automatically generate professional job descriptions and requirements lists from a simple title.</p>
                    <span className="text-xs font-bold text-liberty-blue dark:text-blue-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Available in Request Wizard <i className="fas fa-arrow-right"></i>
                    </span>
                </div>

                {/* Tool Card: Candidate Fit */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 hover:shadow-md transition-all group cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                        <i className="fas fa-user-check"></i>
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Candidate Fit Analyzer</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Analyze candidate skills against job requirements to get an instant match score and gap analysis.</p>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Available in Candidate Details <i className="fas fa-arrow-right"></i>
                    </span>
                </div>

                {/* Tool Card: Partner Report */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 hover:shadow-md transition-all group cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                        <i className="fas fa-chart-line"></i>
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Partner Performance Report</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Generate comprehensive performance reports for MNO including submission rates and success metrics.</p>
                    <span className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Generate Now <i className="fas fa-arrow-right"></i>
                    </span>
                </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
                 <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Media Studio</h3>
                 <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 overflow-hidden">
                    <MediaStudio initialPrompt={initialPrompt} />
                 </div>
            </div>
        </div>
    );
};
