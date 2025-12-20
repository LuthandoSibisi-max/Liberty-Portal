
import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PartnerDashboard } from './components/PartnerDashboard';
import { KanbanBoard } from './components/KanbanBoard';
import { CandidateDatabase } from './components/CandidateDatabase';
import { Calendar } from './components/Calendar';
import { Communications } from './components/Communications';
import { AIChatBot } from './components/AIChatBot';
import { RequestDetail } from './components/RequestDetail';
import { InterviewCopilot } from './components/InterviewCopilot';
import { LandingPage } from './components/LandingPage';
import { TalentPool } from './components/TalentPool';
import { RequestWizard } from './components/RequestWizard';
import { MOCK_CONVERSATIONS } from './constants';
import { AppView, UserRole, Request, Candidate, Submission, Notification, Activity, Conversation, RequestComment } from './types';
import { storageService } from './services/storageService';

// Lazy Load heavy components
const Analytics = React.lazy(() => import('./components/Analytics').then(module => ({ default: module.Analytics })));
const AIToolkit = React.lazy(() => import('./components/AIToolkit').then(module => ({ default: module.AIToolkit })));
const MediaStudio = React.lazy(() => import('./components/MediaStudio').then(module => ({ default: module.MediaStudio })));

const App: React.FC = () => {
    const [currentView, setView] = useState<AppView>(AppView.LANDING);
    const [userRole, setUserRole] = useState<UserRole>(UserRole.PARTNER);
    const [selectedRequestId, setSelectedRequestId] = useState<number | string | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // State Initialization - Defaulting to EMPTY lists for a clean start
    const [requests, setRequests] = useState<Request[]>(() => storageService.load('requests', []));
    const [candidates, setCandidates] = useState<Candidate[]>(() => storageService.load('candidates', [])); 
    const [submissions, setSubmissions] = useState<Submission[]>(() => storageService.load('submissions', []));
    const [activities, setActivities] = useState<Activity[]>(() => storageService.load('activities', []));
    const [conversations, setConversations] = useState<Conversation[]>(() => storageService.load('conversations', []));
    const [requestComments, setRequestComments] = useState<RequestComment[]>(() => storageService.load('comments', []));
    
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: '1', title: 'System Initialized', message: 'Ready for new recruitment searches.', time: 'Just now', read: false, type: 'success', recipient: 'all' }
    ]);

    const [mediaPrompt, setMediaPrompt] = useState<string>('');

    // Persistence Hooks
    useEffect(() => { storageService.save('requests', requests); }, [requests]);
    useEffect(() => { storageService.save('candidates', candidates); }, [candidates]);
    useEffect(() => { storageService.save('submissions', submissions); }, [submissions]);
    useEffect(() => { storageService.save('activities', activities); }, [activities]);
    useEffect(() => { storageService.save('conversations', conversations); }, [conversations]);
    useEffect(() => { storageService.save('comments', requestComments); }, [requestComments]);

    // System Purge
    const handlePurgeAllData = useCallback(() => {
        if (confirm("This will permanently delete ALL active requests, candidates, and submissions to give you a clean slate. The Talent Pool will remain. Continue?")) {
            setRequests([]);
            setCandidates([]);
            setSubmissions([]);
            setActivities([]);
            setRequestComments([]);
            setConversations([]);
            storageService.clearAll(); 
            window.location.reload(); 
        }
    }, []);

    // Auth & View Handlers
    const handleLogin = (role: UserRole) => {
        setUserRole(role);
        setView(role === UserRole.PARTNER ? AppView.PARTNER_DASHBOARD : AppView.DASHBOARD);
    };

    const handleLogout = () => setView(AppView.LANDING);
    const handleRequestSelect = (id: number | string) => {
        setSelectedRequestId(id);
        setView(AppView.REQUEST_DETAIL);
    };

    const handleAddRequest = (newRequest: Request) => {
        setRequests(prev => [newRequest, ...prev]);
        setActivities(prev => [{
            id: Date.now().toString(),
            type: 'request',
            title: 'New Request Created',
            description: `${newRequest.title}`,
            time: 'Just now',
            user: userRole === UserRole.LIBERTY ? 'Liberty Manager' : 'Admin'
        }, ...prev]);
    };

    const handleDeleteRequest = (id: number | string) => {
        setRequests(prev => prev.filter(r => r.id !== id));
        setCandidates(prev => prev.filter(c => c.requestId !== id));
        setView(userRole === UserRole.PARTNER ? AppView.PARTNER_DASHBOARD : AppView.REQUESTS);
    };

    const handleUpdateCandidate = (id: number, updates: Partial<Candidate>) => {
        setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const handleCandidateSubmit = (submission: Partial<Submission>, details: Partial<Candidate>) => {
        const newSub: Submission = {
            id: `SUB-${Date.now()}`,
            requestId: submission.requestId!,
            candidateName: submission.candidateName!,
            candidateEmail: submission.candidateEmail!,
            submittedDate: new Date().toISOString().split('T')[0],
            status: 'Submitted',
            matchScore: submission.matchScore || 85, 
        };
        setSubmissions(prev => [newSub, ...prev]);

        const newCand: Candidate = {
            id: Date.now(),
            requestId: submission.requestId,
            name: submission.candidateName!,
            email: submission.candidateEmail!,
            role: requests.find(r => r.id === submission.requestId)?.title || 'Financial Advisor',
            phone: details.phone || 'Pending',
            experience: details.experience || 'Not specified',
            re5: details.re5 || 'pending',
            status: 'new',
            rating: 0,
            matchScore: newSub.matchScore,
            avatarInitials: submission.candidateName!.substring(0, 2).toUpperCase(),
            priority: 'medium',
            source: 'MNO Partner',
            ...details
        };
        setCandidates(prev => [newCand, ...prev]);
        setRequests(prev => prev.map(r => r.id === submission.requestId ? { ...r, candidatesCount: (r.candidatesCount || 0) + 1 } : r));
    };

    const renderContent = () => {
        if (userRole === UserRole.PARTNER && [AppView.PARTNER_DASHBOARD, AppView.ADMIN_SECURITY, AppView.ADMIN_COSTS, AppView.ADMIN_USERS, AppView.ADMIN_CLIENTS, AppView.ADMIN_ENGAGEMENT, AppView.ADMIN_PERFORMANCE].includes(currentView)) {
            return <PartnerDashboard setView={setView} currentView={currentView} onSelectRequest={handleRequestSelect} requests={requests} submissions={submissions} />;
        }

        switch (currentView) {
            case AppView.DASHBOARD: return <Dashboard setView={setView} requests={requests} candidates={candidates} onAddRequest={handleAddRequest} activities={activities} />;
            case AppView.PIPELINE: return <KanbanBoard candidates={candidates} onStatusChange={(id, status) => setCandidates(prev => prev.map(c => c.id === id ? {...c, status} : c))} />;
            case AppView.CANDIDATES_DATABASE: return <CandidateDatabase candidates={candidates} requests={requests} onUpdateCandidate={handleUpdateCandidate} onAddCandidate={(c) => setCandidates(prev => [...prev, { ...c, id: Date.now(), status: 'new', rating: 0, matchScore: 0, avatarInitials: '??', re5: 'pending' } as Candidate])} />;
            case AppView.TALENT_POOL: return <TalentPool requests={requests} />;
            case AppView.REQUEST_DETAIL: return (
                <RequestDetail 
                    requestId={selectedRequestId!} 
                    onBack={() => setView(userRole === UserRole.PARTNER ? AppView.PARTNER_DASHBOARD : AppView.REQUESTS)}
                    requests={requests}
                    submissions={submissions}
                    candidates={candidates}
                    onCandidateSubmit={handleCandidateSubmit}
                    userRole={userRole}
                    comments={requestComments.filter(c => c.requestId === selectedRequestId)}
                    onAddComment={(text) => setRequestComments(prev => [...prev, {id: Date.now().toString(), requestId: selectedRequestId!, author: 'User', text, timestamp: 'Now', role: userRole}])}
                    onDeleteRequest={handleDeleteRequest}
                    onUpdateRequest={(id, up) => setRequests(prev => prev.map(r => r.id === id ? { ...r, ...up } : r))}
                />
            );
            case AppView.REQUESTS:
                return (
                    <div className="p-8 overflow-y-auto h-full animate-fade-in">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Active Requests</h2>
                                <p className="text-sm text-slate-500 mt-1">Manage ongoing recruitment searches for your clients.</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={handlePurgeAllData} className="px-4 py-2 border border-red-100 text-red-500 text-xs font-bold rounded-xl hover:bg-red-50 transition-colors">
                                    <i className="fas fa-trash-alt mr-2"></i> Purge All Deals
                                </button>
                                <button onClick={() => setView(AppView.DASHBOARD)} className="px-6 py-2 bg-liberty-blue text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20">
                                    <i className="fas fa-plus mr-2"></i> New Request
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {requests.map(req => (
                                <div key={req.id} onClick={() => handleRequestSelect(req.id)} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-xl transition-all group hover:-translate-y-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-lg uppercase border border-blue-100 dark:border-blue-800">{req.status}</span>
                                        <i className="fas fa-arrow-right text-slate-300 group-hover:text-blue-500 transition-colors"></i>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2 leading-tight">{req.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <i className="fas fa-map-marker-alt"></i> {req.location}
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <i className="fas fa-users"></i> {req.candidatesCount || 0}
                                    </div>
                                </div>
                            ))}
                            {requests.length === 0 && (
                                <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/30">
                                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
                                        <i className="fas fa-folder-open text-3xl text-slate-300"></i>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No active searches</h3>
                                    <p className="text-slate-400 max-w-xs mx-auto mt-2">The system is currently empty. Use the 'New Request' button to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case AppView.COMMUNICATIONS: return <Communications conversations={conversations} onSendMessage={(id, text) => setConversations(prev => prev.map(c => c.id === id ? { ...c, messages: [...c.messages, {id: Date.now().toString(), text, time: 'Now', sent: true}] } : c))} />;
            case AppView.CALENDAR: return <Calendar />;
            case AppView.INTERVIEW_COPILOT: return <InterviewCopilot userRole={userRole} />;
            case AppView.MEDIA_STUDIO: return <Suspense fallback={<div>Loading...</div>}><MediaStudio initialPrompt={mediaPrompt} /></Suspense>;
            default: return <Dashboard setView={setView} requests={requests} candidates={candidates} onAddRequest={handleAddRequest} activities={activities} />;
        }
    };

    if (currentView === AppView.LANDING) return <LandingPage onLogin={handleLogin} />;

    return (
        <div className={`h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300 ${userRole === UserRole.PARTNER ? 'theme-partner' : 'theme-liberty'}`}>
            <div className="flex flex-1 overflow-hidden h-full">
                <Sidebar currentView={currentView} setView={setView} userRole={userRole} setUserRole={setUserRole} onLogout={handleLogout} />
                <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-50/50 dark:bg-slate-900/50 relative">
                    <Header userRole={userRole} setUserRole={setUserRole} theme={theme} toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} notifications={notifications} currentView={currentView} />
                    <main className="flex-1 overflow-hidden relative">{renderContent()}</main>
                </div>
            </div>
            <AIChatBot />
        </div>
    );
};

export default App;
