
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { Request, Candidate } from '../types';

interface AddCandidateModalProps {
    onClose: () => void;
    onAdd: (candidate: Partial<Candidate>) => void;
    requests: Request[];
}

export const AddCandidateModal: React.FC<AddCandidateModalProps> = ({ onClose, onAdd, requests }) => {
    const [isParsing, setIsParsing] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        email: '',
        phone: '',
        experience: '',
        qualification: '',
        re5: 'none' as Candidate['re5'],
        priority: 'medium' as Candidate['priority'],
        employmentStatus: 'Currently Employed',
        requestId: '' as string | number,
        sellingPoints: '',
        probeQuestions: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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
                
                setFormData(prev => ({
                    ...prev,
                    name: data.name || prev.name,
                    email: data.email || prev.email,
                    phone: data.phone || prev.phone,
                    experience: data.experience || prev.experience,
                    qualification: data.qualification || prev.qualification,
                    role: data.currentRole || prev.role,
                    re5: data.isRE5Certified ? 'certified' : prev.re5
                }));
                
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
        
        const candidate: Partial<Candidate> = {
            ...formData,
            status: 'new',
            source: 'MNO Partner',
            rating: 0,
            matchScore: 70, // Default baseline
            avatarInitials: formData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
        };

        onAdd(candidate);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-[#030712]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#0B1120] border border-white/10 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-blue-600/10 to-transparent">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                            <i className="fas fa-user-plus"></i> Talent Ingestion
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Add New Candidate</h2>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <form id="add-candidate-form" onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* Grid Section 1: Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                <input 
                                    name="name" required value={formData.name} onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="Enter full name..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Role</label>
                                <input 
                                    name="role" value={formData.role} onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="e.g. FA @ Momentum"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                                <input 
                                    type="email" name="email" required value={formData.email} onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                                <input 
                                    name="phone" value={formData.phone} onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="+27..."
                                />
                            </div>
                        </div>

                        {/* Grid Section 2: Experience & Quals */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Experience</label>
                                <input 
                                    name="experience" value={formData.experience} onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none"
                                    placeholder="e.g. 3.5 years"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Qualification</label>
                                <input 
                                    name="qualification" value={formData.qualification} onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none"
                                    placeholder="e.g. BCom Hons"
                                />
                            </div>
                        </div>

                        {/* Dropdowns Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">RE5 Status</label>
                                <select 
                                    name="re5" value={formData.re5} onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none appearance-none"
                                >
                                    <option value="none">Not Certified</option>
                                    <option value="certified">Certified</option>
                                    <option value="pending">Pending Result</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Priority Level</label>
                                <select 
                                    name="priority" value={formData.priority} onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none appearance-none"
                                >
                                    <option value="high">High Priority</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Employment Status</label>
                                <select 
                                    name="employmentStatus" value={formData.employmentStatus} onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none appearance-none"
                                >
                                    <option>Currently Employed</option>
                                    <option>Open to Offers</option>
                                    <option>Unemployed</option>
                                    <option>In Notice Period</option>
                                </select>
                            </div>
                        </div>

                        {/* Link to Request */}
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Link to Request</label>
                            <select 
                                name="requestId" value={formData.requestId} onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none appearance-none"
                            >
                                <option value="">No specific request (Internal DB)</option>
                                {requests.map(r => (
                                    <option key={r.id} value={r.id}>{r.title} - {r.location}</option>
                                ))}
                            </select>
                        </div>

                        {/* Large Text Areas */}
                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Why Liberty Needs Them</label>
                                <textarea 
                                    name="sellingPoints" value={formData.sellingPoints} onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-blue-500 outline-none h-24 resize-none"
                                    placeholder="Key selling points for the hiring manager..."
                                />
                            </div>

                            {/* CV Upload Section */}
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Artifact Ingestion</label>
                                <div className="relative group">
                                    <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${isParsing ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-blue-500/50 hover:bg-white/5'}`}>
                                        <input 
                                            type="file" accept=".pdf,.docx" onChange={handleFileUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        {isParsing ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-sm font-bold text-blue-400">Gemini parsing candidate artifacts...</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <i className="fas fa-cloud-upload-alt text-3xl text-slate-500 group-hover:text-blue-400 transition-colors"></i>
                                                <p className="text-sm font-bold text-slate-300">Drag Candidate CVs Here</p>
                                                <p className="text-[10px] text-slate-500">Supports PDF, DOCX, JSON</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">Interview Probe Questions</label>
                                <textarea 
                                    name="probeQuestions" value={formData.probeQuestions} onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-blue-500 outline-none h-24 resize-none"
                                    placeholder="Key questions to probe for this candidate..."
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-white/5 bg-black/20 flex justify-between gap-4">
                    <button onClick={onClose} className="px-8 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-bold text-sm transition-all uppercase tracking-widest">
                        Discard
                    </button>
                    <button 
                        type="submit" 
                        form="add-candidate-form"
                        className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm shadow-xl shadow-blue-900/20 transition-all active:scale-95 flex items-center gap-3 uppercase tracking-[0.2em]"
                    >
                        <i className="fas fa-check"></i> Finalize Candidate
                    </button>
                </div>
            </div>
        </div>
    );
};
