
import React, { useState, useRef, useEffect } from 'react';
import { geminiService, decodeAudioData } from '../services/geminiService';
import { ChatMessage } from '../types';

export const AIChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'init',
            role: 'model',
            text: 'Hi there! 👋 I\'m your Recruitment AI Assistant. I can analyze resumes, map locations, or deep-reason through complex queries. How can I assist?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'standard' | 'fast' | 'search' | 'pro' | 'maps'>('standard');
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState<string | null>(null); // Message ID currently playing
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSuggestion = (text: string) => {
        setInput(text);
    };

    // Initialize Audio Context on user interaction if needed
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
                    // Fixed: transcribeAudio now exists in geminiService
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
            // Stop all tracks
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleSpeak = async (messageId: string, text: string) => {
        if (isPlaying) return; // Prevent overlapping playback
        setIsPlaying(messageId);
        
        try {
            // Fixed: speak now exists in geminiService and returns raw PCM bytes as Uint8Array
            const audioBytes = await geminiService.speak(text);
            if (audioBytes) {
                const ctx = getAudioContext();
                // Fixed: Native decodeAudioData fails on raw PCM. Using custom helper from geminiService.
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
                // Use Gemini 3 Pro with Thinking
                isThinking = true;
                responseText = await geminiService.proChat(userMsg.text);
            } else {
                // Standard Flash
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
            {/* Floating Trigger Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-8 right-8 h-16 w-16 bg-gradient-to-br from-liberty-blue to-liberty-light rounded-full shadow-[0_8px_30px_rgba(0,51,102,0.3)] flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 z-50 group border-4 border-white dark:border-slate-800"
                >
                    <i className="fas fa-sparkles text-2xl group-hover:animate-pulse"></i>
                    <span className="absolute top-0 right-0 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-green-400 border-2 border-white dark:border-slate-800"></span>
                    </span>
                </button>
            )}

            {/* Chat Interface */}
            {isOpen && (
                <div className="fixed bottom-8 right-8 w-[400px] h-[650px] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden border border-slate-200/60 dark:border-slate-700 animate-fade-in-up font-sans">
                    {/* Header */}
                    <div className="bg-liberty-blue p-5 flex justify-between items-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <i className="fas fa-robot text-lg"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Gemini Assistant</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                    <span className="text-[10px] text-blue-100 uppercase tracking-wider font-medium">Online</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-colors relative z-10">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    {/* Mode Toggle Pills */}
                    <div className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur p-3 overflow-x-auto">
                        <div className="flex gap-2 justify-start min-w-max px-2">
                            {[
                                { id: 'standard', label: 'Chat', icon: 'fa-comment' },
                                { id: 'fast', label: 'Fast', icon: 'fa-bolt' },
                                { id: 'search', label: 'Search', icon: 'fa-globe' },
                                { id: 'maps', label: 'Maps', icon: 'fa-map-location-dot' },
                                { id: 'pro', label: 'Think', icon: 'fa-brain' }
                            ].map((m: any) => (
                                <button
                                    key={m.id}
                                    onClick={() => setMode(m.id)}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-full flex items-center gap-2 transition-all ${
                                        mode === m.id 
                                            ? 'bg-liberty-blue text-white shadow-md transform scale-105' 
                                            : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                                    }`}
                                >
                                    <i className={`fas ${m.icon} ${mode === m.id ? 'text-blue-300' : 'text-slate-400'}`}></i> {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50 dark:bg-slate-900/50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                                {msg.role === 'model' && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-liberty-blue to-liberty-light flex items-center justify-center text-white text-xs shrink-0 mr-2 mt-1 shadow-sm">
                                        <i className="fas fa-robot"></i>
                                    </div>
                                )}
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm relative group ${
                                    msg.role === 'user' 
                                        ? 'bg-liberty-blue text-white rounded-br-none' 
                                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none border border-slate-200/60 dark:border-slate-600'
                                }`}>
                                    {msg.isThinking && (
                                        <div className="text-xs text-purple-600 dark:text-purple-400 mb-2 font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-purple-100 dark:border-purple-900 pb-1">
                                            <i className="fas fa-brain animate-pulse"></i> Deep Reasoning
                                        </div>
                                    )}
                                    <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                                    
                                    {/* Sources Display (Search or Maps) */}
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-600">
                                            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                                                <i className="fas fa-check-circle text-green-500"></i> Grounded Sources
                                            </p>
                                            <ul className="space-y-1.5">
                                                {msg.sources.map((source, idx) => (
                                                    <li key={idx}>
                                                        <a href={source.uri} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-600 rounded hover:bg-blue-50 dark:hover:bg-slate-500 transition-colors group text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-500/50">
                                                            <div className="w-4 h-4 bg-white dark:bg-slate-500 rounded flex items-center justify-center shadow-sm text-[8px] text-blue-500 dark:text-blue-300 font-bold border border-slate-100 dark:border-slate-400">
                                                                {idx + 1}
                                                            </div>
                                                            <span className="truncate flex-1 group-hover:text-blue-600 dark:group-hover:text-blue-300 font-medium">{source.title || 'Source Link'}</span>
                                                            <i className="fas fa-external-link-alt text-[9px] text-slate-300 dark:text-slate-400 group-hover:text-blue-400"></i>
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* TTS Button for Model Messages */}
                                    {msg.role === 'model' && (
                                        <button 
                                            onClick={() => handleSpeak(msg.id, msg.text)}
                                            className={`absolute -right-8 bottom-0 p-2 text-slate-400 hover:text-liberty-blue transition-colors ${isPlaying === msg.id ? 'text-liberty-blue animate-pulse' : ''}`}
                                            title="Read Aloud"
                                        >
                                            <i className={`fas ${isPlaying === msg.id ? 'fa-stop-circle' : 'fa-volume-up'}`}></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="w-8 h-8 rounded-full bg-liberty-blue flex items-center justify-center text-white text-xs shrink-0 mr-2 shadow-sm">
                                    <i className="fas fa-robot"></i>
                                </div>
                                <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-slate-200 dark:border-slate-600">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                    {mode === 'pro' && <div className="text-[10px] text-purple-400 mt-1 font-medium animate-pulse">Thinking...</div>}
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions (Only if chat is empty-ish) */}
                    {messages.length < 3 && !isLoading && (
                        <div className="px-5 pb-2 bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                                {['Draft outreach email', 'Map nearby offices', 'Screen candidate with deep thinking'].map(s => (
                                    <button 
                                        key={s} 
                                        onClick={() => handleSuggestion(s)}
                                        className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-xs text-slate-600 dark:text-slate-300 hover:border-liberty-blue hover:text-liberty-blue dark:hover:text-blue-400 transition-colors shadow-sm"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                        <div className="relative flex items-center gap-2">
                            <button 
                                type="button" 
                                onClick={isRecording ? handleStopRecording : handleStartRecording}
                                className={`p-2 rounded-lg transition-colors ${
                                    isRecording ? 'text-red-500 bg-red-50 animate-pulse' : 'text-slate-400 hover:text-liberty-blue dark:hover:text-blue-400'
                                }`}
                                title={isRecording ? "Stop Recording" : "Record Audio"}
                            >
                                <i className={`fas ${isRecording ? 'fa-stop-circle' : 'fa-microphone'}`}></i>
                            </button>
                            <button type="button" className="p-2 text-slate-400 hover:text-liberty-blue dark:hover:text-blue-400 transition-colors">
                                <i className="fas fa-paperclip"></i>
                            </button>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isRecording ? "Listening..." : mode === 'maps' ? "Find location..." : "Ask Gemini..."}
                                className="flex-1 bg-slate-50 dark:bg-slate-700 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-liberty-blue/20 dark:focus:ring-blue-500/20 text-slate-800 dark:text-white placeholder:text-slate-400 font-medium"
                                disabled={isRecording}
                            />
                            <button 
                                type="submit" 
                                disabled={!input.trim() || isLoading || isRecording}
                                className={`h-10 w-10 text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95 ${
                                    mode === 'pro' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 
                                    mode === 'maps' ? 'bg-gradient-to-r from-green-500 to-teal-500' :
                                    'bg-liberty-blue hover:bg-liberty-light'
                                }`}
                            >
                                <i className={`fas ${mode === 'pro' ? 'fa-brain' : 'fa-paper-plane'} text-xs`}></i>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};
