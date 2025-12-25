
import { TalentProfile, UserRole, Client, UserAccount, SystemSettings } from './types';

// STATIC ASSETS - Preserved as the foundational network
export const MOCK_TALENT_POOL: TalentProfile[] = [
    {
        id: 'TP-1',
        name: "Aysha Moodley",
        headline: "Investment Compliance Advisory",
        currentCompany: "Absa Group",
        location: "Johannesburg",
        linkedInUrl: "https://www.linkedin.com/",
        status: 'Pool',
        matchScore: 0
    },
    {
        id: 'TP-2',
        name: "Thando Nyembe",
        headline: "AML/ CFT Risk manager",
        currentCompany: "Nedbank",
        location: "Johannesburg",
        linkedInUrl: "https://www.linkedin.com/",
        status: 'Pool',
        matchScore: 0
    }
];

// DYNAMIC CONFIGS
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
        health: { score: 100, sentiment: 'Positive', lastActive: 'Now', openRoles: 0, placementsYTD: 0 },
        notes: []
    }
];

export const MOCK_USERS: UserAccount[] = [
    {
        id: 'u-1',
        name: 'Luthando Sibisi',
        email: 'luthando@mynextopp.co.za',
        role: UserRole.PARTNER,
        tenantId: 'mno-global',
        tenantName: 'My Next Opportunity',
        status: 'active',
        lastLogin: 'Just now',
        avatarInitials: 'LS'
    }
];

export const MOCK_SYSTEM_CONFIG: SystemSettings = {
    aiModels: { veoEnabled: true, imagenEnabled: true, textModel: 'gemini-3-flash-preview' },
    platform: { maintenanceMode: false, publicRegistration: false, debugLogging: true }
};

export const MOCK_AUDIT_LOGS = [];
export const MOCK_FEATURE_REQUESTS = [];
export const MOCK_REQUESTS = [];
export const MOCK_CANDIDATES = [];
export const MOCK_SUBMISSIONS = [];
export const MOCK_ACTIVITIES = [];
export const MOCK_EVENTS = [];
export const MOCK_CONVERSATIONS = [];
