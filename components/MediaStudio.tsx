
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';

interface MediaStudioProps {
    initialPrompt?: string;
}

export const MediaStudio: React.FC<MediaStudioProps> = ({ initialPrompt }) => {
    const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
    const [prompt, setPrompt] = useState(initialPrompt || '');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Switch to video tab if initialPrompt is provided, assuming it's for video generation
    useEffect(() => {
        if (initialPrompt) {
            setPrompt(initialPrompt);
            setActiveTab('video');
        }
    }, [initialPrompt]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setResultUrl(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        try {
            if (activeTab === 'image') {
                if (!selectedImage) return; 
                const editedImage = await geminiService.editImage(selectedImage, prompt);
                setResultUrl(editedImage);
            } else {
                const videoUrl = await geminiService.generateVideo(prompt);
                setResultUrl(videoUrl);
            }
        } catch (error) {
            console.error(error);
            alert("Generation failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (resultUrl) {
            const link = document.createElement('a');
            link.href = resultUrl;
            link.download = activeTab === 'image' ? 'generated_image.png' : 'generated_video.mp4';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="p-8 h-[calc(100vh-73px)] overflow-y-auto animate-fade-in-up bg-slate-50/50 dark:bg-slate-900/50">
             <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">AI Media Studio</h2>
                        <p className="text-slate-500 dark:text-slate-400">Create compelling visual assets for your recruitment campaigns.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex gap-1">
                        <button
                            onClick={() => { setActiveTab('image'); setResultUrl(null); }}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                                activeTab === 'image' ? 'bg-liberty-blue text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            <i className="fas fa-image"></i> Image Editor
                        </button>
                        <button
                            onClick={() => { setActiveTab('video'); setResultUrl(null); }}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                                activeTab === 'video' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            <i className="fas fa-video"></i> Veo Video
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
                    {/* Controls Panel */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700 p-6 flex flex-col h-full">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <i className="fas fa-sliders-h text-slate-400"></i> Configuration
                        </h3>

                        <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                            {activeTab === 'image' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                        Source Image
                                    </label>
                                    <div className="relative group cursor-pointer">
                                        <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${selectedImage ? 'border-liberty-blue bg-blue-50/30 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-liberty-blue hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            {selectedImage ? (
                                                <div className="relative h-40 w-full">
                                                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                                        <span className="text-white font-bold text-sm"><i className="fas fa-pen mr-2"></i>Change</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-8">
                                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-liberty-blue dark:text-blue-300 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
                                                        <i className="fas fa-cloud-upload-alt"></i>
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Click to upload</p>
                                                    <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    {activeTab === 'image' ? 'Editing Instruction' : 'Video Description'}
                                </label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={activeTab === 'image' ? "Make the background an office setting..." : "A professional recruitment video for Liberty..."}
                                    className="w-full border border-slate-200 dark:border-slate-600 rounded-xl p-4 text-sm focus:outline-none focus:border-liberty-blue focus:ring-4 focus:ring-liberty-blue/5 min-h-[160px] resize-none shadow-inner bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400"
                                ></textarea>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !prompt || (activeTab === 'image' && !selectedImage)}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transform transition-all active:scale-95 mt-4 flex items-center justify-center gap-2 ${
                                isLoading ? 'bg-slate-400 cursor-not-allowed' : 
                                activeTab === 'image' ? 'bg-gradient-to-r from-liberty-blue to-liberty-light hover:shadow-xl hover:-translate-y-0.5' : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:shadow-xl hover:-translate-y-0.5'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <i className="fas fa-circle-notch fa-spin"></i> Generating...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-wand-magic-sparkles"></i> Generate Asset
                                </>
                            )}
                        </button>
                    </div>

                    {/* Preview Panel */}
                    <div className="lg:col-span-2 bg-slate-900 rounded-2xl shadow-2xl overflow-hidden relative flex items-center justify-center border border-slate-800 group">
                        {/* Grid Background */}
                        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                        
                        {resultUrl ? (
                            <div className="relative z-10 w-full h-full p-4 flex flex-col">
                                <div className="flex-1 flex items-center justify-center">
                                    {activeTab === 'image' ? (
                                        <img src={resultUrl} alt="Result" className="max-w-full max-h-full rounded-lg shadow-2xl" />
                                    ) : (
                                        <video src={resultUrl} controls className="max-w-full max-h-full rounded-lg shadow-2xl" />
                                    )}
                                </div>
                                <div className="flex justify-center gap-4 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={handleDownload} className="bg-white/10 hover:bg-white/20 backdrop-blur text-white px-6 py-2 rounded-lg font-semibold border border-white/10 flex items-center gap-2 transition-colors">
                                        <i className="fas fa-download"></i> Download
                                    </button>
                                    <button className="bg-red-500/80 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2" onClick={() => setResultUrl(null)}>
                                        <i className="fas fa-trash"></i> Clear
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center relative z-10">
                                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                                    <i className={`fas ${activeTab === 'image' ? 'fa-image' : 'fa-film'} text-4xl text-slate-500`}></i>
                                </div>
                                <h3 className="text-xl font-bold text-slate-300 mb-2">Preview Canvas</h3>
                                <p className="text-slate-500 max-w-xs mx-auto">Configure your settings and click generate to see the AI magic happen here.</p>
                            </div>
                        )}
                    </div>
                </div>
             </div>
        </div>
    );
};
