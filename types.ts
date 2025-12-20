
export enum AppView {
    LANDING = 'landing',
    DASHBOARD = 'dashboard',
    PIPELINE = 'pipeline',
    CANDIDATES_DATABASE = 'candidates_database',
    TALENT_POOL = 'talent_pool', // New View
    REQUESTS = 'requests',
    REQUEST_DETAIL = 'request_detail',
    CALENDAR = 'calendar',
    COMMUNICATIONS = 'communications',
    PARTNER_DASHBOARD = 'partner_dashboard',
    INTERVIEW_COPILOT = 'interview_copilot',
    ANALYTICS = 'analytics',
    AI_TOOLKIT = 'ai_toolkit',
    MEDIA_STUDIO = 'media_studio',
    // Admin Specific Views
    ADMIN_SECURITY = 'admin_security',
    ADMIN_COSTS = 'admin_costs',
    ADMIN_USERS = 'admin_users',
    ADMIN_CLIENTS = 'admin_clients',
    ADMIN_ENGAGEMENT = 'admin_engagement',
    ADMIN_PERFORMANCE = 'admin_performance'
}

export enum UserRole {
    LIBERTY = 'liberty',
    PARTNER = 'partner', // Admin
    RECRUITER = 'recruiter' // Internal MNO Recruiter
}

export interface Review {
    id: string;
// ... (rest of file remains unchanged, ensure other interfaces are preserved)
    reviewer: string;
    date: string;
    rating: number;
    comment: string;
}

export interface HistoryEvent {
    id: string;
    action: string;
    date: string;
    description?: string;
}

export interface Note {
    id: string;
    author: string;
    date: string;
    text: string;
}

export interface Candidate {
    id: number;
    requestId?: number | string; // Linked Request
    name: string;
    role: string;
    email: string;
    phone: string;
    experience: string;
    re5: 'certified' | 'pending' | 'none';
    isRE5Certified?: boolean; // New boolean field
    status: 'new' | 'screen' | 'shortlist' | 'interview' | 'offer' | 'hired' | 'rejected' | 'sourced';
    rating: number;
    matchScore: number;
    avatarInitials: string;
    history?: HistoryEvent[];
    reviews?: Review[];
    notes?: Note[];
    priority?: 'high' | 'medium' | 'low';
    source?: string;
    sourceId?: string; // ID of the partner who submitted (e.g., 'MNO')
    skills?: string[];
    // Extended Details for Screening
    currentCompany?: string;
    noticePeriod?: string;
    salaryExpectation?: string;
    cvText?: string;
    aiAnalysis?: string; // Stores JSON string of analysis
    submissionNotes?: string; // Notes from the partner
    lastContacted?: string; // New field for tracking outreach date
}

// New Interface for Passive Talent (LinkedIn Followers)
export interface TalentProfile {
    id: string;
    name: string;
    headline: string; // "Senior FA at Momentum | Wealth Manager"
    currentCompany: string;
    location: string;
    linkedInUrl: string;
    status: 'Pool' | 'Matched' | 'Contacted' | 'Converted' | 'Not Interested' | 'Uninterested';
    aiMatchReason?: string;
    matchScore?: number;
    matchedRequestId?: number | string;
    lastContacted?: string;
}

export interface Request {
    id: number | string;
    title: string;
    department: string;
    location: string;
    status: 'open' | 'filled' | 'closed' | 'new' | 'in-progress' | 'on-hold';
    urgency: 'high' | 'medium' | 'low';
    candidatesCount: number;
    postedDate: string;
    description?: string;
    requirements?: string; // Specific field for generated requirements
    skills?: string[];
    salaryRange?: string;
    createdBy?: string;
    assignedTo?: string; // e.g., 'MNO'
    partnerNotes?: string;
    targetHires?: number;
    re5Requirement?: 'required' | 'preferred' | 'not_required';
    clientId?: string; // To link request to specific client
}

export interface RequestComment {
    id: string;
    requestId: number | string;
    author: string;
    text: string;
    timestamp: string;
    role: UserRole;
}

export interface Submission {
    id: string;
    requestId: number | string;
    candidateName: string;
    candidateEmail: string;
    submittedDate: string;
    status: 'Submitted' | 'Shortlisted' | 'Interview' | 'Hired' | 'Rejected';
    matchScore: number;
}

export interface Activity {
    id: string;
    type: 'request' | 'candidate' | 'partner' | 'status' | 'interview' | 'info';
    title: string;
    description: string;
    time: string;
    user?: string;
    clientId?: string; // For Admin filtering
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: Date;
    isThinking?: boolean;
    sources?: Array<{uri: string, title: string}>;
}

export interface CalendarEvent {
    id: number;
    title: string;
    date: string; // YYYY-MM-DD
    time: string;
    type: 'interview' | 'meeting' | 'deadline';
    candidateName?: string;
}

export interface Conversation {
    id: number;
    name: string;
    role: string;
    lastMessage: string;
    time: string;
    unread: boolean;
    avatar: string;
    messages: Array<{
        id: string;
        text: string;
        time: string;
        sent: boolean;
    }>;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'info' | 'success' | 'warning' | 'error';
    recipient: 'all' | 'liberty' | 'partner' | 'recruiter'; // Role-based targeting
}

// ADMIN SPECIFIC TYPES
export interface ClientHealth {
    score: number; // 0-100
    sentiment: 'Positive' | 'Neutral' | 'Risk';
    lastActive: string;
    openRoles: number;
    placementsYTD: number;
}

export interface Client {
    id: string;
    name: string;
    logo?: string;
    primaryColor: string;
    industry: string;
    tier: 'Enterprise' | 'Professional' | 'Standard';
    users: number;
    status: 'Active' | 'Onboarding' | 'Churned';
    accountManager: string;
    health: ClientHealth;
    revenue: string; // Monthly Revenue
    notes?: Note[]; // CRM notes for admin
}

export interface FeatureRequest {
    id: string;
    clientId: string;
    clientName: string;
    title: string;
    description: string;
    status: 'New' | 'In Review' | 'Planned' | 'In Progress' | 'Completed';
    votes: number;
    date: string;
}

// SECURITY & MONITORING TYPES
export interface AuditLogEntry {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    resource: string;
    ip: string;
    status: 'Success' | 'Failed' | 'Warning';
    details?: string;
}

export interface SecurityConfig {
    require2FA: boolean;
    passwordRotation: number; // days
    ipWhitelistEnabled: boolean;
    sessionTimeout: number; // minutes
    ssoEnabled: boolean;
}
