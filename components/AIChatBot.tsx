
import React, { useState, useRef, useEffect } from 'react';
import { geminiService, decodeAudioData } from '../services/geminiService';
import { ChatMessage } from '../types';

export const AIChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        const saved = localStorage.getItem('chat_history');
        return saved ? JSON.parse(saved) : [
            {
                id: 'init',
                role: 'model',
                text: 'Hi there! 👋 I\'m your Recruitment AI Assistant. I can analyze resumes, map locations, or deep-reason through complex queries. How can I assist?',
                timestamp: new Date()
            }
        ];
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'standard' | 'fast' | 'search' | 'pro' | 'maps'>('standard');
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState<string | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        localStorage.setItem('chat_history', JSON.stringify(messages));
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSuggestion = (text: string) => {
        setInput(text);
    };

    const getAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return audioContextRef.current;
    };

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const audioChunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Audio = reader.result as string;
                    setIsLoading(true);
                    const transcription = await geminiService.transcribeAudio(base64Audio);
                    setIsLoading(false);
                    setInput(transcription);
                };
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Could not access microphone.");
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleSpeak = async (messageId: string, text: string) => {
        if (isPlaying) {
            setIsPlaying(null);
            return;
        }
        setIsPlaying(messageId);
        
        try {
            const audioBytes = await geminiService.speak(text);
            if (audioBytes) {
                const ctx = getAudioContext();
                const decodedAudio = await decodeAudioData(audioBytes, ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = decodedAudio;
                source.connect(ctx.destination);
                source.onended = () => setIsPlaying(null);
                source.start(0);
            } else {
                setIsPlaying(null);
            }
        } catch (error) {
            console.error("Playback error", error);
            setIsPlaying(null);
        }
    };

    const handleClearChat = () => {
        if (confirm("Clear chat history?")) {
            setMessages([{
                id: 'init',
                role: 'model',
                text: 'Hi there! 👋 I\'m your Recruitment AI Assistant. I can analyze resumes, map locations, or deep-reason through complex queries. How can I assist?',
                timestamp: new Date()
            }]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            let responseText = '';
            let sources = undefined;
            let isThinking = false;

            if (mode === 'fast') {
                responseText = await geminiService.fastChat(userMsg.text);
            } else if (mode === 'search') {
                const result = await geminiService.search(userMsg.text);
                responseText = result.text;
                sources = result.sources;
            } else if (mode === 'maps') {
                const result = await geminiService.mapQuery(userMsg.text);
                responseText = result.text;
                sources = result.sources;
            } else if (mode === 'pro') {
                isThinking = true;
                responseText = await geminiService.proChat(userMsg.text);
            } else {
                responseText = await geminiService.chat(userMsg.text);
            }

            const modelMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: responseText,
                timestamp: new Date(),
                isThinking,
                sources
            };
            setMessages(prev => [...prev, modelMsg]);
        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: "I encountered an error processing your request. Please try again.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-8 right-8 h-16 w-16 bg-gradient-to-br from-liberty-blue to-liberty-light rounded-full shadow-[0_8px_30px_rgba(0,51,102,0.4)] flex items-center justify-center text-white hover:scale-110 transition-all duration-300 z-50 group border-4 border-white dark:border-slate-800"
                >
                    <i className="fas fa-sparkles text-2xl group-hover:rotate-12 transition-transform"></i>
                    <span className="absolute top-0 right-0 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white dark:border-slate-800"></span>
                    </span>
                    <div className="absolute right-full mr-4 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-100 dark:border-slate-700 pointer-events-none">
                        Ask Gemini AI
                    </div>
                </button>
            )}

            {isOpen && (
                <div className="fixed bottom-8 right-8 w-[420px] h-[700px] bg-white dark:bg-[#0B1120] rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col z-50 overflow-hidden border border-slate-200/60 dark:border-slate-800 animate-fade-in-up">
                    {/* Premium Header */}
                    <div className="bg-gradient-to-r from-liberty-blue to-liberty-light p-6 relative overflow-hidden shrink-0">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <div className="flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                                    <i className="fas fa-brain text-white text-xl animate-pulse"></i>
                                </div>
                                <div>
                                    <h3 className="font-serif font-bold text-white tracking-wide">Gemini Cognitive Co-Pilot</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(74,222,128,0.5)]"></div>
                                        <span className="text-[10px] text-blue-100 uppercase tracking-widest font-black opacity-80">System Ready</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleClearChat} className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white/70 hover:text-white" title="Clear History">
                                    <i className="fas fa-trash-can text-xs"></i>
                                </button>
                                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white/70 hover:text-white">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Logic Gates / Mode Toggles */}
                    <div className="bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                            {[
                                { id: 'standard', label: 'Inquiry', icon: 'fa-comment-dots', color: 'blue' },
                                { id: 'fast', label: 'Turbo', icon: 'fa-bolt-lightning', color: 'amber' },
                                { id: 'pro', label: 'Thinking', icon: 'fa-microchip', color: 'purple' },
                                { id: 'search', label: 'Web', icon: 'fa-globe', color: 'sky' },
                                { id: 'maps', label: 'Geo', icon: 'fa-location-dot', color: 'emerald' }
                            ].map((m: any) => (
                                <button
                                    key={m.id}
                                    onClick={() => setMode(m.id)}
                                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all shrink-0 border ${
                                        mode === m.id 
                                            ? 'bg-liberty-blue border-liberty-blue text-white shadow-lg shadow-blue-900/20' 
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                                >
                                    <i className={`fas ${m.icon} ${mode === m.id ? 'text-white' : ''}`}></i>
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Neural Net / Messages View */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/20">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                                {msg.role === 'model' && (
                                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-liberty-blue flex items-center justify-center text-white text-xs shrink-0 mr-3 mt-1 shadow-md border border-white/20">
                                        <i className="fas fa-robot"></i>
                                    </div>
                                )}
                                <div className={`group relative max-w-[85%] rounded-[2rem] px-5 py-4 text-sm transition-all duration-300 ${
                                    msg.role === 'user' 
                                        ? 'bg-liberty-blue text-white rounded-br-none shadow-xl shadow-blue-900/10' 
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-800 shadow-sm'
                                }`}>
                                    {msg.isThinking && (
                                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-indigo-50 dark:border-indigo-900/30">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">Cognitive Reasoning active</span>
                                        </div>
                                    )}
                                    <div className="whitespace-pre-wrap leading-relaxed font-light">{msg.text}</div>
                                    
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-700/50">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <i className="fas fa-link text-indigo-400"></i> Referenced Knowledge
                                            </p>
                                            <div className="grid gap-2">
                                                {msg.sources.map((source, idx) => (
                                                    <a key={idx} href={source.uri} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-600 group">
                                                        <span className="w-5 h-5 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-[8px] font-black text-indigo-500 shadow-sm border border-slate-100 dark:border-slate-700">{idx + 1}</span>
                                                        <span className="truncate flex-1 text-xs font-medium group-hover:text-liberty-blue transition-colors">{source.title || 'Knowledge Base'}</span>
                                                        <i className="fas fa-chevron-right text-[8px] text-slate-300 opacity-0 group-hover:opacity-100 transition-all"></i>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {msg.role === 'model' && (
                                        <button 
                                            onClick={() => handleSpeak(msg.id, msg.text)}
                                            className={`absolute -right-10 bottom-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                                isPlaying === msg.id 
                                                    ? 'bg-blue-100 text-blue-600 animate-pulse' 
                                                    : 'text-slate-300 hover:text-liberty-blue hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            <i className={`fas ${isPlaying === msg.id ? 'fa-stop' : 'fa-volume-high'} text-[10px]`}></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start animate-pulse">
                                <div className="w-9 h-9 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 mr-3 mt-1 shadow-sm">
                                    <i className="fas fa-robot"></i>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-none px-6 py-4 shadow-sm border border-slate-100 dark:border-slate-800">
                                    <div className="flex gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Prompt Intelligence (Suggestions) */}
                    {messages.length < 3 && !isLoading && (
                        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                                {[
                                    { text: 'Draft outreach', icon: 'fa-paper-plane' },
                                    { text: 'Analyze fit', icon: 'fa-brain' },
                                    { text: 'Map talent', icon: 'fa-location-dot' }
                                ].map(s => (
                                    <button 
                                        key={s.text} 
                                        onClick={() => handleSuggestion(s.text)}
                                        className="whitespace-nowrap px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:border-liberty-blue hover:text-liberty-blue dark:hover:text-blue-400 transition-all shadow-sm"
                                    >
                                        <i className={`fas ${s.icon} mr-2 opacity-50`}></i> {s.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Executive Input Terminal */}
                    <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-[#0B1120] border-t border-slate-100 dark:border-slate-800 shrink-0">
                        <div className="relative flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <button 
                                    type="button" 
                                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                                    className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${
                                        isRecording 
                                            ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-900/20' 
                                            : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-liberty-blue dark:hover:text-blue-400'
                                    }`}
                                    title={isRecording ? "Terminate Recording" : "Initialize Voice Capture"}
                                >
                                    <i className={`fas ${isRecording ? 'fa-square' : 'fa-microphone'}`}></i>
                                </button>
                                <button type="button" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-liberty-blue transition-colors flex items-center justify-center">
                                    <i className="fas fa-plus-circle"></i>
                                </button>
                            </div>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isRecording ? "Neural stream active..." : "Query Gemini Collective..."}
                                className="flex-1 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-liberty-blue/10 dark:focus:ring-blue-500/10 text-slate-800 dark:text-white placeholder:text-slate-400 font-medium transition-all"
                                disabled={isRecording}
                            />
                            <button 
                                type="submit" 
                                disabled={!input.trim() || isLoading || isRecording}
                                className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white transition-all shadow-xl active:scale-95 disabled:opacity-50 ${
                                    mode === 'pro' ? 'bg-gradient-to-br from-purple-600 to-indigo-600 shadow-purple-900/20' : 
                                    mode === 'maps' ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-900/20' :
                                    'bg-liberty-blue hover:bg-liberty-light shadow-blue-900/20'
                                }`}
                            >
                                <i className={`fas ${isLoading ? 'fa-circle-notch fa-spin' : mode === 'pro' ? 'fa-microchip' : 'fa-arrow-right'} text-sm`}></i>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};
