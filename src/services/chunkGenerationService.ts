import { Chunk } from './chunkService';
import { SpeechUtils } from '@/utils/speechUtils';

interface AIConfig {
    provider: string;
    apiKey: string;
    apiUrl: string;
    modelName: string;
}

export async function generateChunkDetails(
    text: string,
    sceneId: string,
    config: AIConfig
): Promise<Partial<Chunk>> {
    try {
        console.log('Generating chunk details with config:', {
            provider: config.provider,
            apiUrl: config.apiUrl,
            modelName: config.modelName,
            // Don't log the API key for security
        });

        // Prepare the prompt for the AI
        const prompt = `
Generate details for an English language chunk. The chunk is: "${text}"
The context is: ${sceneId}

Please provide the following information in JSON format:
1. Pronunciation: The IPA pronunciation of the chunk
2. Chinese meaning: A translation or explanation in Chinese
3. Vietnamese meaning: A translation or explanation in Vietnamese
4. Suitable scenes: A list of 2-4 scenarios where this chunk would be useful

Return ONLY the JSON object with these fields:
{
  "pronunciation": "IPA pronunciation",
  "chinese_meaning": "Chinese translation/explanation",
  "vietnamese_meaning": "Vietnamese translation/explanation",
  "suitable_scenes": ["scene1", "scene2", ...]
}
`;

        let endpoint = config.apiUrl;
        // Make sure the endpoint includes the path to the chat completions API
        if (config.provider === 'openai') {
            // Check if the URL already contains the path
            if (!endpoint.includes('/v1/chat/completions')) {
                // Remove trailing slash if present
                if (endpoint.endsWith('/')) {
                    endpoint = endpoint.slice(0, -1);
                }
                // Add the path
                endpoint = `${endpoint}/v1/chat/completions`;
            }
        }

        console.log('Using API endpoint:', endpoint);

        // Call the AI API
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.modelName,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that generates details for English language chunks.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API response error:', errorText);
            throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('API response data:', data);

        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error('No content returned from API');
        }

        // Extract the JSON object from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Could not extract JSON from API response');
        }

        const chunkDetails = JSON.parse(jsonMatch[0]);
        console.log('Parsed chunk details:', chunkDetails);

        return {
            pronunciation: chunkDetails.pronunciation || '',
            chinese_meaning: chunkDetails.chinese_meaning || '',
            vietnamese_meaning: chunkDetails.vietnamese_meaning || '',
            suitable_scenes: Array.isArray(chunkDetails.suitable_scenes) ? chunkDetails.suitable_scenes : []
        };
    } catch (error) {
        console.error('Error generating chunk details:', error);
        // Return empty values as fallback
        return {
            pronunciation: '',
            chinese_meaning: '',
            vietnamese_meaning: '',
            suitable_scenes: []
        };
    }
}

// Fallback function using browser's speech synthesis to generate pronunciation
export async function generatePronunciationWithTTS(text: string): Promise<string> {
    try {
        // Try to play the text with TTS (this will help users hear the pronunciation)
        await SpeechUtils.playTTS(text);

        // Generate a simplified IPA representation
        // This is a simplified approximation - in a real app, you'd use a proper
        // text-to-IPA conversion library or API
        const words = text.split(/\s+/);
        const ipaWords = words.map(word => {
            const simplified = word
                .toLowerCase()
                .replace(/a/g, 'æ')
                .replace(/e/g, 'ɛ')
                .replace(/i/g, 'ɪ')
                .replace(/o/g, 'ɒ')
                .replace(/u/g, 'ʌ')
                .replace(/th/g, 'θ')
                .replace(/ng/g, 'ŋ')
                .replace(/sh/g, 'ʃ')
                .replace(/ch/g, 'tʃ')
                .replace(/[.,!?;:]/g, ''); // Remove punctuation

            return simplified;
        });

        return `/${ipaWords.join(' ')}/`;
    } catch (error) {
        console.error('Error generating pronunciation with TTS:', error);

        // Fallback to basic conversion if TTS fails
        const simplifiedIPA = text
            .toLowerCase()
            .replace(/a/g, 'æ')
            .replace(/e/g, 'ɛ')
            .replace(/i/g, 'ɪ')
            .replace(/o/g, 'ɒ')
            .replace(/u/g, 'ʌ')
            .replace(/th/g, 'θ')
            .replace(/ng/g, 'ŋ')
            .replace(/sh/g, 'ʃ')
            .replace(/ch/g, 'tʃ');

        return `/${simplifiedIPA}/`;
    }
}
