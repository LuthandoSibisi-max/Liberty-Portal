
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { Request, Submission, Candidate } from '../types';

interface SubmitCandidateModalProps {
    request: Request;
    onClose: () => void;
    onSubmit: (submission: Partial<Submission>, candidateDetails: Partial<Candidate>) => void;
}

export const SubmitCandidateModal: React.FC<SubmitCandidateModalProps> = ({ request, onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [experience, setExperience] = useState('');
    const [re5, setRe5] = useState<'certified' | 'pending' | 'none'>('pending');
    const [isParsing, setIsParsing] = useState(false);
    const [matchScore, setMatchScore] = useState(85);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                // Parse resume using Gemini
                const data = await geminiService.parseResume(base64);
                
                if (data.name) setName(data.name);
                if (data.email) setEmail(data.email);
                if (data.phone) setPhone(data.phone);
                if (data.experience) setExperience(data.experience);
                if (data.isRE5Certified) setRe5('certified');
                
                setIsParsing(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error(error);
            setIsParsing(false);
            alert("Could not parse resume.");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const submissionData: Partial<Submission> = {
            requestId: request.id,
            candidateName: name,
            candidateEmail: email,
            matchScore: matchScore
        };

        const candidateData: Partial<Candidate> = {
            name,
            email,
            phone,
            experience,
            re5,
            source: 'MNO Partner',
            status: 'new'
        };

        onSubmit(submissionData, candidateData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Submit Candidate</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="p-6">
                    {/* Resume Upload AI Trigger */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Auto-Fill from Resume
                        </label>
                        <div className="relative border-2 border-dashed border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 text-center hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer group">
                            <input 
                                type="file" 
                                accept=".pdf,.docx"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            {isParsing ? (
                                <div className="text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center justify-center gap-2">
                                    <i className="fas fa-circle-notch fa-spin"></i> Parsing Resume...
                                </div>
                            ) : (
                                <div className="text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center justify-center gap-2 group-hover:scale-105 transition-transform">
                                    <i className="fas fa-cloud-upload-alt"></i> Upload CV to Auto-Fill
                                </div>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">Full Name</label>
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Email</label>
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Phone</label>
                                <input 
                                    type="text" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">Experience Summary</label>
                            <textarea 
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-blue-500 outline-none h-20 resize-none"
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">RE5 Status</label>
                                <select 
                                    value={re5}
                                    onChange={(e) => setRe5(e.target.value as any)}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-blue-500 outline-none"
                                >
                                    <option value="certified">Certified</option>
                                    <option value="pending">Pending</option>
                                    <option value="none">None</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Self-Assessed Match</label>
                                <div className="flex items-center gap-2 h-[46px]">
                                    <input 
                                        type="range" 
                                        min="0" max="100" 
                                        value={matchScore}
                                        onChange={(e) => setMatchScore(parseInt(e.target.value))}
                                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="font-bold text-blue-600 text-sm w-8">{matchScore}%</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={!name || !email}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Submit Application
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
