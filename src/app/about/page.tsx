'use client';

import styles from './page.module.css';

export default function AboutPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>About English Chunks</h1>

            <section className={styles.section}>
                <h2>What are English Chunks?</h2>
                <p>
                    English Chunks is an innovative English learning tool focused on helping learners master authentic English expressions.
                    Unlike traditional word or sentence learning, we divide practical English expressions into "chunks" that are easy to understand and remember,
                    allowing you to organize language more naturally and improve your speaking ability.
                </p>
            </section>

            <section className={styles.section}>
                <h2>Core Features</h2>
                <ul className={styles.list}>
                    <li>
                        <strong>Intelligent Extraction</strong>
                        <p>Automatically extract English expression chunks suitable for beginners from any English text, including pronunciation, meaning, and usage scenarios.</p>
                    </li>
                    <li>
                        <strong>Scenario-based Learning</strong>
                        <p>Each English chunk is labeled with applicable scenarios, helping you use these expressions in the correct context.</p>
                    </li>
                    <li>
                        <strong>Pronunciation Guidance</strong>
                        <p>Integrated with the YouGlish video learning system, allowing you to see how native speakers use these expressions in actual conversations.</p>
                    </li>
                    <li>
                        <strong>Playback Control</strong>
                        <p>Supports video speed adjustment, replay, and skip functions for convenient repeated practice and in-depth learning.</p>
                    </li>
                </ul>
            </section>

            <section className={styles.section}>
                <h2>Learning Suggestions</h2>
                <ul className={styles.list}>
                    <li>
                        <strong>Step by Step</strong>
                        <p>Start with simple everyday conversation scenarios and gradually transition to more complex expressions.</p>
                    </li>
                    <li>
                        <strong>Contextual Memory</strong>
                        <p>Pay attention to the usage scenarios of each English chunk and try to apply them in similar contexts.</p>
                    </li>
                    <li>
                        <strong>Repeated Practice</strong>
                        <p>Use YouGlish to watch different native speakers' pronunciations and usages to help deepen understanding.</p>
                    </li>
                    <li>
                        <strong>Practical Application</strong>
                        <p>Incorporate learned English chunks into daily conversations to reinforce memory through practice.</p>
                    </li>
                </ul>
            </section>

            <section className={styles.section}>
                <h2>Technical Features</h2>
                <ul className={styles.list}>
                    <li>
                        <strong>AI-Driven</strong>
                        <p>Using advanced AI technology to intelligently analyze and extract valuable English expression chunks.</p>
                    </li>
                    <li>
                        <strong>Real-time Processing</strong>
                        <p>Supports real-time text analysis and English chunk extraction for quick access to learning materials.</p>
                    </li>
                    <li>
                        <strong>Video Integration</strong>
                        <p>Seamlessly integrates with the YouGlish video learning system, providing a rich authentic language environment.</p>
                    </li>
                    <li>
                        <strong>Responsive Design</strong>
                        <p>Perfectly adapts to various devices, allowing you to learn English anytime, anywhere.</p>
                    </li>
                </ul>
            </section>

            <section className={styles.section}>
                <h2>Future Plans</h2>
                <p>
                    We will continuously optimize and expand the features of English Chunks, planning to add more learning tools and practice modes,
                    creating a more complete English learning ecosystem. Feedback and suggestions are welcome to help us improve!
                </p>
            </section>
        </div>
    );
}