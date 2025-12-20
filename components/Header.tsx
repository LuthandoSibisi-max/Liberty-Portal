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
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-8 py-4 flex justify-end items-center border-b border-slate-200/60 dark:border-slate-800 transition-colors duration-300">
            {/* Page Title removed as per request to avoid duplication with content headers */}

            <div className="flex items-center gap-4">
                <div className="relative hidden md:block group">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-liberty-blue dark:group-focus-within:text-blue-400 transition-colors"></i>
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsSearching(true)}
                        onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                        placeholder={isMNO ? "Search all clients, talent..." : "Search my requests..."}
                        className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-800 border focus:border-liberty-blue/20 dark:focus:border-blue-500/30 rounded-xl text-sm focus:ring-4 focus:ring-liberty-blue/10 dark:focus:ring-blue-500/10 outline-none w-72 transition-all text-slate-800 dark:text-white placeholder:text-slate-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">⌘K</span>

                    {/* Search Results Dropdown */}
                    {isSearching && searchTerm.length >= 2 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-fade-in-up">
                            {searchResults.length > 0 ? (
                                <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-700">
                                    {searchResults.map((res: any, idx) => (
                                        <div key={idx} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer flex items-center gap-3 transition-colors">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                                                res.type === 'candidate' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' :
                                                res.type === 'request' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600' :
                                                'bg-green-50 dark:bg-green-900/30 text-green-600'
                                            }`}>
                                                <i className={`fas ${
                                                    res.type === 'candidate' ? 'fa-user' :
                                                    res.type === 'request' ? 'fa-briefcase' :
                                                    'fa-comment-alt'
                                                }`}></i>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-slate-800 dark:text-white text-sm truncate">{res.name}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                    {res.type === 'candidate' ? res.role : res.type === 'request' ? res.department : res.lastMessage}
                                                </div>
                                            </div>
                                            <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{res.type}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">No results found</div>
                            )}
                        </div>
                    )}
                </div>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

                <button 
                    onClick={toggleTheme}
                    className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-yellow-500 dark:hover:text-yellow-400 hover:border-yellow-500/30 dark:hover:border-yellow-400/30 flex items-center justify-center transition-all shadow-sm"
                    title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
                >
                    <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
                </button>

                <div className="relative">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-liberty-blue dark:hover:text-blue-400 hover:border-liberty-blue/30 dark:hover:border-blue-400/30 flex items-center justify-center transition-all relative shadow-sm"
                    >
                        <i className="fas fa-bell"></i>
                        {unreadCount > 0 && (
                            <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-800 animate-pulse"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <>
                            <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setShowNotifications(false)}
                            ></div>
                            <div className="absolute right-0 top-full mt-3 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-fade-in-up origin-top-right">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/80 backdrop-blur-sm">
                                    <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button 
                                            className="text-xs font-bold text-liberty-blue dark:text-blue-400 hover:underline"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {filteredNotifications.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400 text-sm">No new notifications</div>
                                    ) : (
                                        <div className="divide-y divide-slate-50 dark:divide-slate-700">
                                            {filteredNotifications.map(n => (
                                                <div key={n.id} className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                                    <div className="flex gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                                            n.type === 'info' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' :
                                                            n.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' :
                                                            'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400'
                                                        }`}>
                                                            <i className={`fas ${
                                                                n.type === 'info' ? 'fa-info' :
                                                                n.type === 'success' ? 'fa-check' : 'fa-exclamation'
                                                            } text-xs`}></i>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className={`text-sm ${!n.read ? 'font-bold text-slate-800 dark:text-white' : 'font-semibold text-slate-600 dark:text-slate-300'}`}>{n.title}</h4>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 block">{n.time}</span>
                                                        </div>
                                                        {!n.read && (
                                                            <div className="w-2 h-2 rounded-full bg-liberty-blue dark:bg-blue-400 mt-2"></div>
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
                
                <button className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-liberty-blue dark:hover:text-blue-400 hover:border-liberty-blue/30 dark:hover:border-blue-400/30 flex items-center justify-center transition-all shadow-sm">
                    <i className="fas fa-question-circle"></i>
                </button>
            </div>
        </header>
    );
};