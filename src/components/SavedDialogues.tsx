import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StoredDialogue } from '@/types/dialogue';
import { getStoredDialogues, deleteDialogue } from '@/services/dialogueStorageService';
import { scenes } from '@/data/scenes';
import styles from './SavedDialogues.module.css';

interface SavedDialoguesProps {
    onSelectDialogue: (dialogue: StoredDialogue) => void;
}

const SavedDialogues: React.FC<SavedDialoguesProps> = ({ onSelectDialogue }) => {
    const router = useRouter();
    const [dialogues, setDialogues] = useState<StoredDialogue[]>([]);
    const [isExpanded, setIsExpanded] = useState(true);

    // Load dialogues on mount and set up a storage event listener
    useEffect(() => {
        loadDialogues();

        // Set up event listener for storage changes
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'storedDialogues') {
                loadDialogues();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Check for changes every 2 seconds as a fallback
        const intervalId = setInterval(loadDialogues, 2000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(intervalId);
        };
    }, []);

    const loadDialogues = () => {
        const stored = getStoredDialogues();
        setDialogues(stored);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this dialogue?')) {
            deleteDialogue(id);
            loadDialogues();

            // Dispatch a custom storage event to notify other components about the change
            try {
                // This creates a proper StorageEvent that works across browsers
                window.dispatchEvent(new StorageEvent('storage', {
                    key: 'storedDialogues'
                }));
            } catch (e) {
                // Fallback for older browsers
                window.dispatchEvent(new Event('storage'));
            }
        }
    };

    const getSceneTitle = (sceneId: string, customPrompt?: string) => {
        if (sceneId === 'custom' && customPrompt) {
            return customPrompt.length > 30 ? customPrompt.substring(0, 30) + '...' : customPrompt;
        }

        const scene = scenes.find(s => s.id === sceneId);
        return scene ? scene.title : 'Unknown Scene';
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    if (dialogues.length === 0) {
        return null;
    }

    return (
        <div className={styles.savedDialoguesContainer}>
            <div
                className={styles.savedDialoguesHeader}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3>Saved Dialogues</h3>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                    }}
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>

            {isExpanded && (
                <div className={styles.dialoguesList}>
                    {dialogues.map((dialogue) => (
                        <div
                            key={dialogue.id}
                            className={styles.dialogueCard}
                            onClick={() => {
                                if (dialogue.sceneId === 'custom') {
                                    // For custom scenes, use the original handler
                                    onSelectDialogue(dialogue);
                                } else {
                                    // For predefined scenes, navigate to the topic page
                                    router.push(`/scenes/topic/${dialogue.sceneId}?dialogueId=${dialogue.id}`);
                                }
                            }}
                        >
                            <div className={styles.dialogueInfo}>
                                <h4>{dialogue.title || getSceneTitle(dialogue.sceneId, dialogue.customPrompt)}</h4>
                                <p className={styles.dialogueDate}>{formatDate(dialogue.createdAt)}</p>
                            </div>
                            <button
                                className={styles.deleteButton}
                                onClick={(e) => handleDelete(dialogue.id, e)}
                                aria-label="Delete dialogue"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedDialogues;
