
import React from 'react';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportHtml: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, reportHtml }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <i className="fas fa-file-contract text-blue-600"></i> Performance Report
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
                            <i className="fas fa-print"></i>
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white dark:bg-slate-900">
                    <div 
                        className="prose prose-sm md:prose-base dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: reportHtml }} 
                    />
                </div>
                <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-colors">
                        Close Report
                    </button>
                </div>
            </div>
        </div>
    );
};
