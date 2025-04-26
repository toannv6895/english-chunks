import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { scenes } from '@/data/scenes';
import { generateSceneContent } from '@/services/aiService';
import { checkAndRedirectAPISettings } from '@/utils/settingsHelper';
import { saveDialogue, getStoredDialogues } from '@/services/dialogueStorageService';
import { StoredDialogue } from '@/types/dialogue';
import ChunkCard from './ChunkCard';
import MarkdownRenderer from './MarkdownRenderer';
import styles from './SceneList.module.css';

const SceneList = () => {
    const router = useRouter();
    const [selectedScene, setSelectedScene] = useState<string | null>(null);
    const [chunks, setChunks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dialogue, setDialogue] = useState<string>('');
    const [processingStep, setProcessingStep] = useState<'idle' | 'generating'>('idle');
    const [progress, setProgress] = useState(0);
    const [customSceneInput, setCustomSceneInput] = useState('');
    const [additionalContext, setAdditionalContext] = useState('');
    const [isDialogueExpanded, setIsDialogueExpanded] = useState(false);
    const [currentDialogueId, setCurrentDialogueId] = useState<string | null>(null);

    const handleSceneClick = async (sceneId: string) => {
        if (sceneId === 'custom') {
            // For custom scenes, stay on the current page and show the input
            setSelectedScene(sceneId);
            setAdditionalContext('');
            return;
        }

        // For predefined scenes, navigate to the topic page
        router.push(`/scenes/topic/${sceneId}`);
    };

    const handleSceneSubmit = async () => {
        if (selectedScene === 'custom' && !customSceneInput.trim()) return;

        const savedSettings = localStorage.getItem('userSettings');
        if (!savedSettings) {
            router.push('/settings');
            alert('Please configure API settings first');
            return;
        }

        const settings = JSON.parse(savedSettings);
        if (!checkAndRedirectAPISettings(settings.ai, router)) {
            return;
        }

        await generateSceneDialogue(selectedScene!, selectedScene === 'custom' ? customSceneInput : undefined);
    };

    const generateSceneDialogue = async (sceneId: string, customPrompt?: string) => {
        setLoading(true);
        setError(null);
        setDialogue('');
        setChunks([]);
        setProgress(0);
        setProcessingStep('generating');

        try {
            const savedSettings = localStorage.getItem('userSettings');
            if (!savedSettings) {
                throw new Error('Please configure API information in settings first');
            }

            const settings = JSON.parse(savedSettings);
            const config = {
                provider: settings.ai.provider,
                apiKey: settings.ai.apiKey,
                apiUrl: settings.ai.apiUrl,
                modelName: settings.ai.modelName,
                englishLevel: settings.englishLevel
            };

            const scene = scenes.find(s => s.id === sceneId);
            if (!scene && !customPrompt) return;

            // Build complete scene description
            let sceneDescription = customPrompt || scene!.title;
            if (additionalContext && sceneId !== 'custom') {
                sceneDescription += ` (Additional context: ${additionalContext})`;
            }

            const result = await generateSceneContent(
                sceneDescription,
                config,
                (dialogueText) => {
                    setDialogue(dialogueText);
                    setProgress(Math.min(90, (dialogueText.length / 500) * 90));
                }
            );

            setDialogue(result.dialogue);
            setChunks(result.chunks);
            setProgress(100);
            setProcessingStep('idle');
            setIsDialogueExpanded(true);

            // Auto-save the generated dialogue
            // Reuse the scene variable that was already defined above
            const title = sceneId === 'custom'
                ? customPrompt
                : (scene ? scene.title + (additionalContext ? ` (${additionalContext})` : '') : 'Untitled Dialogue');

            // Create a unique ID using timestamp and a random string
            const uniqueId = `dialogue_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

            const newDialogue: StoredDialogue = {
                id: uniqueId,
                title,
                sceneId,
                customPrompt: sceneId === 'custom' ? customPrompt : undefined,
                additionalContext: additionalContext || undefined,
                dialogue: result.dialogue,
                chunks: result.chunks,
                createdAt: Date.now()
            };

            saveDialogue(newDialogue);
            setCurrentDialogueId(newDialogue.id);

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

        } catch (err) {
            console.error('Error generating scene content:', err);
            setError(err instanceof Error ? err.message : 'Error generating content');
            setSelectedScene(null);
            setProcessingStep('idle');
        } finally {
            setLoading(false);
        }
    };

    const getLoadingMessage = () => {
        return processingStep === 'generating' ? 'Generating content...' : '';
    };

    const getSceneInputPlaceholder = (sceneId: string) => {
        const scene = scenes.find(s => s.id === sceneId);
        if (!scene) return '';

        switch (sceneId) {
            case 'custom':
                return 'Please enter the specific scenario you want to practice, e.g.: ordering a latte at a coffee shop';
            case 'chat':
                return 'You can add specific people, e.g.: with colleagues, with spouse, with friends, etc.';
            case 'interview':
                return 'You can add specific positions, e.g.: Java programmer, product manager, designer, etc.';
            default:
                return `You can add specific scene details to enrich the dialogue`;
        }
    };

    const handleSaveDialogue = () => {
        if (!dialogue || !selectedScene) return;

        const scene = scenes.find(s => s.id === selectedScene);
        const title = selectedScene === 'custom'
            ? customSceneInput
            : (scene ? scene.title + (additionalContext ? ` (${additionalContext})` : '') : 'Untitled Dialogue');

        // If we already have an ID, use it; otherwise create a new unique ID
        const dialogueId = currentDialogueId ||
            `dialogue_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

        const newDialogue: StoredDialogue = {
            id: dialogueId,
            title,
            sceneId: selectedScene,
            customPrompt: selectedScene === 'custom' ? customSceneInput : undefined,
            additionalContext: additionalContext || undefined,
            dialogue,
            chunks,
            createdAt: Date.now()
        };

        saveDialogue(newDialogue);
        setCurrentDialogueId(newDialogue.id);

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
    };

    const handleLoadDialogue = (savedDialogue: StoredDialogue) => {
        setSelectedScene(savedDialogue.sceneId);
        setDialogue(savedDialogue.dialogue);
        setChunks(savedDialogue.chunks);
        setCustomSceneInput(savedDialogue.customPrompt || '');
        setAdditionalContext(savedDialogue.additionalContext || '');
        setIsDialogueExpanded(true);
        setCurrentDialogueId(savedDialogue.id);
        setProcessingStep('idle');
        setLoading(false);
        setProgress(100);
    };

    return (
        <div className={styles.container}>
            {!selectedScene ? (
                <>
                    <div className={styles.scenesHeader}>
                        <h1 className={styles.scenesTitle}>Choose a Scene</h1>
                        <p className={styles.scenesDescription}>
                            Select a scenario to practice English dialogues. Your saved dialogues will be available within each topic.
                        </p>
                    </div>

                    <div className={styles.grid}>
                        {scenes.map((scene) => (
                            <div
                                key={scene.id}
                                className={styles.sceneCard}
                                onClick={() => handleSceneClick(scene.id)}
                            >
                                <div className={styles.icon} dangerouslySetInnerHTML={{ __html: scene.icon }} />
                                <h3>{scene.title}</h3>
                                <p>{scene.description}</p>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className={styles.dialogueContainer}>
                    <div className={styles.dialogueActions}>
                        <button
                            className={styles.backButton}
                            onClick={() => {
                                setSelectedScene(null);
                                setChunks([]);
                                setDialogue('');
                                setProcessingStep('idle');
                                setCustomSceneInput('');
                                setAdditionalContext('');
                                setProgress(0);
                                setCurrentDialogueId(null);
                            }}
                        >
                            Back to Scene List
                        </button>

                        {dialogue && (
                            <button
                                className={styles.saveButton}
                                onClick={handleSaveDialogue}
                                title="Save dialogue for later"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                    <polyline points="7 3 7 8 15 8"></polyline>
                                </svg>
                                Save Dialogue
                            </button>
                        )}
                    </div>

                    <div className={styles.sceneInputContainer}>
                        {selectedScene === 'custom' ? (
                            <input
                                type="text"
                                className={styles.sceneInput}
                                value={customSceneInput}
                                onChange={(e) => setCustomSceneInput(e.target.value)}
                                placeholder={getSceneInputPlaceholder('custom')}
                            />
                        ) : (
                            <input
                                type="text"
                                className={styles.sceneInput}
                                value={additionalContext}
                                onChange={(e) => setAdditionalContext(e.target.value)}
                                placeholder={getSceneInputPlaceholder(selectedScene)}
                            />
                        )}
                        <button
                            className={styles.generateButton}
                            onClick={handleSceneSubmit}
                            disabled={(selectedScene === 'custom' && !customSceneInput.trim()) || loading}
                        >
                            Generate Dialogue
                        </button>
                    </div>

                    {processingStep !== 'idle' && (
                        <div className={styles.loading}>
                            {getLoadingMessage()}
                            <div className={styles.progressContainer}>
                                <div
                                    className={styles.progressBar}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            {processingStep === 'generating' && dialogue && (
                                <div className={styles.dialoguePreview}>
                                    <MarkdownRenderer content={dialogue} />
                                </div>
                            )}
                        </div>
                    )}

                    {error && <div className={styles.error}>{error}</div>}

                    {dialogue && (
                        <>
                            <div className={styles.dialogueCollapse}>
                                <div
                                    className={styles.dialogueHeader}
                                    onClick={() => setIsDialogueExpanded(!isDialogueExpanded)}
                                >
                                    <span>Original Dialogue{isDialogueExpanded ? ' (Click to collapse)' : ' (Click to expand)'}</span>
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
                                            transform: isDialogueExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.3s ease'
                                        }}
                                    >
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                                <div className={`${styles.dialogueContent} ${isDialogueExpanded ? styles.expanded : ''}`}>
                                    <MarkdownRenderer content={dialogue} />
                                </div>
                            </div>
                            {chunks.length > 0 && (
                                <div className={styles.chunksGrid}>
                                    {chunks.map((chunk, index) => (
                                        <ChunkCard key={index} chunk={chunk} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SceneList;