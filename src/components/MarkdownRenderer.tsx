import React from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './MarkdownRenderer.module.css';

interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    // Ensure content is properly formatted for markdown
    const formattedContent = content
        .replace(/\n\s*\n/g, '\n\n') // Normalize multiple line breaks
        .replace(/\*\*(.*?):\*\*\s*(.*?)(?=\n\n|\n\*\*|$)/g, '**$1**: $2\n\n'); // Ensure proper spacing after each dialogue line

    return (
        <div className={styles.markdown}>
            <ReactMarkdown>{formattedContent}</ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;