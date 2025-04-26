import React, { useState, useEffect, useRef } from 'react';
import { SpeechUtils } from '@/utils/speechUtils';
import styles from './DialogueAudioPlayer.module.css';

interface DialogueAudioPlayerProps {
    dialogue: string;
}

const DialogueAudioPlayer: React.FC<DialogueAudioPlayerProps> = ({ dialogue }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioUrlRef = useRef<string | null>(null);

    // Clean up audio URL when component unmounts
    useEffect(() => {
        return () => {
            if (audioUrlRef.current) {
                URL.revokeObjectURL(audioUrlRef.current);
            }
        };
    }, []);

    // Clean up audio URL when dialogue changes
    useEffect(() => {
        if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
        }
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }, [dialogue]);

    const cleanDialogueText = (text: string): string => {
        // Remove markdown formatting and other non-speech elements
        return text
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
            .replace(/\n\n/g, '. ') // Replace double line breaks with periods
            .replace(/\n/g, ' ') // Replace single line breaks with spaces
            .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
            .trim();
    };

    const generateAudio = async () => {
        try {
            setIsGenerating(true);
            setError(null);

            // Clean the dialogue text for speech
            const cleanText = cleanDialogueText(dialogue);

            // Use browser's built-in speech synthesis
            await SpeechUtils.playTTS(cleanText);
            setIsPlaying(true);

            // Listen for the end of speech
            const speechSynthesis = window.speechSynthesis;
            const checkSpeechEnd = setInterval(() => {
                if (!speechSynthesis.speaking) {
                    clearInterval(checkSpeechEnd);
                    setIsPlaying(false);
                }
            }, 100);

        } catch (error) {
            console.error('Error generating audio:', error);
            setError('Failed to generate audio. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const togglePlayPause = async () => {
        if (isGenerating) return;

        if (isPlaying) {
            // Stop speech
            SpeechUtils.stopTTS();
            setIsPlaying(false);
        } else {
            // Start speech
            await generateAudio();
        }
    };

    return (
        <div className={styles.audioPlayer}>
            <button
                className={`${styles.playButton} ${isPlaying ? styles.pauseButton : ''} ${isGenerating ? styles.loading : ''}`}
                onClick={togglePlayPause}
                disabled={isGenerating}
                title={isPlaying ? 'Pause' : 'Play dialogue'}
            >
                {isGenerating ? (
                    <svg className={styles.spinner} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" fill="none" strokeWidth="4" />
                    </svg>
                ) : isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                )}
            </button>
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
};

export default DialogueAudioPlayer;
