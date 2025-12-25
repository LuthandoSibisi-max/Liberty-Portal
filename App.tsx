
import React, { useState, useEffect, useCallback } from 'react';
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
import { AppView, UserRole, Request, Candidate, Submission, Notification, Activity, Conversation, RequestComment } from './types';
import { storageService } from './services/storageService';
import { Analytics } from './components/Analytics';
import { AIToolkit } from './components/AIToolkit';
import { MediaStudio } from './components/MediaStudio';
import { AdminAdvancedTools } from './components/AdminAdvancedTools';

const App: React.FC = () => {
    const [currentView, setView] = useState<AppView>(AppView.LANDING);
    const [userRole, setUserRole] = useState<UserRole>(UserRole.PARTNER);
    const [selectedRequestId, setSelectedRequestId] = useState<number | string | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark'); 

    // Optimized State Initialization
    const [requests, setRequests] = useState<Request[]>(() => storageService.load('requests', []));
    const [candidates, setCandidates] = useState<Candidate[]>(() => storageService.load('candidates', [])); 
    const [submissions, setSubmissions] = useState<Submission[]>(() => storageService.load('submissions', []));
    const [activities, setActivities] = useState<Activity[]>(() => storageService.load('activities', []));
    const [conversations, setConversations] = useState<Conversation[]>(() => storageService.load('conversations', []));
    const [requestComments, setRequestComments] = useState<RequestComment[]>(() => storageService.load('comments', []));
    
    const [notifications] = useState<Notification[]>([
        { id: '1', title: 'System Initialized', message: 'Platform V2 is ready for production.', time: 'Just now', read: false, type: 'success', recipient: 'all' }
    ]);

    // Persistence
    useEffect(() => { storageService.save('requests', requests); }, [requests]);
    useEffect(() => { storageService.save('candidates', candidates); }, [candidates]);
    useEffect(() => { storageService.save('submissions', submissions); }, [submissions]);
    useEffect(() => { storageService.save('activities', activities); }, [activities]);
    useEffect(() => { storageService.save('conversations', conversations); }, [conversations]);
    useEffect(() => { storageService.save('comments', requestComments); }, [requestComments]);

    const logActivity = (title: string, description: string, type: Activity['type'] = 'info') => {
        const newAct: Activity = {
            id: Date.now().toString(),
            type,
            title,
            description,
            time: new Date().toLocaleTimeString(),
            user: userRole === UserRole.LIBERTY ? 'Katlego (Liberty)' : 'Luthando (Admin)'
        };
        setActivities(prev => [newAct, ...prev.slice(0, 49)]);
    };

    const handleLogin = (role: UserRole) => {
        setUserRole(role);
        setView(role === UserRole.PARTNER ? AppView.PARTNER_DASHBOARD : AppView.DASHBOARD);
        logActivity('Login Detected', `Session initialized for ${role} role.`, 'info');
    };

    const handleAddRequest = (newRequest: Request) => {
        setRequests(prev => [newRequest, ...prev]);
        logActivity('New Request Created', `${newRequest.title}`, 'request');
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
        };
        setCandidates(prev => [newCand, ...prev]);
        logActivity('Candidate Submitted', `${newCand.name} for role #${submission.requestId}`, 'candidate');
    };

    const renderContent = () => {
        if (userRole === UserRole.PARTNER && [AppView.PARTNER_DASHBOARD, AppView.ADMIN_SECURITY, AppView.ADMIN_COSTS, AppView.ADMIN_USERS, AppView.ADMIN_CLIENTS, AppView.ADMIN_ENGAGEMENT, AppView.ADMIN_PERFORMANCE].includes(currentView)) {
            return <PartnerDashboard 
                setView={setView} 
                currentView={currentView} 
                onSelectRequest={setSelectedRequestId} 
                requests={requests} 
                candidates={candidates}
                submissions={submissions} 
                activities={activities} 
            />;
        }
        
        if (userRole === UserRole.PARTNER && currentView === AppView.ADMIN_TOOLS) return <AdminAdvancedTools />;

        switch (currentView) {
            case AppView.DASHBOARD: 
                return userRole === UserRole.RECRUITER 
                    ? <RecruiterDashboard requests={requests} candidates={candidates} activities={activities} />
                    : <Dashboard setView={setView} requests={requests} candidates={candidates} onAddRequest={handleAddRequest} activities={activities} />;
            case AppView.REQUESTS:
                return <RequestsView requests={requests} onAddRequest={handleAddRequest} onSelectRequest={(id) => { setSelectedRequestId(id); setView(AppView.REQUEST_DETAIL); }} userRole={userRole} onDeleteRequest={(id) => setRequests(prev => prev.filter(r => r.id !== id))} />;
            case AppView.PIPELINE: return <KanbanBoard candidates={candidates} onStatusChange={(id, status) => setCandidates(prev => prev.map(c => c.id === id ? {...c, status} : c))} />;
            case AppView.CANDIDATES_DATABASE: return <CandidateDatabase candidates={candidates} requests={requests} onUpdateCandidate={(id, up) => setCandidates(prev => prev.map(c => c.id === id ? {...c, ...up} : c))} />;
            case AppView.TALENT_POOL: return <TalentPool requests={requests} />;
            case AppView.REQUEST_DETAIL: return (
                <RequestDetail 
                    requestId={selectedRequestId!} 
                    onBack={() => setView(AppView.REQUESTS)}
                    requests={requests}
                    submissions={submissions}
                    candidates={candidates}
                    onCandidateSubmit={handleCandidateSubmit}
                    userRole={userRole}
                    comments={requestComments.filter(c => c.requestId === selectedRequestId)}
                    onAddComment={(text) => setRequestComments(prev => [...prev, {id: Date.now().toString(), requestId: selectedRequestId!, author: 'User', text, timestamp: 'Now', role: userRole}])}
                />
            );
            case AppView.COMMUNICATIONS: return <Communications conversations={conversations} onSendMessage={(id, text) => setConversations(prev => prev.map(c => c.id === id ? { ...c, messages: [...c.messages, {id: Date.now().toString(), text, time: 'Now', sent: true}] } : c))} />;
            case AppView.CALENDAR: return <Calendar />;
            case AppView.INTERVIEW_COPILOT: return <InterviewCopilot userRole={userRole} />;
            case AppView.MEDIA_STUDIO: return <MediaStudio />;
            case AppView.AI_TOOLKIT: return <AIToolkit candidates={candidates} requests={requests} />;
            case AppView.ANALYTICS: return <Analytics requests={requests} candidates={candidates} />;
            default: return <Dashboard setView={setView} requests={requests} candidates={candidates} onAddRequest={handleAddRequest} activities={activities} />;
        }
    };

    if (currentView === AppView.LANDING) return <LandingPage onLogin={handleLogin} />;

    return (
        <div className="h-screen w-screen overflow-hidden bg-[#030712] flex flex-col font-sans transition-colors duration-300">
            <div className="flex flex-1 overflow-hidden h-full">
                <Sidebar currentView={currentView} setView={setView} userRole={userRole} setUserRole={setUserRole} onLogout={() => setView(AppView.LANDING)} />
                <div className="flex-1 flex flex-col h-full min-w-0 bg-[#030712] relative">
                    <Header userRole={userRole} setUserRole={setUserRole} theme={theme} toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} notifications={notifications} currentView={currentView} />
                    <main className="flex-1 overflow-hidden relative">{renderContent()}</main>
                </div>
            </div>
            <AIChatBot />
            <TutorialOverlay />
        </div>
    );
};

export default App;
