import React from 'react';
import styles from './GameLevel.module.css';
import { GameLevel as GameLevelType } from '@/data/gameLevels';

interface GameLevelProps {
  level: GameLevelType;
  isLocked: boolean;
  onClick: () => void;
  earnedStars: number;
}

const GameLevel: React.FC<GameLevelProps> = ({ level, isLocked, onClick, earnedStars }) => {
  return (
    <div
      className={`${styles.levelCard} ${isLocked ? styles.locked : ''}`}
      onClick={onClick}
    >
      <div className={styles.iconContainer} dangerouslySetInnerHTML={{ __html: level.icon }} />
      <h3 className={styles.levelName}>{level.name}</h3>
      <p className={styles.description}>{level.description}</p>
      <div className={styles.stars}>
        <div>Required: {level.minStars} ⭐</div>
        {earnedStars > 0 && (
          <div className={styles.earnedStars}>
            Earned: {earnedStars} ⭐
          </div>
        )}
      </div>
      {isLocked && <div className={styles.lockOverlay}>🔒</div>}
    </div>
  );
};

export default GameLevel;