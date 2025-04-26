import { StoredDialogue } from '@/types/dialogue';

const STORAGE_KEY = 'storedDialogues';

export const getStoredDialogues = (): StoredDialogue[] => {
    if (typeof window === 'undefined') return [];

    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (!storedData) return [];

        return JSON.parse(storedData);
    } catch (error) {
        console.error('Error retrieving stored dialogues:', error);
        return [];
    }
};

export const getStoredDialoguesByTopic = (topicId: string): StoredDialogue[] => {
    if (typeof window === 'undefined') return [];

    try {
        const allDialogues = getStoredDialogues();
        return allDialogues.filter(dialogue => dialogue.sceneId === topicId);
    } catch (error) {
        console.error('Error retrieving stored dialogues by topic:', error);
        return [];
    }
};

export const saveDialogue = (dialogue: StoredDialogue): void => {
    if (typeof window === 'undefined') return;

    try {
        const existingDialogues = getStoredDialogues();

        // Remove any existing dialogue with the same ID to prevent duplicates
        const filteredDialogues = existingDialogues.filter(d => d.id !== dialogue.id);

        // Add the new/updated dialogue at the beginning of the array
        const updatedDialogues = [dialogue, ...filteredDialogues];

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDialogues));
    } catch (error) {
        console.error('Error saving dialogue:', error);
    }
};

export const deleteDialogue = (id: string): void => {
    if (typeof window === 'undefined') return;

    try {
        const existingDialogues = getStoredDialogues();
        const updatedDialogues = existingDialogues.filter(d => d.id !== id);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDialogues));
    } catch (error) {
        console.error('Error deleting dialogue:', error);
    }
};

export const clearAllDialogues = (): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing dialogues:', error);
    }
};
