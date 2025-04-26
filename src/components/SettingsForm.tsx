'use client';

import React, { useEffect, useState } from 'react';
import styles from './SettingsForm.module.css';

// Define settings types
interface Settings {
    ai: {
        provider: 'openai' | 'gemini';
        apiKey: string;
        apiUrl: string;
        modelName: string;
    };
    englishLevel: string;
    voice: string;
    speed: number;
    motherLanguage: 'chinese' | 'vietnamese';
}

interface OpenAISpeechSettings {
    apiUrl: string;
    apiKey: string;
}

// Default settings
const defaultSettings: Settings = {
    ai: {
        provider: 'openai',
        apiKey: '',
        apiUrl: 'https://api.openai.com/',// 'https://api-proxy.me/openai',
        modelName: 'gpt-4o',
    },
    englishLevel: 'elementary',
    voice: 'en-US-JennyNeural',
    speed: 1.0,
    motherLanguage: 'chinese',
};

// English level options
const englishLevels = [
    { value: 'kindergarten', label: 'Kindergarten English' },
    { value: 'elementary', label: 'Elementary School English' },
    { value: 'junior', label: 'Junior High School English' },
    { value: 'university', label: 'University English' },
    { value: 'postdoc', label: 'Post-doctoral English' },
];

// Edge TTS voice list
const voices = [
    'en-US-JennyNeural',
    'en-US-GuyNeural',
    'en-GB-SoniaNeural',
    'en-GB-RyanNeural',
    'en-AU-NatashaNeural',
    'en-AU-WilliamNeural',
    'en-CA-ClaraNeural',
    'en-CA-LiamNeural',
];

// Mother language options
const motherLanguages = [
    { value: 'chinese', label: 'Chinese (中文)' },
    { value: 'vietnamese', label: 'Vietnamese (Tiếng Việt)' },
];

const SettingsForm = () => {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [message, setMessage] = useState('');
    const [openAISpeechSettings, setOpenAISpeechSettings] = useState<OpenAISpeechSettings>({
        apiUrl: '',
        apiKey: ''
    });

    // Load settings
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings({
                    ...defaultSettings,
                    ...parsed,
                    ai: {
                        ...defaultSettings.ai,
                        ...(parsed.ai || {}),
                    }
                });
            } catch (error) {
                console.error('Error loading settings:', error);
                setSettings(defaultSettings);
            }
        }

        const savedOpenAISpeechSettings = localStorage.getItem('openAISpeechSettings');
        if (savedOpenAISpeechSettings) {
            try {
                setOpenAISpeechSettings(JSON.parse(savedOpenAISpeechSettings));
            } catch (error) {
                console.error('Error parsing OpenAI speech settings:', error);
            }
        }
    }, []);

    // Save settings
    const saveSettings = () => {
        try {
            localStorage.setItem('userSettings', JSON.stringify(settings));
            setMessage('Settings saved');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage('Failed to save settings');
        }
    };

    // Export user data
    const exportData = () => {
        try {
            const data = {
                settings,
                // You can add other user data to export here
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'user-data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting data:', error);
            setMessage('Failed to export data');
        }
    };

    const handleOpenAISpeechSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setOpenAISpeechSettings(prev => {
            const newSettings = {
                ...prev,
                [name]: value
            };
            localStorage.setItem('openAISpeechSettings', JSON.stringify(newSettings));
            return newSettings;
        });
    };

    return (
        <div className={styles.form}>
            <section className={styles.section}>
                <h2>AI Settings</h2>
                <div className={styles.field}>
                    <label htmlFor="provider">AI Provider</label>
                    <select
                        id="provider"
                        value={settings.ai.provider}
                        onChange={(e) => setSettings({
                            ...settings,
                            ai: { ...settings.ai, provider: e.target.value as 'openai' | 'gemini' }
                        })}
                    >
                        <option value="openai">OpenAI</option>
                        <option value="gemini">Gemini</option>
                    </select>
                </div>
                <div className={styles.field}>
                    <label htmlFor="apiKey">API Key</label>
                    <input
                        type="password"
                        id="apiKey"
                        value={settings.ai.apiKey}
                        onChange={(e) => setSettings({
                            ...settings,
                            ai: { ...settings.ai, apiKey: e.target.value }
                        })}
                        placeholder={`Enter your ${settings.ai.provider === 'openai' ? 'OpenAI' : 'Gemini'} API Key`}
                    />
                </div>
                <div className={styles.field}>
                    <label htmlFor="apiUrl">API URL</label>
                    <input
                        type="text"
                        id="apiUrl"
                        value={settings.ai.apiUrl}
                        onChange={(e) => setSettings({
                            ...settings,
                            ai: { ...settings.ai, apiUrl: e.target.value }
                        })}
                        placeholder={`Enter ${settings.ai.provider === 'openai' ? 'OpenAI' : 'Gemini'} API URL`}
                    />
                </div>
                <div className={styles.field}>
                    <label htmlFor="modelName">Model Name</label>
                    <input
                        type="text"
                        id="modelName"
                        value={settings.ai.modelName}
                        onChange={(e) => setSettings({
                            ...settings,
                            ai: { ...settings.ai, modelName: e.target.value }
                        })}
                        placeholder="Enter model name, e.g. gpt-3.5-turbo"
                    />
                </div>
            </section>

            <section className={styles.section}>
                <h2>English Level</h2>
                <div className={styles.field}>
                    <select
                        value={settings.englishLevel}
                        onChange={(e) => setSettings({
                            ...settings,
                            englishLevel: e.target.value
                        })}
                    >
                        {englishLevels.map((level) => (
                            <option key={level.value} value={level.value}>
                                {level.label}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            <section className={styles.section}>
                <h2>Mother Language</h2>
                <div className={styles.field}>
                    <select
                        value={settings.motherLanguage}
                        onChange={(e) => setSettings({
                            ...settings,
                            motherLanguage: e.target.value as 'chinese' | 'vietnamese'
                        })}
                    >
                        {motherLanguages.map((language) => (
                            <option key={language.value} value={language.value}>
                                {language.label}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            <section className={styles.section}>
                <h2>Voice Settings</h2>
                <div className={styles.field}>
                    <label htmlFor="voice">Voice</label>
                    <select
                        id="voice"
                        value={settings.voice}
                        onChange={(e) => setSettings({
                            ...settings,
                            voice: e.target.value
                        })}
                    >
                        {voices.map((voice) => (
                            <option key={voice} value={voice}>
                                {voice}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.field}>
                    <label htmlFor="speed">Speech Speed: {settings.speed}</label>
                    <input
                        type="range"
                        id="speed"
                        min="0.4"
                        max="1.0"
                        step="0.1"
                        value={settings.speed}
                        onChange={(e) => setSettings({
                            ...settings,
                            speed: parseFloat(e.target.value)
                        })}
                    />
                </div>
            </section>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>OpenAI Speech Configuration (Optional)</h2>
                <div className={styles.field}>
                    <label htmlFor="openai-speech-api-url">API URL:</label>
                    <input
                        type="text"
                        id="openai-speech-api-url"
                        name="apiUrl"
                        value={openAISpeechSettings.apiUrl}
                        onChange={handleOpenAISpeechSettingsChange}
                        placeholder="https://api.openai.com/v1/audio/speech"
                    />
                </div>
                <div className={styles.field}>
                    <label htmlFor="openai-speech-api-key">API Key:</label>
                    <input
                        type="password"
                        id="openai-speech-api-key"
                        name="apiKey"
                        value={openAISpeechSettings.apiKey}
                        onChange={handleOpenAISpeechSettingsChange}
                        placeholder="sk-..."
                    />
                </div>
            </div>

            <div className={styles.actions}>
                <button onClick={saveSettings} className={styles.saveButton}>
                    Save Settings
                </button>
                <button onClick={exportData} className={styles.exportButton}>
                    Export Data
                </button>
            </div>

            {message && <div className={styles.message}>{message}</div>}
        </div>
    );
};

export default SettingsForm;