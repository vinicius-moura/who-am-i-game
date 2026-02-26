import React from 'react';
import { useRoom } from '../../hooks/useRoom';
import { usePlayers } from '../../hooks/usePlayers';
import { useGame } from '../../hooks/useGame';
import { useSession } from '../../hooks/useSession';
import styles from './Lobby.module.scss';

export const Lobby: React.FC<{ roomCode: string }> = ({ roomCode }) => {
  const { room } = useRoom(roomCode);
  const { players, loading } = usePlayers(room?.id);
  const { currentPlayer } = useSession();
  const { startGame } = useGame(room?.id, currentPlayer?.id || '');

  if (loading || !room) return <div className={styles.lobby}>Loading Players...</div>;

  return (
    <div className={styles.lobby}>
      <header>
        <h2>Room Code</h2>
        <h1 className={styles.code}>{room.code}</h1>
      </header>

      <div className={styles.playerList}>
        {players.map(p => (
          <div key={p.id} className={styles.playerItem}>
            <span className={styles.avatar}>{p.username.charAt(0)}</span>
            <span className={styles.name}>{p.username}</span>
            {p.is_host && <span className={styles.hostBadge}>👑 Host</span>}
          </div>
        ))}
        {Array.from({ length: 4 - players.length }).map((_, i) => (
          <div key={i} className={styles.emptySlot}>Waiting...</div>
        ))}
      </div>

      <div className={styles.footer}>
        <p>{players.length} / 4 Players Joined</p>
        
        {currentPlayer?.is_host ? (
          <button 
            disabled={players.length < 2} 
            onClick={startGame}
            className={styles.startBtn}
          >
            {players.length < 2 ? 'Need 2+ Players' : 'Start Game'}
          </button>
        ) : (
          <p className={styles.waitingMsg}>Waiting for host...</p>
        )}
      </div>
    </div>
  );
};