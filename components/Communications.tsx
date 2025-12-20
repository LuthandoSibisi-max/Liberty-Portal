
import React, { useState } from 'react';
import { Conversation, UserRole } from '../types';

interface CommunicationsProps {
    userRole?: UserRole;
    conversations: Conversation[];
    onSendMessage: (conversationId: number, text: string) => void;
}

export const Communications: React.FC<CommunicationsProps> = ({ userRole, conversations, onSendMessage }) => {
    const [selectedConvId, setSelectedConvId] = useState<number>(1);
    const [messageInput, setMessageInput] = useState('');

    const selectedConv = conversations.find(c => c.id === selectedConvId) || conversations[0];

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim()) return;
        
        onSendMessage(selectedConvId, messageInput);
        setMessageInput('');
    };

    return (
        <div className="p-6 h-[calc(100vh-73px)] animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Conversations List */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-liberty-blue to-liberty-light text-white">
                        <h3 className="font-bold text-lg mb-4">Messages</h3>
                        <div className="relative">
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <input 
                                type="text" 
                                placeholder="Search conversations..." 
                                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-white/50 bg-white"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                        {conversations.map(conv => (
                            <div 
                                key={conv.id}
                                onClick={() => setSelectedConvId(conv.id)}
                                className={`p-4 border-b border-slate-50 dark:border-slate-700 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 flex gap-3 items-center ${
                                    selectedConvId === conv.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-liberty-blue' : ''
                                }`}
                            >
                                <div className="w-12 h-12 rounded-full bg-liberty-blue text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm relative">
                                    {conv.avatar}
                                    {conv.unread && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className={`text-sm truncate ${conv.unread ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                                            {conv.name}
                                        </h4>
                                        <span className="text-xs text-slate-400 dark:text-slate-500">{conv.time}</span>
                                    </div>
                                    <p className={`text-xs truncate ${conv.unread ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {conv.lastMessage}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-liberty-blue text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                {selectedConv ? selectedConv.avatar : '?'}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white">{selectedConv ? selectedConv.name : 'Select a conversation'}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedConv ? selectedConv.role : ''}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => alert("Video call feature coming soon")} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-liberty-blue transition-colors" title="Video Call">
                                <i className="fas fa-video"></i>
                            </button>
                            <button onClick={() => alert("Voice call feature coming soon")} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-liberty-blue transition-colors" title="Phone Call">
                                <i className="fas fa-phone"></i>
                            </button>
                            <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-liberty-blue transition-colors" title="More Options">
                                <i className="fas fa-ellipsis-v"></i>
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
                        {selectedConv && selectedConv.messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm text-sm relative group ${
                                    msg.sent 
                                        ? 'bg-liberty-blue text-white rounded-br-none' 
                                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-600'
                                }`}>
                                    <p>{msg.text}</p>
                                    <span className={`text-[10px] block text-right mt-1 opacity-70 ${msg.sent ? 'text-blue-100' : 'text-slate-400'}`}>
                                        {msg.time}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                        <form onSubmit={handleSend} className="flex gap-3 items-end">
                            <button type="button" className="p-3 text-slate-400 dark:text-slate-500 hover:text-liberty-blue hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                <i className="fas fa-paperclip"></i>
                            </button>
                            <div className="flex-1 relative">
                                <textarea
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Type your message..."
                                    className="w-full border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-liberty-blue focus:ring-1 focus:ring-liberty-blue resize-none h-[50px] custom-scrollbar bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend(e);
                                        }
                                    }}
                                ></textarea>
                            </div>
                            <button 
                                type="submit" 
                                disabled={!messageInput.trim()}
                                className="p-3 bg-liberty-blue text-white rounded-xl hover:bg-liberty-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
