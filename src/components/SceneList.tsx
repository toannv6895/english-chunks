import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { scenes } from '@/data/scenes';
import { generateSceneContent } from '@/services/aiService';
import { checkAndRedirectAPISettings } from '@/utils/settingsHelper';
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

    const handleSceneClick = async (sceneId: string) => {
        setSelectedScene(sceneId);
        setAdditionalContext('');  // Clear additional information
        if (sceneId === 'custom') {
            return;
        }

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

    return (
        <div className={styles.container}>
            {!selectedScene ? (
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
            ) : (
                <div className={styles.dialogueContainer}>
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
                        }}
                    >
                        Back to Scene List
                    </button>

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