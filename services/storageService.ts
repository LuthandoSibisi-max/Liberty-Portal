
export const storageService = {
    save: (key: string, data: any) => {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(`mno_${key}`, serializedData);
        } catch (error) {
            console.error(`Error saving ${key} to localStorage`, error);
        }
    },

    load: (key: string, fallbackData: any) => {
        try {
            const serializedData = localStorage.getItem(`mno_${key}`);
            if (serializedData === null) {
                return fallbackData;
            }
            return JSON.parse(serializedData);
        } catch (error) {
            console.error(`Error loading ${key} from localStorage`, error);
            return fallbackData;
        }
    },

    clearAll: () => {
        try {
            // Clear only keys starting with mno_
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('mno_')) {
                    localStorage.removeItem(key);
                }
            });
            window.location.reload();
        } catch (error) {
            console.error("Error clearing storage", error);
        }
    }
};
