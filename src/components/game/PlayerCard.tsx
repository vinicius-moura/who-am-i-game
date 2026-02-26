import React from 'react';
import styles from './PlayerCard.module.scss';
import type { Player } from '../../types/game';

interface Props {
  player: Player;
  isMe: boolean;
  isCurrentTurn: boolean;
  gameState: string;
}

export const PlayerCard: React.FC<Props> = ({ player, isMe, isCurrentTurn, gameState }) => {
  const showCharacter = gameState === 'FINISHED' || (!isMe && player.character_name);

  return (
    <div className={`${styles.card} ${isCurrentTurn ? styles.active : ''} ${styles[`slot-${player.slot_index}`]}`}>
      <div className={styles.avatar}>
        {player.username.charAt(0).toUpperCase()}
      </div>
      <div className={styles.info}>
        <span className={styles.name}>{player.username} {isMe && '(You)'}</span>
        <div className={styles.roleBadge}>
          {showCharacter ? player.character_name : '???'}
        </div>
      </div>
      {isCurrentTurn && <div className={styles.turnIndicator}>Thinking...</div>}
    </div>
  );
};