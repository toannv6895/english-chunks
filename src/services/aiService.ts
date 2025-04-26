import type { Chunk } from './chunkService';

interface AIConfig {
    provider: 'openai' | 'gemini';
    apiKey: string;
    apiUrl: string;
    modelName: string;
    englishLevel: string;
}

interface SceneResponse {
    dialogue: string;
    chunks: Chunk[];
}

const getEnglishLevelDescription = (level: string): string => {
    switch (level) {
        case 'kindergarten':
            return 'beginner level (age 3-6), using very simple vocabulary and basic expressions';
        case 'elementary':
            return 'elementary level (age 7-12), using simple vocabulary and common daily expressions';
        case 'junior':
            return 'intermediate level (age 13-15), using moderate vocabulary and some idioms';
        case 'university':
            return 'advanced level (university student), using rich vocabulary and natural expressions';
        case 'postdoc':
            return 'professional level (post-doctoral), using sophisticated vocabulary and professional expressions';
        default:
            return 'intermediate level, using moderate vocabulary and common expressions';
    }
};

const SYSTEM_PROMPT = (englishLevel: string) => `You are an English learning assistant. Your task is to:
1. Generate a natural dialogue based on the given scene
2. Extract useful English chunks from the dialogue
3. Return both in a structured format

Target English Level: ${getEnglishLevelDescription(englishLevel)}

Requirements:
- The dialogue should be realistic and include 3-4 speakers
- Each chunk should be a useful phrase or expression (not complete sentences)
- Each chunk must include pronunciation, Chinese meaning, Vietnamese meaning, and suitable scenes
- Format all speakers in the dialogue as "Speaker: Content"
- Adjust language difficulty according to the target English level
- For lower levels (kindergarten/elementary), focus on basic daily expressions
- For higher levels (university/postdoc), include more sophisticated expressions and idioms

Response Format:
{
    "dialogue": "string (the generated dialogue with speaker names)",
    "chunks": [
        {
            "chunk": "useful English phrase or expression",
            "pronunciation": "IPA phonetic symbols",
            "chinese_meaning": "English meaning in Chinese",
            "vietnamese_meaning": "English meaning in Vietnamese",
            "suitable_scenes": ["scene1", "scene2"]
        }
    ]
}`;

const createRequestBody = (config: AIConfig, scene: string, stream = true) => {
    const prompt = `Generate an English learning dialogue and chunks for the following scene: ${scene}`;

    if (config.provider === 'openai') {
        return {
            model: config.modelName,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT(config.englishLevel) },
                { role: 'user', content: prompt }
            ],
            stream
        };
    } else {
        return {
            contents: [
                {
                    parts: [
                        { text: SYSTEM_PROMPT(config.englishLevel) + "\n\nUser: " + prompt }
                    ]
                }
            ]
        };
    }
};

const handleStreamResponse = async (
    response: Response,
    config: AIConfig,
    onProgress: (text: string) => void
): Promise<string> => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    if (!reader) {
        throw new Error('Failed to read response');
    }

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                    const parsed = JSON.parse(data);
                    let content = '';
                    if (config.provider === 'openai' && parsed.choices?.[0]?.delta?.content) {
                        content = parsed.choices[0].delta.content;
                    } else if (config.provider === 'gemini' && parsed.candidates?.[0]?.content?.parts?.[0]?.text) {
                        content = parsed.candidates[0].content.parts[0].text;
                    }
                    fullText += content;
                    onProgress(fullText);
                } catch (e) {
                    console.error('Error parsing streaming response:', e);
                }
            }
        }
    }

    return fullText;
};

export const generateSceneContent = async (
    scene: string,
    config: AIConfig,
    onProgress: (dialogue: string) => void
): Promise<SceneResponse> => {
    try {
        let endpoint;
        let headers;
        let body;

        if (config.provider === 'openai') {
            endpoint = `${config.apiUrl}/v1/chat/completions`;
            headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            };
            body = createRequestBody(config, scene, false);
        } else {
            endpoint = `${config.apiUrl}/v1beta/models/${config.modelName}:generateContent?key=${config.apiKey}`;
            headers = {
                'Content-Type': 'application/json'
            };
            body = createRequestBody(config, scene, false);
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error('Failed to generate scene content');
        }

        const data = await response.json();
        let content = '';

        if (config.provider === 'openai') {
            content = data.choices[0]?.message?.content;
        } else {
            content = data.candidates[0]?.content?.parts[0]?.text;
        }

        if (!content) {
            throw new Error('No content in response');
        }

        try {
            // Clean response content to ensure it's valid JSON
            const cleanContent = content
                .replace(/^```json\s*/m, '')
                .replace(/\s*```\s*$/m, '')
                .trim();

            const result = JSON.parse(cleanContent) as SceneResponse;

            // Validate response format
            if (!result.dialogue || !Array.isArray(result.chunks)) {
                throw new Error('Invalid response format');
            }

            // Format dialogue as Markdown
            const formattedDialogue = result.dialogue
                .split('\n')
                .map(line => {
                    line = line.trim();
                    if (!line) return '';

                    if (line.includes(':')) {
                        // Find the first colon that's not part of a URL
                        const colonIndex = line.search(/(?<!https?):(?!\/\/)/);
                        if (colonIndex > 0) {
                            const speaker = line.substring(0, colonIndex).trim();
                            const content = line.substring(colonIndex + 1).trim();
                            return `**${speaker}**: ${content}`;
                        }
                    }
                    return line;
                })
                .filter(line => line) // Remove empty lines
                .join('\n\n');

            onProgress(formattedDialogue);

            return {
                dialogue: formattedDialogue,
                chunks: result.chunks.map(chunk => ({
                    chunk: chunk.chunk || '',
                    pronunciation: chunk.pronunciation || '',
                    chinese_meaning: chunk.chinese_meaning || '',
                    vietnamese_meaning: chunk.vietnamese_meaning || '',
                    suitable_scenes: Array.isArray(chunk.suitable_scenes) ? chunk.suitable_scenes : [],
                }))
            };
        } catch (e) {
            console.error('Error parsing response:', e);
            console.error('Content was:', content);
            throw new Error('Failed to parse scene content');
        }
    } catch (error) {
        console.error('Error generating scene content:', error);
        throw error;
    }
};