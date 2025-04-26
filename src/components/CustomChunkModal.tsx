import React, { useState, useEffect } from 'react';
import { Chunk } from '@/services/chunkService';
import { generateChunkDetails, generatePronunciationWithTTS } from '@/services/chunkGenerationService';
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

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

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

    const handleAutoGenerate = async () => {
        setIsGenerating(true);
        setGenerationError(null);

        try {
            // Get AI settings from localStorage
            const savedSettings = localStorage.getItem('userSettings');
            if (!savedSettings) {
                throw new Error('Please configure API settings first');
            }

            const settings = JSON.parse(savedSettings);

            // Try to get OpenAI settings from the main settings
            let config = {
                provider: settings.ai?.provider || 'openai',
                apiKey: settings.ai?.apiKey || '',
                apiUrl: settings.ai?.apiUrl || '',
                modelName: settings.ai?.modelName || 'gpt-3.5-turbo'
            };

            // If OpenAI settings are not available in the main settings, try to get them from openAISpeechSettings
            if (!config.apiKey || !config.apiUrl) {
                const openAISpeechSettings = localStorage.getItem('openAISpeechSettings');
                if (openAISpeechSettings) {
                    try {
                        const speechSettings = JSON.parse(openAISpeechSettings);
                        if (speechSettings.apiKey && speechSettings.apiUrl) {
                            // Use the speech settings for the API call
                            config = {
                                provider: 'openai',
                                apiKey: speechSettings.apiKey,
                                // Extract the base URL from the speech API URL
                                apiUrl: speechSettings.apiUrl.replace('/v1/audio/speech', ''),
                                modelName: 'gpt-3.5-turbo'
                            };
                            console.log('Using OpenAI speech settings for chunk generation');
                        }
                    } catch (e) {
                        console.error('Error parsing OpenAI speech settings:', e);
                    }
                }
            }

            if (!config.apiKey || !config.apiUrl) {
                // If no API settings, use TTS for pronunciation only
                try {
                    const pronunciation = await generatePronunciationWithTTS(chunk.chunk);
                    setChunk(prev => ({
                        ...prev,
                        pronunciation
                    }));
                } catch (e) {
                    console.error('Error generating pronunciation with TTS:', e);
                    setGenerationError('Failed to generate pronunciation. Please try again.');
                }
                return;
            }

            // Generate details using AI
            const details = await generateChunkDetails(chunk.chunk, sceneId, config);

            // Update the chunk with the generated details
            setChunk(prev => ({
                ...prev,
                pronunciation: details.pronunciation || prev.pronunciation,
                chinese_meaning: details.chinese_meaning || prev.chinese_meaning,
                vietnamese_meaning: details.vietnamese_meaning || prev.vietnamese_meaning,
                suitable_scenes: details.suitable_scenes?.length ? details.suitable_scenes : prev.suitable_scenes
            }));
        } catch (error) {
            console.error('Error auto-generating chunk details:', error);
            setGenerationError(error instanceof Error ? error.message : 'Failed to generate chunk details');

            // Fallback to TTS for pronunciation only
            try {
                const pronunciation = await generatePronunciationWithTTS(chunk.chunk);
                setChunk(prev => ({
                    ...prev,
                    pronunciation
                }));
            } catch (e) {
                console.error('Error generating pronunciation:', e);
            }
        } finally {
            setIsGenerating(false);
        }
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

                    <div className={styles.autoGenerateContainer}>
                        <button
                            type="button"
                            className={styles.autoGenerateButton}
                            onClick={handleAutoGenerate}
                            disabled={isGenerating || !chunk.chunk}
                        >
                            {isGenerating ? (
                                <>
                                    <svg className={styles.spinner} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="10" fill="none" strokeWidth="4" />
                                    </svg>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                    </svg>
                                    Auto-Generate with AI/TTS
                                </>
                            )}
                        </button>
                        {generationError && (
                            <p className={styles.errorText}>{generationError}</p>
                        )}
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
