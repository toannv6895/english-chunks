import { Chunk } from '@/services/chunkService';

export interface StoredDialogue {
    id: string;
    title: string;
    sceneId: string;
    customPrompt?: string;
    additionalContext?: string;
    dialogue: string;
    chunks: Chunk[];
    createdAt: number;
}
