import React, { useState } from 'react';
import styles from './ChunkCard.module.css';
import type { Chunk } from '@/services/chunkService';
import MarkdownRenderer from './MarkdownRenderer';
import YouGlishModal from './YouGlishModal';

interface ChunkProps {
    chunk: Chunk;
    onDelete?: (chunk: Chunk) => void;
    onEdit?: (chunk: Chunk) => void;
}

const ChunkCard: React.FC<ChunkProps> = ({ chunk, onDelete, onEdit }) => {
    const [isYouGlishOpen, setIsYouGlishOpen] = useState(false);

    // Ensure chunk has all required properties with default values
    const safeChunk = {
        chunk: chunk.chunk || '',
        pronunciation: chunk.pronunciation || '',
        chinese_meaning: chunk.chinese_meaning || '',
        vietnamese_meaning: chunk.vietnamese_meaning || '',
        suitable_scenes: Array.isArray(chunk.suitable_scenes) ? chunk.suitable_scenes : [],
    };

    // Get user settings
    const getUserSettings = () => {
        // Default settings
        const defaultSettings = {
            voice: 'en-US-JennyNeural',
            speed: 1.0,
            motherLanguage: 'chinese'
        };

        // Get settings from localStorage
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                return {
                    voice: settings.voice || defaultSettings.voice,
                    speed: settings.speed || defaultSettings.speed,
                    motherLanguage: settings.motherLanguage || defaultSettings.motherLanguage
                };
            } catch (error) {
                console.error('Error parsing settings:', error);
            }
        }
        return defaultSettings;
    };

    const settings = getUserSettings();

    const playAudio = () => {
        const utterance = new SpeechSynthesisUtterance(safeChunk.chunk);
        utterance.lang = 'en-US';
        utterance.rate = settings.speed;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.voice = window.speechSynthesis.getVoices().find(v => v.name === settings.voice) || null;
        window.speechSynthesis.speak(utterance);
    };

    return (
        <>
            <div className={styles.card}>
                <div className={styles.cardContent} onClick={playAudio}>
                    <h3 className={styles.chunk}>{safeChunk.chunk}</h3>
                    <p className={styles.pronunciation}>{safeChunk.pronunciation}</p>
                    <p className={styles.meaning}>
                        {settings.motherLanguage === 'vietnamese'
                            ? safeChunk.vietnamese_meaning || safeChunk.chinese_meaning
                            : safeChunk.chinese_meaning}
                    </p>
                    {safeChunk.suitable_scenes.length > 0 && (
                        <div className={styles.scenes}>
                            {safeChunk.suitable_scenes.map((scene, index) => (
                                <span key={index} className={styles.scene}>
                                    {scene}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div className={styles.cardActions}>
                    <button
                        className={styles.actionButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsYouGlishOpen(true);
                        }}
                        title="YouGlish"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                        </svg>
                    </button>

                    <button className={styles.actionButton} title="Favorite">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>

                    <button className={styles.actionButton} title="Share">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                    </button>

                    {onEdit && (
                        <button
                            className={styles.actionButton}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(chunk);
                            }}
                            title="Edit Chunk"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    )}

                    {onDelete && (
                        <button
                            className={styles.actionButton}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to delete this chunk?')) {
                                    onDelete(chunk);
                                }
                            }}
                            title="Delete Chunk"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </button>
                    )}
                </div>
            </div>
            <YouGlishModal
                isOpen={isYouGlishOpen}
                onClose={() => setIsYouGlishOpen(false)}
                query={safeChunk.chunk}
            />
        </>
    );
};

export default ChunkCard;