import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { scenes } from '@/data/scenes';
import { generateSceneContent } from '@/services/aiService';
import { checkAndRedirectAPISettings } from '@/utils/settingsHelper';
import { saveDialogue, getStoredDialogues } from '@/services/dialogueStorageService';
import { StoredDialogue } from '@/types/dialogue';
import { Chunk } from '@/services/chunkService';
import ChunkCard from './ChunkCard';
import MarkdownRenderer from './MarkdownRenderer';
import TopicSavedDialogues from './TopicSavedDialogues';
import DialogueAudioPlayer from './DialogueAudioPlayer';
import TextSelectionHandler from './TextSelectionHandler';
import CustomChunkModal from './CustomChunkModal';
import styles from './TopicScene.module.css';

interface TopicSceneProps {
    sceneId: string;
}

const TopicScene: React.FC<TopicSceneProps> = ({ sceneId }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [chunks, setChunks] = useState<Chunk[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dialogue, setDialogue] = useState<string>('');
    const [processingStep, setProcessingStep] = useState<'idle' | 'generating'>('idle');
    const [progress, setProgress] = useState(0);
    const [additionalContext, setAdditionalContext] = useState('');
    const [isDialogueExpanded, setIsDialogueExpanded] = useState(true);
    const [currentDialogueId, setCurrentDialogueId] = useState<string | null>(null);

    // Text selection and custom chunk state
    const dialogueContentRef = useRef<HTMLDivElement>(null);
    const [selectedText, setSelectedText] = useState<string>('');
    const [isChunkModalOpen, setIsChunkModalOpen] = useState(false);
    const [editingChunk, setEditingChunk] = useState<Chunk | undefined>(undefined);
    const [isEditing, setIsEditing] = useState(false);

    const scene = scenes.find(s => s.id === sceneId);

    // Check if there's a dialogueId in the URL and load that dialogue
    useEffect(() => {
        const dialogueId = searchParams.get('dialogueId');
        if (dialogueId) {
            const storedDialogues = getStoredDialogues();
            const savedDialogue = storedDialogues.find(d => d.id === dialogueId);

            if (savedDialogue && savedDialogue.sceneId === sceneId) {
                setDialogue(savedDialogue.dialogue);
                setChunks(savedDialogue.chunks);
                setAdditionalContext(savedDialogue.additionalContext || '');
                setIsDialogueExpanded(true);
                setCurrentDialogueId(savedDialogue.id);
                setProcessingStep('idle');
                setProgress(100);
            }
        }
    }, [sceneId, searchParams]);

    const handleSceneSubmit = async () => {
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

        await generateSceneDialogue(sceneId);
    };

    const generateSceneDialogue = async (sceneId: string) => {
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

            if (!scene) return;

            // Build complete scene description
            let sceneDescription = scene.title;
            if (additionalContext) {
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
            const title = scene.title + (additionalContext ? ` (${additionalContext})` : '');

            // Create a unique ID using timestamp and a random string
            const uniqueId = `dialogue_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

            const newDialogue: StoredDialogue = {
                id: uniqueId,
                title,
                sceneId,
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
            setProcessingStep('idle');
        } finally {
            setLoading(false);
        }
    };

    const getLoadingMessage = () => {
        return processingStep === 'generating' ? 'Generating content...' : '';
    };

    const getSceneInputPlaceholder = () => {
        switch (sceneId) {
            case 'chat':
                return 'You can add specific people, e.g.: with colleagues, with spouse, with friends, etc.';
            case 'interview':
                return 'You can add specific positions, e.g.: Java programmer, product manager, designer, etc.';
            default:
                return `You can add specific scene details to enrich the dialogue`;
        }
    };

    const handleSaveDialogue = () => {
        if (!dialogue || !scene) return;

        const title = scene.title + (additionalContext ? ` (${additionalContext})` : '');

        // If we already have an ID, use it; otherwise create a new unique ID
        const dialogueId = currentDialogueId ||
            `dialogue_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

        const newDialogue: StoredDialogue = {
            id: dialogueId,
            title,
            sceneId,
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

    // Function to handle loading a saved dialogue
    const handleLoadSavedDialogue = (savedDialogue: StoredDialogue) => {
        setDialogue(savedDialogue.dialogue);
        setChunks(savedDialogue.chunks);
        setAdditionalContext(savedDialogue.additionalContext || '');
        setIsDialogueExpanded(true);
        setCurrentDialogueId(savedDialogue.id);
        setProcessingStep('idle');
        setProgress(100);
    };

    // Function to handle text selection for custom chunk creation
    const handleTextSelection = (text: string) => {
        setSelectedText(text);
        setIsChunkModalOpen(true);
    };

    // Function to add a custom chunk
    const handleAddCustomChunk = (newChunk: Chunk) => {
        let updatedChunks: Chunk[];

        if (isEditing && editingChunk) {
            // If editing, replace the existing chunk
            updatedChunks = chunks.map(c =>
                c === editingChunk ? newChunk : c
            );
        } else {
            // If adding new, append to the array
            updatedChunks = [...chunks, newChunk];
        }

        setChunks(updatedChunks);

        // Reset editing state
        setIsEditing(false);
        setEditingChunk(undefined);

        // If we have a current dialogue ID, update the stored dialogue
        if (currentDialogueId) {
            updateStoredDialogue(updatedChunks);
        }
    };

    // Function to handle chunk deletion
    const handleDeleteChunk = (chunkToDelete: Chunk) => {
        // Filter out the chunk to delete
        const updatedChunks = chunks.filter(c => c !== chunkToDelete);
        setChunks(updatedChunks);

        // If we have a current dialogue ID, update the stored dialogue
        if (currentDialogueId) {
            updateStoredDialogue(updatedChunks);
        }
    };

    // Function to handle chunk editing
    const handleEditChunk = (chunkToEdit: Chunk) => {
        setEditingChunk(chunkToEdit);
        setIsEditing(true);
        setIsChunkModalOpen(true);
    };

    // Helper function to update the stored dialogue
    const updateStoredDialogue = (updatedChunks: Chunk[]) => {
        const storedDialogues = getStoredDialogues();
        const currentDialogue = storedDialogues.find(d => d.id === currentDialogueId);

        if (currentDialogue) {
            const updatedDialogue: StoredDialogue = {
                ...currentDialogue,
                chunks: updatedChunks
            };

            saveDialogue(updatedDialogue);

            // Notify other components about the change
            try {
                window.dispatchEvent(new StorageEvent('storage', {
                    key: 'storedDialogues'
                }));
            } catch (e) {
                window.dispatchEvent(new Event('storage'));
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.topicHeader}>
                <button
                    className={styles.backButton}
                    onClick={() => router.push('/scenes')}
                >
                    Back to Scene List
                </button>
                <div className={styles.topicInfo}>
                    <h1 className={styles.topicTitle}>{scene?.title}</h1>
                    <p className={styles.topicDescription}>{scene?.description}</p>
                </div>
            </div>

            <TopicSavedDialogues
                topicId={sceneId}
                onSelectDialogue={handleLoadSavedDialogue}
            />

            <div className={styles.sceneInputContainer}>
                <input
                    type="text"
                    className={styles.sceneInput}
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    placeholder={getSceneInputPlaceholder()}
                />
                <button
                    className={styles.generateButton}
                    onClick={handleSceneSubmit}
                    disabled={loading}
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
                    <div className={styles.dialogueActions}>
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
                    </div>

                    <div className={styles.dialogueCollapse}>
                        <div className={styles.dialogueHeader}>
                            <div className={styles.dialogueHeaderLeft}>
                                <DialogueAudioPlayer dialogue={dialogue} />
                                <span
                                    className={styles.dialogueTitle}
                                    onClick={() => setIsDialogueExpanded(!isDialogueExpanded)}
                                >
                                    Original Dialogue{isDialogueExpanded ? ' (Click to collapse)' : ' (Click to expand)'}
                                </span>
                            </div>
                            <div
                                className={styles.collapseIcon}
                                onClick={() => setIsDialogueExpanded(!isDialogueExpanded)}
                            >
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
                        </div>
                        <div
                            ref={dialogueContentRef}
                            className={`${styles.dialogueContent} ${isDialogueExpanded ? styles.expanded : ''}`}
                        >
                            <MarkdownRenderer content={dialogue} />
                            <TextSelectionHandler
                                containerRef={dialogueContentRef}
                                onAddChunk={handleTextSelection}
                            />
                        </div>

                        <CustomChunkModal
                            isOpen={isChunkModalOpen}
                            onClose={() => {
                                setIsChunkModalOpen(false);
                                setIsEditing(false);
                                setEditingChunk(undefined);
                            }}
                            onSave={handleAddCustomChunk}
                            initialText={selectedText}
                            sceneId={sceneId}
                            editingChunk={editingChunk}
                            isEditing={isEditing}
                        />
                    </div>
                    {chunks.length > 0 && (
                        <div className={styles.chunksGrid}>
                            {chunks.map((chunk, index) => (
                                <ChunkCard
                                    key={index}
                                    chunk={chunk}
                                    onEdit={handleEditChunk}
                                    onDelete={handleDeleteChunk}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TopicScene;
