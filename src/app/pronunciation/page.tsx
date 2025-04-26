'use client';

import React, { useState, useRef } from 'react';
import styles from './page.module.css';
import { SpeechUtils } from '@/utils/speechUtils';

const commonSentences = [
    {
        text: "I'd like a **cup of coffee**, please.",
        translation: "I would like a cup of coffee, please.",
        focus: "Note the contraction in 'd like and the stress on coffee",
        context: "Ordering at a coffee shop",
        formality: "General",
        emphasis: ["cup of coffee"]
    },
    {
        text: "**Could you** repeat that, please?",
        translation: "Could you please say that again?",
        focus: "Note the weak form of 'Could you', usually pronounced like 'Cud ya'",
        context: "When you can't hear what someone said",
        formality: "Polite formal",
        emphasis: ["Could you"]
    },
    {
        text: "**What do you do** for a living?",
        translation: "What do you do for work?",
        focus: "Note the linking in 'What do you', usually pronounced like 'Whaddya'",
        context: "First meeting in social settings",
        formality: "General",
        emphasis: ["What do you do"]
    },
    {
        text: "**Nice to meet** you!",
        translation: "Nice to meet you!",
        focus: "Note the linking in 'Nice to' and the stress on 'meet'",
        context: "First meeting",
        formality: "General",
        emphasis: ["Nice to meet"]
    },
    {
        text: "I'm **gonna** go to the **movies**.",
        translation: "I'm going to go to the movies.",
        focus: "Note that 'gonna' is the casual form of 'going to', and the stress in 'movies' is on the first syllable",
        context: "Daily conversation",
        formality: "Informal",
        emphasis: ["gonna", "movies"]
    },
    {
        text: "**Would you mind** if I opened the window?",
        translation: "Would you mind if I opened the window?",
        focus: "Note the linking in 'Would you' and the rising intonation on 'mind'",
        context: "Asking for permission",
        formality: "Formal polite",
        emphasis: ["Would you mind"]
    },
    {
        text: "**What's up** with you?",
        translation: "How are you doing?",
        focus: "Note the linking in 'What's up', usually pronounced like 'Wassup'",
        context: "Greeting between friends",
        formality: "Very informal",
        emphasis: ["What's up"]
    },
    {
        text: "I **should've** done it earlier.",
        translation: "I should have done it earlier.",
        focus: "Note the contraction in 'should've', don't pronounce it as 'should of'",
        context: "Expressing regret",
        formality: "General",
        emphasis: ["should've"]
    },
    {
        text: "**Lemme** think about it.",
        translation: "Let me think about it.",
        focus: "Note that 'Lemme' is the casual form of 'Let me'",
        context: "When you need time to think",
        formality: "Informal",
        emphasis: ["Lemme"]
    },
    {
        text: "**Gimme** a minute.",
        translation: "Give me a minute.",
        focus: "Note that 'Gimme' is the casual form of 'Give me'",
        context: "When you need a little time",
        formality: "Informal",
        emphasis: ["Gimme"]
    },
    {
        text: "I **dunno** what to do.",
        translation: "I don't know what to do.",
        focus: "Note that 'dunno' is the casual form of 'don't know'",
        context: "Expressing confusion",
        formality: "Informal",
        emphasis: ["dunno"]
    },
    {
        text: "**Wanna** grab some lunch?",
        translation: "Do you want to get some lunch?",
        focus: "Note that 'Wanna' is the casual form of 'want to'",
        context: "Inviting someone to eat",
        formality: "Informal",
        emphasis: ["Wanna"]
    },
    {
        text: "**Gotta** run, catch you later!",
        translation: "I have to go, see you later!",
        focus: "Note that 'Gotta' is the casual form of 'got to'",
        context: "Leaving in a hurry",
        formality: "Informal",
        emphasis: ["Gotta"]
    },
    {
        text: "**How've** you been?",
        translation: "How have you been?",
        focus: "Note the contraction in 'How've', which is short for 'How have'",
        context: "Greeting",
        formality: "General",
        emphasis: ["How've"]
    },
    {
        text: "**D'you** know what I mean?",
        translation: "Do you understand what I mean?",
        focus: "Note that 'D'you' is the casual contraction of 'Do you'",
        context: "Confirming understanding",
        formality: "Informal",
        emphasis: ["D'you"]
    },
    {
        text: "I **could've** sworn I put it here.",
        translation: "I swear I put it here.",
        focus: "Note the contraction in 'could've', which is short for 'could have'",
        context: "Expressing certainty",
        formality: "General",
        emphasis: ["could've"]
    },
    {
        text: "**What're** you up to?",
        translation: "What are you doing?",
        focus: "Note that 'What're' is a contraction of 'What are'",
        context: "Asking about current activities",
        formality: "Informal",
        emphasis: ["What're"]
    },
    {
        text: "**Where've** you been?",
        translation: "Where have you been?",
        focus: "Note that 'Where've' is a contraction of 'Where have'",
        context: "Asking about someone's whereabouts",
        formality: "General",
        emphasis: ["Where've"]
    },
    {
        text: "**Ain't** that the truth!",
        translation: "That's certainly true!",
        focus: "Note that 'Ain't' is an informal form of 'isn't/aren't'",
        context: "Expressing agreement",
        formality: "Very informal",
        emphasis: ["Ain't"]
    },
    {
        text: "**Y'all** ready?",
        translation: "Are you all ready?",
        focus: "Note that 'Y'all' is a Southern dialect form of 'you all'",
        context: "Asking about readiness",
        formality: "Informal",
        emphasis: ["Y'all"]
    },
    {
        text: "I'm **kinda** tired.",
        translation: "I'm somewhat tired.",
        focus: "Note that 'kinda' is the casual form of 'kind of'",
        context: "Expressing a state",
        formality: "Informal",
        emphasis: ["kinda"]
    },
    {
        text: "It's **sorta** like that.",
        translation: "It's somewhat like that.",
        focus: "Note that 'sorta' is the casual form of 'sort of'",
        context: "Making comparisons",
        formality: "Informal",
        emphasis: ["sorta"]
    },
    {
        text: "**Whatcha** doing?",
        translation: "What are you doing?",
        focus: "Note that 'Whatcha' is the casual form of 'What are you'",
        context: "Asking about current activities",
        formality: "Informal",
        emphasis: ["Whatcha"]
    },
    {
        text: "**How come** you didn't tell me?",
        translation: "Why didn't you tell me?",
        focus: "Note that 'How come' is a casual alternative to 'Why'",
        context: "Asking for reasons",
        formality: "Informal",
        emphasis: ["How come"]
    },
    {
        text: "**C'mere** for a second.",
        translation: "Come here for a second.",
        focus: "Note that 'C'mere' is the casual contraction of 'Come here'",
        context: "Calling someone over",
        formality: "Informal",
        emphasis: ["C'mere"]
    },
    {
        text: "**D'ya** wanna come with?",
        translation: "Do you want to come along?",
        focus: "Note that 'D'ya' is the casual contraction of 'Do you'",
        context: "Invitation",
        formality: "Informal",
        emphasis: ["D'ya"]
    },
    {
        text: "I'm **fixin' to** leave.",
        translation: "I'm preparing to leave.",
        focus: "Note that 'fixin' to' is Southern dialect meaning 'preparing to'",
        context: "Expressing imminent action",
        formality: "Informal",
        emphasis: ["fixin' to"]
    },
    {
        text: "**Betcha** can't do it!",
        translation: "I bet you can't do it!",
        focus: "Note that 'Betcha' is the casual contraction of 'I bet you'",
        context: "Making a challenge",
        formality: "Informal",
        emphasis: ["Betcha"]
    },
    {
        text: "**Wouldja** mind moving?",
        translation: "Would you mind moving?",
        focus: "Note that 'Wouldja' is the casual contraction of 'Would you'",
        context: "Polite request",
        formality: "Informal",
        emphasis: ["Wouldja"]
    },
    {
        text: "**Didja** hear about that?",
        translation: "Did you hear about that?",
        focus: "Note that 'Didja' is the casual contraction of 'Did you'",
        context: "Asking about news",
        formality: "Informal",
        emphasis: ["Didja"]
    },
    {
        text: "**Hafta** go now.",
        translation: "Have to go now.",
        focus: "Note that 'Hafta' is the casual form of 'have to'",
        context: "Expressing necessity",
        formality: "Informal",
        emphasis: ["Hafta"]
    },
    {
        text: "**S'pose** we should start.",
        translation: "I suppose we should start.",
        focus: "Note that 'S'pose' is the casual contraction of 'Suppose'",
        context: "Making a suggestion",
        formality: "Informal",
        emphasis: ["S'pose"]
    },
    {
        text: "**Imma** head out.",
        translation: "I'm going to head out.",
        focus: "Note that 'Imma' is an extremely casual form of 'I am going to'",
        context: "Expressing intention to leave",
        formality: "Very informal",
        emphasis: ["Imma"]
    },
    {
        text: "**How'd** you do that?",
        translation: "How did you do that?",
        focus: "Note that 'How'd' is a contraction of 'How did'",
        context: "Asking about methods",
        formality: "General",
        emphasis: ["How'd"]
    },
    {
        text: "**What'd** you say?",
        translation: "What did you say?",
        focus: "Note that 'What'd' is a contraction of 'What did'",
        context: "Requesting repetition",
        formality: "General",
        emphasis: ["What'd"]
    },
    {
        text: "**Where'd** you get that?",
        translation: "Where did you get that?",
        focus: "Note that 'Where'd' is a contraction of 'Where did'",
        context: "Asking about sources",
        formality: "General",
        emphasis: ["Where'd"]
    },
    {
        text: "**When're** we leaving?",
        translation: "When are we leaving?",
        focus: "Note that 'When're' is a contraction of 'When are'",
        context: "Asking about time",
        formality: "General",
        emphasis: ["When're"]
    },
    {
        text: "**Who're** you waiting for?",
        translation: "Who are you waiting for?",
        focus: "Note that 'Who're' is a contraction of 'Who are'",
        context: "Asking about a person",
        formality: "General",
        emphasis: ["Who're"]
    },
    {
        text: "**That'll** work.",
        translation: "That will work.",
        focus: "Note that 'That'll' is a contraction of 'That will'",
        context: "Expressing agreement",
        formality: "General",
        emphasis: ["That'll"]
    },
    {
        text: "**It'll** be fine.",
        translation: "It will be fine.",
        focus: "Note that 'It'll' is a contraction of 'It will'",
        context: "Reassurance",
        formality: "General",
        emphasis: ["It'll"]
    },
    {
        text: "**They'll** be here soon.",
        translation: "They will be here soon.",
        focus: "Note that 'They'll' is a contraction of 'They will'",
        context: "Making a prediction",
        formality: "General",
        emphasis: ["They'll"]
    },
    {
        text: "**We'll** see about that.",
        translation: "We will see about that.",
        focus: "Note that 'We'll' is a contraction of 'We will'",
        context: "Expressing doubt",
        formality: "General",
        emphasis: ["We'll"]
    },
    {
        text: "**I'll** get back to you.",
        translation: "I will get back to you.",
        focus: "Note that 'I'll' is a contraction of 'I will'",
        context: "Promising to respond",
        formality: "General",
        emphasis: ["I'll"]
    },
    {
        text: "**You'll** love it!",
        translation: "You will love it!",
        focus: "Note that 'You'll' is a contraction of 'You will'",
        context: "Expressing certainty",
        formality: "General",
        emphasis: ["You'll"]
    }
];

export default function PronunciationPage() {
    const [recordings, setRecordings] = useState<{[key: number]: string}>({});
    const [recordingIndex, setRecordingIndex] = useState<number | null>(null);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);

    const startRecording = async (index: number) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            audioChunks.current = [];

            mediaRecorder.current.ondataavailable = (event) => {
                audioChunks.current.push(event.data);
            };

            mediaRecorder.current.onstop = () => {
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
                const url = URL.createObjectURL(audioBlob);
                setRecordings(prev => ({
                    ...prev,
                    [index]: url
                }));
            };

            mediaRecorder.current.start();
            setRecordingIndex(index);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Cannot access microphone. Please make sure you have granted permission.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && recordingIndex !== null) {
            mediaRecorder.current.stop();
            setRecordingIndex(null);
            mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const playEdgeTTS = async (text: string) => {
        try {
            await SpeechUtils.playTTS(text);
        } catch (error) {
            console.error('Error playing TTS:', error);
            alert('Failed to play audio. Please check your audio settings.');
        }
    };

    const renderText = (text: string, emphasisWords: string[]) => {
        let result = text;
        emphasisWords.forEach(word => {
            const pattern = new RegExp(`\\*\\*(${word})\\*\\*`, 'g');
            result = result.replace(pattern, (_, p1) => `<a href="https://youglish.com/pronounce/${encodeURIComponent(p1)}" target="_blank" class="${styles.emphasisLink}">${p1}</a>`);
        });
        return <div dangerouslySetInnerHTML={{ __html: result }} />;
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Pronunciation Correction Practice</h1>
            <p className={styles.description}>
                Select sentences to practice pronunciation. Click on the bold parts to see more pronunciation examples.
            </p>

            <div className={styles.sentenceList}>
                {commonSentences.map((sentence, index) => (
                    <div key={index} className={styles.sentenceCard}>
                        <div className={styles.sentenceHeader}>
                            <div className={styles.sentenceText}>
                                {renderText(sentence.text, sentence.emphasis)}
                            </div>
                            <div className={styles.controls}>
                                <button
                                    className={styles.playButton}
                                    onClick={() => playEdgeTTS(sentence.text)}
                                >
                                    Play Standard Pronunciation
                                </button>
                                <button
                                    className={`${styles.recordButton} ${recordingIndex === index ? styles.recording : ''}`}
                                    onClick={() => recordingIndex === index ? stopRecording() : startRecording(index)}
                                >
                                    {recordingIndex === index ? 'Stop Recording' : 'Start Recording'}
                                </button>
                            </div>
                        </div>
                        <div className={styles.translation}>{sentence.translation}</div>
                        <div className={styles.focus}>{sentence.focus}</div>
                        <div className={styles.context}>
                            <span className={styles.label}>Usage Context: </span>
                            {sentence.context}
                        </div>
                        <div className={styles.formality}>
                            <span className={styles.label}>Formality Level: </span>
                            {sentence.formality}
                        </div>
                        {recordings[index] && (
                            <div className={styles.audioPlayback}>
                                <audio src={recordings[index]} controls />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}