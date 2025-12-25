
import React, { useState } from 'react';
import { UserRole, Notification, AppView } from '../types';
import { MOCK_CANDIDATES, MOCK_REQUESTS, MOCK_CONVERSATIONS } from '../constants';

interface HeaderProps {
    userRole: UserRole;
    setUserRole: (role: UserRole) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    notifications: Notification[];
    currentView: AppView;
}

export const Header: React.FC<HeaderProps> = ({ userRole, theme, toggleTheme, notifications, currentView }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    
    // MNO is Admin (Partner Role), Liberty is Client
    const isMNO = userRole === UserRole.PARTNER || userRole === UserRole.RECRUITER;
    
    // Filter notifications for the current user role
    const filteredNotifications = notifications.filter(n => 
        n.recipient === 'all' || 
        n.recipient === userRole ||
        (userRole === UserRole.RECRUITER && n.recipient === 'partner')
    );
    
    const unreadCount = filteredNotifications.filter(n => !n.read).length;

    // Combined Search Logic
    const searchResults = searchTerm.length < 2 ? [] : [
        ...MOCK_CANDIDATES.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.role.toLowerCase().includes(searchTerm.toLowerCase())).map(c => ({ ...c, type: 'candidate' })),
        ...MOCK_REQUESTS.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.description?.toLowerCase().includes(searchTerm.toLowerCase())).map(r => ({ ...r, type: 'request', name: r.title })),
        ...MOCK_CONVERSATIONS.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())).map(c => ({ ...c, type: 'message' }))
    ];

    return (
        <header className="bg-[#030712]/80 backdrop-blur-md sticky top-0 z-40 px-8 py-4 flex justify-between items-center border-b border-white/5 transition-colors duration-300">
            {/* Context Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="text-white font-semibold">Home</span>
                <i className="fas fa-chevron-right text-[10px]"></i>
                <span className="capitalize">{currentView.replace('_', ' ')}</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden md:block group">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors"></i>
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsSearching(true)}
                        onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                        placeholder={isMNO ? "Search all clients, talent..." : "Search my requests..."}
                        className="pl-10 pr-4 py-2 bg-[#0B1120] border border-white/5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none w-72 transition-all text-white placeholder:text-slate-500 shadow-inner"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 border border-white/10 rounded px-1.5 py-0.5 bg-white/5">⌘K</span>

                    {/* Search Results Dropdown */}
                    {isSearching && searchTerm.length >= 2 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B1120] rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50 animate-fade-in-up">
                            {searchResults.length > 0 ? (
                                <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                                    {searchResults.map((res: any, idx) => (
                                        <div key={idx} className="p-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                                                res.type === 'candidate' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/20' :
                                                res.type === 'request' ? 'bg-purple-900/30 text-purple-400 border border-purple-500/20' :
                                                'bg-green-900/30 text-green-400 border border-green-500/20'
                                            }`}>
                                                <i className={`fas ${
                                                    res.type === 'candidate' ? 'fa-user' :
                                                    res.type === 'request' ? 'fa-briefcase' :
                                                    'fa-comment-alt'
                                                }`}></i>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-white text-sm truncate">{res.name}</div>
                                                <div className="text-xs text-slate-400 truncate">
                                                    {res.type === 'candidate' ? res.role : res.type === 'request' ? res.department : res.lastMessage}
                                                </div>
                                            </div>
                                            <span className="text-[9px] uppercase font-bold text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">{res.type}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-sm text-slate-500">No results found</div>
                            )}
                        </div>
                    )}
                </div>

                <div className="h-6 w-px bg-white/10 mx-2"></div>

                <div className="relative">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="w-10 h-10 rounded-full bg-[#0B1120] border border-white/5 text-slate-400 hover:text-white hover:border-white/20 flex items-center justify-center transition-all relative shadow-sm"
                    >
                        <i className="fas fa-bell"></i>
                        {unreadCount > 0 && (
                            <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border border-[#0B1120] animate-pulse"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <>
                            <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setShowNotifications(false)}
                            ></div>
                            <div className="absolute right-0 top-full mt-3 w-80 bg-[#0B1120] rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden animate-fade-in-up origin-top-right">
                                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-sm">
                                    <h3 className="font-bold text-white">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button 
                                            className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {filteredNotifications.length === 0 ? (
                                        <div className="p-8 text-center text-slate-500 text-sm">No new notifications</div>
                                    ) : (
                                        <div className="divide-y divide-white/5">
                                            {filteredNotifications.map(n => (
                                                <div key={n.id} className={`p-4 hover:bg-white/5 transition-colors ${!n.read ? 'bg-blue-900/10' : ''}`}>
                                                    <div className="flex gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                                            n.type === 'info' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/20' :
                                                            n.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-500/20' :
                                                            'bg-amber-900/30 text-amber-400 border border-amber-500/20'
                                                        }`}>
                                                            <i className={`fas ${
                                                                n.type === 'info' ? 'fa-info' :
                                                                n.type === 'success' ? 'fa-check' : 'fa-exclamation'
                                                            } text-xs`}></i>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className={`text-sm ${!n.read ? 'font-bold text-white' : 'font-semibold text-slate-300'}`}>{n.title}</h4>
                                                            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                                                            <span className="text-[10px] text-slate-500 mt-2 block">{n.time}</span>
                                                        </div>
                                                        {!n.read && (
                                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
                
                <button className="w-10 h-10 rounded-full bg-[#0B1120] border border-white/5 text-slate-400 hover:text-white hover:border-white/20 flex items-center justify-center transition-all shadow-sm">
                    <i className="fas fa-question-circle"></i>
                </button>
            </div>
        </header>
    );
};
