'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { scenes } from '@/data/scenes';
import TopicScene from '@/components/TopicScene';
import styles from './page.module.css';

export default function TopicPage({ params }: { params: { topicId: string } }) {
    const router = useRouter();
    const topicId = params.topicId;
    const scene = scenes.find(s => s.id === topicId);
    
    if (!scene) {
        // If scene not found, redirect to scenes page
        useEffect(() => {
            router.push('/scenes');
        }, [router]);
        
        return <div>Loading...</div>;
    }
    
    return (
        <div className={styles.container}>
            <TopicScene sceneId={topicId} />
        </div>
    );
}
