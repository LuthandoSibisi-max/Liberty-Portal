
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { Request } from '../types';

interface RequestWizardProps {
    onClose: () => void;
    onAddRequest?: (request: Request) => void;
}

export const RequestWizard: React.FC<RequestWizardProps> = ({ onClose, onAddRequest }) => {
    const [title, setTitle] = useState('');
    const [department, setDepartment] = useState('Finance & FA');
    const [skillsInput, setSkillsInput] = useState('');
    const [description, setDescription] = useState('');
    const [requirements, setRequirements] = useState('');
    const [partnerNotes, setPartnerNotes] = useState('');
    const [targetHires, setTargetHires] = useState(1);
    const [re5Requirement, setRe5Requirement] = useState('required');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExtractingSkills, setIsExtractingSkills] = useState(false);
    const [isParsing, setIsParsing] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                const data = await geminiService.parseJobSpec(base64);
                
                if (data.title) setTitle(data.title);
                if (data.department) setDepartment(data.department);
                if (data.description) setDescription(data.description);
                if (data.requirements) setRequirements(data.requirements);
                if (data.skills && data.skills.length > 0) setSkillsInput(data.skills.join(', '));
                
                setIsParsing(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error(error);
            setIsParsing(false);
            alert("Could not parse document.");
        }
    };

    const handleAIGenerate = async () => {
        if (!title) return;
        setIsGenerating(true);
        try {
            const skillContext = skillsInput ? `The role requires expertise in: ${skillsInput}.` : '';
            const prompt = `Generate a professional job description and a list of requirements for a "${title}" position in the ${department} department. ${skillContext}
            Format the response as JSON with two keys: "description" and "requirements".`;
            
            const responseText = await geminiService.chat(prompt);
            
            let generatedDesc = "";
            try {
                const cleanJson = responseText.replace(/```json|```/g, '').trim();
                const data = JSON.parse(cleanJson);
                generatedDesc = data.description || responseText;
                setDescription(generatedDesc);
                setRequirements(Array.isArray(data.requirements) ? data.requirements.join('\n') : (data.requirements || ""));
            } catch (e) {
                generatedDesc = responseText;
                setDescription(generatedDesc);
                setRequirements("Review description for requirements.");
            }

            if (generatedDesc) {
                setIsExtractingSkills(true);
                const specData = await geminiService.parseJobSpecFromText(`${title} ${generatedDesc}`);
                if (specData.skills && specData.skills.length > 0) {
                    setSkillsInput(specData.skills.join(', '));
                }
                setIsExtractingSkills(false);
            }
        } catch (error) {
            console.error("AI Generation failed", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const newRequest: Request = {
            id: Date.now(),
            title,
            department,
            location: 'Johannesburg', 
            status: 'new',
            urgency: 'high', 
            candidatesCount: 0,
            postedDate: 'Just now',
            description,
            requirements,
            skills: skillsInput.split(',').map(s => s.trim()).filter(s => s), 
            salaryRange: 'Market Related',
            createdBy: 'You',
            assignedTo: 'MNO',
            partnerNotes,
            targetHires,
            re5Requirement: re5Requirement as 'required' | 'preferred' | 'not_required'
        };

        if (onAddRequest) {
            onAddRequest(newRequest);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-liberty-blue text-white">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        <i className="fas fa-sparkles text-amber-400"></i> New Client Search
                    </h2>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                    <form className="space-y-8" onSubmit={handleSubmit}>
                        
                        <div className="bg-indigo-50/30 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800 group transition-all">
                            <label className="block text-[10px] font-black text-indigo-600 dark:text-indigo-400 mb-3 uppercase tracking-[0.2em]">
                                Artifact Analysis (Upload Spec)
                            </label>
                            <div className="relative border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 rounded-2xl p-6 text-center hover:bg-white dark:hover:bg-slate-700/50 transition-all cursor-pointer">
                                <input 
                                    type="file" 
                                    accept=".pdf,.docx,.txt"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                {isParsing ? (
                                    <div className="flex flex-col items-center justify-center gap-3 text-indigo-600 font-black animate-pulse">
                                        <i className="fas fa-dna fa-spin text-2xl"></i>
                                        <span className="text-xs">Processing artifact...</span>
                                    </div>
                                ) : (
                                    <div className="text-slate-500 dark:text-slate-400 text-sm pointer-events-none">
                                        <i className="fas fa-cloud-upload-alt text-2xl mb-2 text-indigo-400"></i>
                                        <p className="font-bold">Upload Job Spec or Model CV</p>
                                        <p className="text-[10px] opacity-70 mt-1">AI will automatically populate all search dimensions.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Search Title *</label>
                                <input 
                                    type="text" 
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-liberty-blue focus:ring-4 focus:ring-liberty-blue/5 text-slate-800 dark:text-white font-semibold transition-all" 
                                    placeholder="e.g. Lead Wealth Manager" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Target Department</label>
                                <select 
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-liberty-blue text-slate-800 dark:text-white font-semibold transition-all appearance-none"
                                >
                                    <option>Finance & FA</option>
                                    <option>IT & Technology</option>
                                    <option>Operations</option>
                                    <option>HR & Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Fulfillment Capacity</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={targetHires}
                                        onChange={(e) => setTargetHires(parseInt(e.target.value) || 1)}
                                        className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-liberty-blue text-slate-800 dark:text-white font-semibold transition-all" 
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Hires</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Regulatory (RE5)</label>
                                <select 
                                    value={re5Requirement}
                                    onChange={(e) => setRe5Requirement(e.target.value)}
                                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-liberty-blue text-slate-800 dark:text-white font-semibold transition-all"
                                >
                                    <option value="required">Mandatory Requirement</option>
                                    <option value="preferred">Beneficial Competency</option>
                                    <option value="not_required">Not Applicable</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Dimension Markers (Skills)</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={skillsInput}
                                    onChange={(e) => setSkillsInput(e.target.value)}
                                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-liberty-blue text-slate-800 dark:text-white font-semibold transition-all pr-12" 
                                    placeholder="Comma-separated keywords..." 
                                />
                                {isExtractingSkills && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-500 animate-spin">
                                        <i className="fas fa-circle-notch"></i>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Fulfillment Scope (Description)</label>
                                <button 
                                    type="button"
                                    onClick={handleAIGenerate}
                                    disabled={!title || isGenerating}
                                    className="text-[10px] bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-xl font-black uppercase tracking-[0.2em] border border-amber-100 dark:border-amber-800 hover:bg-amber-100 transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
                                >
                                    <i className={`fas fa-magic ${isGenerating ? 'animate-bounce' : ''}`}></i>
                                    {isGenerating ? 'Synthesizing...' : 'Neural Auto-Populate'}
                                </button>
                            </div>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl h-32 focus:outline-none focus:border-liberty-blue text-slate-800 dark:text-white font-medium text-sm leading-relaxed" 
                                placeholder="Enter job description..."
                            ></textarea>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Requirements</label>
                            <textarea 
                                value={requirements}
                                onChange={(e) => setRequirements(e.target.value)}
                                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl h-32 focus:outline-none focus:border-liberty-blue text-slate-800 dark:text-white font-medium text-sm leading-relaxed" 
                                placeholder="List key requirements..."
                            ></textarea>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Additional Notes for MNO</label>
                            <textarea 
                                value={partnerNotes}
                                onChange={(e) => setPartnerNotes(e.target.value)}
                                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl h-24 focus:outline-none focus:border-liberty-blue text-slate-800 dark:text-white font-medium text-sm leading-relaxed" 
                                placeholder="Specific instructions for the partner..."
                            ></textarea>
                        </div>

                        <div className="p-8 -mx-8 -mb-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between gap-4">
                            <button type="button" onClick={onClose} className="px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-all text-xs font-black uppercase tracking-widest">
                                Discard
                            </button>
                            <button type="submit" className="px-10 py-3 bg-liberty-blue text-white rounded-xl hover:bg-liberty-light transition-all text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 flex items-center gap-3">
                                <i className="fas fa-paper-plane"></i> Initialize Search
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
