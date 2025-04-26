import React, { useState, useEffect } from 'react';
import { Chunk } from '@/services/chunkService';
import styles from './CustomChunkModal.module.css';

interface CustomChunkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (chunk: Chunk) => void;
    initialText: string;
    sceneId: string;
}

const CustomChunkModal: React.FC<CustomChunkModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    initialText,
    sceneId
}) => {
    const [chunk, setChunk] = useState<Chunk>({
        chunk: '',
        pronunciation: '',
        chinese_meaning: '',
        vietnamese_meaning: '',
        suitable_scenes: []
    });

    // Reset form when modal opens with new text
    useEffect(() => {
        if (isOpen && initialText) {
            const sceneName = getSceneName(sceneId);
            setChunk({
                chunk: initialText,
                pronunciation: '',
                chinese_meaning: '',
                vietnamese_meaning: '',
                suitable_scenes: sceneName ? [sceneName] : []
            });
        }
    }, [isOpen, initialText, sceneId]);

    const getSceneName = (id: string): string => {
        // Map scene IDs to more readable names
        const sceneMap: Record<string, string> = {
            'daily': 'daily conversation',
            'business': 'business meeting',
            'interview': 'job interview',
            'travel': 'travel',
            'restaurant': 'restaurant',
            'shopping': 'shopping',
            'chat': 'casual chat',
            'phone': 'phone call',
            'custom': 'custom scenario'
        };
        
        return sceneMap[id] || '';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setChunk(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSceneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const scenes = value.split(',').map(scene => scene.trim()).filter(Boolean);
        setChunk(prev => ({
            ...prev,
            suitable_scenes: scenes
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(chunk);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h2>Add Custom Chunk</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="chunk">Chunk Text</label>
                        <textarea
                            id="chunk"
                            name="chunk"
                            value={chunk.chunk}
                            onChange={handleChange}
                            required
                            className={styles.textArea}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="pronunciation">Pronunciation (optional)</label>
                        <input
                            type="text"
                            id="pronunciation"
                            name="pronunciation"
                            value={chunk.pronunciation}
                            onChange={handleChange}
                            placeholder="e.g. /həˈloʊ/"
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="chinese_meaning">Chinese Meaning (optional)</label>
                        <input
                            type="text"
                            id="chinese_meaning"
                            name="chinese_meaning"
                            value={chunk.chinese_meaning}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="vietnamese_meaning">Vietnamese Meaning (optional)</label>
                        <input
                            type="text"
                            id="vietnamese_meaning"
                            name="vietnamese_meaning"
                            value={chunk.vietnamese_meaning || ''}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="suitable_scenes">Suitable Scenes (comma-separated)</label>
                        <input
                            type="text"
                            id="suitable_scenes"
                            name="suitable_scenes"
                            value={chunk.suitable_scenes.join(', ')}
                            onChange={handleSceneChange}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formActions}>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.saveButton}>
                            Save Chunk
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomChunkModal;
