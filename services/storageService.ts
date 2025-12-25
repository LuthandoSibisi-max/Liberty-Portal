
export const storageService = {
    save: (key: string, data: any) => {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(`mno_v2_${key}`, serializedData);
            localStorage.setItem(`mno_v2_last_sync`, new Date().toISOString());
        } catch (error) {
            console.error(`Error saving ${key} to localStorage`, error);
        }
    },

    load: (key: string, fallbackData: any) => {
        try {
            const serializedData = localStorage.getItem(`mno_v2_${key}`);
            if (serializedData === null) {
                return fallbackData;
            }
            return JSON.parse(serializedData);
        } catch (error) {
            console.error(`Error loading ${key} from localStorage`, error);
            return fallbackData;
        }
    },

    getLastSync: (): string => {
        return localStorage.getItem('mno_v2_last_sync') || new Date().toISOString();
    },

    // Track AI usage for "Real-time Cost Analysis"
    trackUsage: (model: 'flash' | 'pro' | 'veo') => {
        const usage = storageService.load('ai_usage', { flash: 0, pro: 0, veo: 0 });
        usage[model] += 1;
        storageService.save('ai_usage', usage);
    },

    clearAll: () => {
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('mno_v2_')) {
                    localStorage.removeItem(key);
                }
            });
            window.location.reload();
        } catch (error) {
            console.error("Error clearing storage", error);
        }
    }
};
