
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard'; 
import { PartnerDashboard } from './components/PartnerDashboard'; 
import { RecruiterDashboard } from './components/RecruiterDashboard'; 
import { RequestsView } from './components/RequestsView'; 
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
import { TutorialOverlay } from './components/TutorialOverlay';
import { AppView, UserRole, Request, Candidate, Submission, Notification, Activity, Conversation, RequestComment, UserAccount } from './types';
import { storageService } from './services/storageService';
import { Analytics } from './components/Analytics';
import { AIToolkit } from './components/AIToolkit';
import { MediaStudio } from './components/MediaStudio';
import { AdminAdvancedTools } from './components/AdminAdvancedTools';
import { MOCK_USERS } from './constants';

const App: React.FC = () => {
    // Auth & Identity State
    const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => storageService.load('session_user', null));
    const [allUsers, setAllUsers] = useState<UserAccount[]>(() => storageService.load('all_users', MOCK_USERS));
    
    // View Management
    const [currentView, setView] = useState<AppView>(() => storageService.load('session_view', AppView.LANDING));
    const [selectedRequestId, setSelectedRequestId] = useState<number | string | null>(() => storageService.load('session_request_id', null));
    const [theme, setTheme] = useState<'light' | 'dark'>(() => storageService.load('theme', 'dark')); 

    // Auto-save Status State
    const [isSaving, setIsSaving] = useState(false);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Dynamic Transactional State
    const [requests, setRequests] = useState<Request[]>(() => storageService.load('requests', []));
    const [candidates, setCandidates] = useState<Candidate[]>(() => storageService.load('candidates', [])); 
    const [submissions, setSubmissions] = useState<Submission[]>(() => storageService.load('submissions', []));
    const [activities, setActivities] = useState<Activity[]>(() => storageService.load('activities', []));
    const [conversations, setConversations] = useState<Conversation[]>(() => storageService.load('conversations', []));
    const [requestComments, setRequestComments] = useState<RequestComment[]>(() => storageService.load('comments', []));
    
    const [notifications] = useState<Notification[]>([
        { id: '1', title: 'Security Protocol', message: 'Credential-based login is now active.', time: 'Just now', read: false, type: 'info', recipient: 'all' }
    ]);

    // Theme Effect
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        storageService.save('theme', theme);
    }, [theme]);

    // Enhanced Global Auto-Save Effect
    const triggerSave = useCallback((key: string, data: any) => {
        setIsSaving(true);
        storageService.save(key, data);
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => setIsSaving(false), 800);
    }, []);

    // Individual Persistence Hooks
    useEffect(() => { triggerSave('requests', requests); }, [requests, triggerSave]);
    useEffect(() => { triggerSave('candidates', candidates); }, [candidates, triggerSave]);
    useEffect(() => { triggerSave('submissions', submissions); }, [submissions, triggerSave]);
    useEffect(() => { triggerSave('activities', activities); }, [activities, triggerSave]);
    useEffect(() => { triggerSave('all_users', allUsers); }, [allUsers, triggerSave]);
    
    // Session Persistent Hooks
    useEffect(() => { triggerSave('session_view', currentView); }, [currentView, triggerSave]);
    useEffect(() => { triggerSave('session_user', currentUser); }, [currentUser, triggerSave]);
    useEffect(() => { triggerSave('session_request_id', selectedRequestId); }, [selectedRequestId, triggerSave]);

    const logActivity = (title: string, description: string, type: Activity['type'] = 'info') => {
        const newAct: Activity = {
            id: Date.now().toString(),
            type,
            title,
            description,
            time: new Date().toLocaleTimeString(),
            user: currentUser?.name || 'System'
        };
        setActivities(prev => [newAct, ...prev.slice(0, 49)]);
    };

    const handleLogin = (user: UserAccount) => {
        setCurrentUser(user);
        const targetView = user.role === UserRole.PARTNER 
            ? AppView.PARTNER_DASHBOARD 
            : AppView.DASHBOARD;
        setView(targetView);
        logActivity('Login Success', `User ${user.email} authenticated.`, 'info');
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setView(AppView.LANDING);
        storageService.save('session_user', null);
        storageService.save('session_view', AppView.LANDING);
    };

    const handleAddRequest = (newRequest: Request) => {
        setRequests(prev => [newRequest, ...prev]);
        logActivity('New Request Created', `${newRequest.title}`, 'request');
    };

    const handleUpdateRequest = (id: number | string, updates: Partial<Request>) => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
        logActivity('Request Updated', `Request #${id} was modified.`, 'request');
    };

    const handleAddCandidate = (candidateData: Partial<Candidate>) => {
        const newCand: Candidate = {
            id: Date.now(),
            name: candidateData.name || 'Anonymous',
            email: candidateData.email || '',
            role: candidateData.role || 'Unspecified',
            phone: candidateData.phone || '',
            experience: candidateData.experience || '',
            re5: candidateData.re5 || 'none',
            status: candidateData.status || 'new',
            rating: candidateData.rating || 0,
            matchScore: candidateData.matchScore || 0,
            avatarInitials: candidateData.avatarInitials || '?',
            priority: candidateData.priority || 'medium',
            source: candidateData.source || 'Manual Entry',
            ...candidateData
        } as Candidate;
        
        setCandidates(prev => [newCand, ...prev]);
        logActivity('Candidate Registered', `${newCand.name} added to database.`, 'candidate');

        if (newCand.requestId) {
            const newSub: Submission = {
                id: `SUB-${Date.now()}`,
                requestId: newCand.requestId,
                candidateName: newCand.name,
                candidateEmail: newCand.email,
                submittedDate: new Date().toISOString().split('T')[0],
                status: 'Submitted',
                matchScore: newCand.matchScore,
            };
            setSubmissions(prev => [newSub, ...prev]);
        }
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
            phone: details.phone || 'N/A',
            experience: details.experience || 'N/A',
            re5: details.re5 || 'pending',
            status: 'new',
            rating: 0,
            matchScore: newSub.matchScore,
            avatarInitials: submission.candidateName!.substring(0, 2).toUpperCase(),
            source: 'Recruiter Hub',
            ...details
        } as Candidate;
        setCandidates(prev => [newCand, ...prev]);
        logActivity('Candidate Submitted', `${newCand.name} for role #${submission.requestId}`, 'candidate');
    };

    const renderContent = () => {
        if (!currentUser) return null;

        const role = currentUser.role;

        if (role === UserRole.PARTNER && [AppView.PARTNER_DASHBOARD, AppView.ADMIN_SECURITY, AppView.ADMIN_COSTS, AppView.ADMIN_USERS, AppView.ADMIN_CLIENTS, AppView.ADMIN_ENGAGEMENT, AppView.ADMIN_PERFORMANCE].includes(currentView)) {
            return <PartnerDashboard 
                setView={setView} 
                currentView={currentView} 
                onSelectRequest={setSelectedRequestId} 
                requests={requests} 
                candidates={candidates}
                submissions={submissions} 
                activities={activities}
                // Admin Management Passthrough
                allUsers={allUsers}
                setAllUsers={setAllUsers}
            />;
        }
        
        if (role === UserRole.PARTNER && currentView === AppView.ADMIN_TOOLS) return <AdminAdvancedTools />;

        switch (currentView) {
            case AppView.DASHBOARD: 
                return role === UserRole.RECRUITER 
                    ? <RecruiterDashboard requests={requests} candidates={candidates} activities={activities} />
                    : <Dashboard setView={setView} requests={requests} candidates={candidates} onAddRequest={handleAddRequest} activities={activities} />;
            case AppView.REQUESTS:
                return <RequestsView requests={requests} onAddRequest={handleAddRequest} onSelectRequest={(id) => { setSelectedRequestId(id); setView(AppView.REQUEST_DETAIL); }} userRole={role} onDeleteRequest={(id) => setRequests(prev => prev.filter(r => r.id !== id))} />;
            case AppView.PIPELINE: return <KanbanBoard candidates={candidates} onStatusChange={(id, status) => setCandidates(prev => prev.map(c => c.id === id ? {...c, status} : c))} />;
            case AppView.CANDIDATES_DATABASE: return <CandidateDatabase candidates={candidates} requests={requests} onAddCandidate={handleAddCandidate} onUpdateCandidate={(id, up) => setCandidates(prev => prev.map(c => c.id === id ? {...c, ...up} : c))} />;
            case AppView.TALENT_POOL: return <TalentPool requests={requests} />;
            case AppView.REQUEST_DETAIL: return (
                <RequestDetail 
                    requestId={selectedRequestId!} 
                    onBack={() => setView(AppView.REQUESTS)}
                    requests={requests}
                    submissions={submissions}
                    candidates={candidates}
                    onCandidateSubmit={handleCandidateSubmit}
                    userRole={role}
                    comments={requestComments.filter(c => c.requestId === selectedRequestId)}
                    onAddComment={(text) => setRequestComments(prev => [...prev, {id: Date.now().toString(), requestId: selectedRequestId!, author: currentUser.name, text, timestamp: 'Now', role: role}])}
                    onUpdateRequest={handleUpdateRequest}
                    onDeleteRequest={(id) => { setRequests(prev => prev.filter(r => r.id !== id)); setView(AppView.REQUESTS); }}
                />
            );
            case AppView.COMMUNICATIONS: return <Communications conversations={conversations} onSendMessage={(id, text) => setConversations(prev => prev.map(c => c.id === id ? { ...c, messages: [...c.messages, {id: Date.now().toString(), text, time: 'Now', sent: true}] } : c))} />;
            case AppView.CALENDAR: return <Calendar />;
            case AppView.INTERVIEW_COPILOT: return <InterviewCopilot userRole={role} />;
            case AppView.MEDIA_STUDIO: return <MediaStudio />;
            case AppView.AI_TOOLKIT: return <AIToolkit candidates={candidates} requests={requests} />;
            case AppView.ANALYTICS: return <Analytics requests={requests} candidates={candidates} />;
            default: return <Dashboard setView={setView} requests={requests} candidates={candidates} onAddRequest={handleAddRequest} activities={activities} />;
        }
    };

    if (!currentUser || currentView === AppView.LANDING) {
        return <LandingPage users={allUsers} onLogin={handleLogin} />;
    }

    return (
        <div className="h-screen w-screen overflow-hidden bg-[#030712] flex flex-col font-sans transition-colors duration-300">
            <div className="flex flex-1 overflow-hidden h-full">
                <Sidebar 
                    currentView={currentView} 
                    setView={setView} 
                    userRole={currentUser.role} 
                    onLogout={handleLogout} 
                    setUserRole={() => {}}
                />
                <div className="flex-1 flex flex-col h-full min-w-0 bg-[#030712] relative transition-colors duration-300 dark:bg-[#030712] bg-slate-50">
                    <Header 
                        userRole={currentUser.role} 
                        setUserRole={() => {}} 
                        theme={theme} 
                        toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} 
                        notifications={notifications} 
                        currentView={currentView} 
                        isSaving={isSaving}
                    />
                    <main className="flex-1 overflow-hidden relative">{renderContent()}</main>
                </div>
            </div>
            <AIChatBot />
            <TutorialOverlay />
        </div>
    );
};

export default App;
