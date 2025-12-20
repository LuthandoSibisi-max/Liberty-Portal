
import { Candidate, Request, CalendarEvent, Conversation, Submission, Activity, TalentProfile, UserRole, Client, FeatureRequest, AuditLogEntry } from './types';

// THE TALENT POOL - Preserved as requested as it represents the static database asset
export const MOCK_TALENT_POOL: TalentProfile[] = [
    {
        id: 'TP-1',
        name: "Aysha Moodley",
        headline: "Control Room Manager - Investment Compliance Advisory",
        currentCompany: "Absa Group",
        location: "Johannesburg",
        linkedInUrl: "https://www.linkedin.com/in/aysha-moodley-4578882b",
        status: 'Matched',
        matchScore: 93, 
        aiMatchReason: "High Match: 5+ years exp in Investment Compliance. Strong fit for regulatory requirements.",
        lastContacted: "2023-10-25"
    },
    {
        id: 'TP-2',
        name: "Thando Nyembe",
        headline: "AML/ CFT Risk manager- Wealth Management Division",
        currentCompany: "Nedbank",
        location: "Johannesburg",
        linkedInUrl: "https://www.linkedin.com/in/thando-nyembe-1182a566",
        status: 'Matched',
        matchScore: 93,
        aiMatchReason: "High Match: Wealth Management Risk specialist. 5+ years experience."
    },
    {
        id: 'TP-3',
        name: "Vladislav Sita CA(SA)",
        headline: "Senior Credit Analyst | Corporate & Investment Banking",
        currentCompany: "Investec",
        location: "Johannesburg",
        linkedInUrl: "https://www.linkedin.com/in/vladislav-sita-ca-sa-275058102",
        status: 'Matched',
        matchScore: 91,
        aiMatchReason: "High Match: CA(SA) with Corporate Investment Banking background."
    },
    {
        id: 'TP-4',
        name: "Thembisa Ntshinga",
        headline: "Accredited Financial advisor",
        currentCompany: "Old Mutual South Africa",
        location: "Johannesburg",
        linkedInUrl: "https://www.linkedin.com/in/thembisa-ntshinga-964425b8",
        status: 'Matched',
        matchScore: 90,
        aiMatchReason: "Direct Match: Accredited Financial Advisor with 3+ years experience."
    }
];

// --- TRANSACTIONAL DATA - CLEARED FOR CLEAN SLATE ---

export const MOCK_CLIENTS: Client[] = [
    {
        id: 'cli-001',
        name: 'Liberty Group',
        industry: 'Financial Services',
        tier: 'Enterprise',
        users: 1,
        status: 'Active',
        accountManager: 'Luthando Sibisi',
        primaryColor: '#003366',
        revenue: 'R 0.00',
        health: {
            score: 100,
            sentiment: 'Positive',
            lastActive: 'Just now',
            openRoles: 0,
            placementsYTD: 0
        },
        notes: []
    }
];

export const MOCK_FEATURE_REQUESTS: FeatureRequest[] = [];
export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [];
export const MOCK_REQUESTS: Request[] = [];
export const MOCK_CANDIDATES: Candidate[] = [];
export const MOCK_SUBMISSIONS: Submission[] = [];
export const MOCK_ACTIVITIES: Activity[] = [];
export const MOCK_EVENTS: CalendarEvent[] = [];
export const MOCK_CONVERSATIONS: Conversation[] = [];
