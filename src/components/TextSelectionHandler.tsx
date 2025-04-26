import React, { useState, useEffect, useRef } from 'react';
import styles from './TextSelectionHandler.module.css';
import { Chunk } from '@/services/chunkService';

interface TextSelectionHandlerProps {
    containerRef: React.RefObject<HTMLDivElement>;
    onAddChunk: (text: string) => void;
}

const TextSelectionHandler: React.FC<TextSelectionHandlerProps> = ({ containerRef, onAddChunk }) => {
    const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
    const buttonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleSelectionChange = () => {
            const selObj = window.getSelection();
            if (!selObj || selObj.isCollapsed || !containerRef.current) {
                setSelection(null);
                return;
            }

            // Check if the selection is within our container
            let node = selObj.anchorNode;
            let isWithinContainer = false;
            while (node) {
                if (node === containerRef.current) {
                    isWithinContainer = true;
                    break;
                }
                node = node.parentNode;
            }

            if (!isWithinContainer) {
                setSelection(null);
                return;
            }

            const selectedText = selObj.toString().trim();
            if (selectedText) {
                const range = selObj.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                // Position the button at the end of the selection
                setSelection({
                    text: selectedText,
                    x: rect.right,
                    y: rect.bottom
                });
            } else {
                setSelection(null);
            }
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        document.addEventListener('mouseup', handleSelectionChange);

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
            document.removeEventListener('mouseup', handleSelectionChange);
        };
    }, [containerRef]);

    // Handle click outside to dismiss the button
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setSelection(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAddChunk = () => {
        if (selection) {
            onAddChunk(selection.text);
            setSelection(null);
            window.getSelection()?.removeAllRanges();
        }
    };

    if (!selection) return null;

    return (
        <div
            ref={buttonRef}
            className={styles.selectionButtonContainer}
            style={{
                position: 'fixed',
                left: `${selection.x}px`,
                top: `${selection.y}px`,
                transform: 'translate(-50%, 10px)'
            }}
        >
            <button
                className={styles.selectionButton}
                onClick={handleAddChunk}
                title="Add Custom Chunk"
                aria-label="Add Custom Chunk"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
        </div>
    );
};

export default TextSelectionHandler;
