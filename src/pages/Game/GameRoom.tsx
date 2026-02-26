import React from 'react';
import { usePlayers } from '../../hooks/usePlayers';
import { useGame } from '../../hooks/useGame';
import { useSession } from '../../hooks/useSession';
import { PlayerCard } from '../../components/game/PlayerCard';
import { ChatPanel } from '../../components/chat/ChatPanel';
import styles from './GameRoom.module.scss';

export const GameRoom: React.FC<{ roomId: string }> = ({ roomId }) => {
  const { currentPlayer } = useSession();
  const { players } = usePlayers(roomId);
  const { gameState, currentTurnId, isMyTurn, makeGuess } = useGame(roomId, currentPlayer?.id || '');

  return (
    <div className={styles.container}>
      <div className={styles.tableArea}>
        {/* Visual Table Layout */}
        <div className={styles.visualTable}>
          {players.map((p) => (
            <PlayerCard 
              key={p.id} 
              player={p} 
              isMe={p.id === currentPlayer?.id}
              isCurrentTurn={p.id === currentTurnId}
              gameState={gameState}
            />
          ))}
          
          <div className={styles.centerConsole}>
            {isMyTurn && gameState === 'PLAYING' && (
              <div className={styles.actions}>
                <h3>Your Turn</h3>
                <input type="text" placeholder="Ask a question..." />
                <button onClick={() => {}}>Ask</button>
                <div className={styles.divider}>OR</div>
                <button className={styles.guessBtn} onClick={() => makeGuess('...', '...', players)}>
                  Make a Guess!
                </button>
              </div>
            )}
            {!isMyTurn && <p>Waiting for other players...</p>}
          </div>
        </div>
      </div>
      
      <div className={styles.sidebar}>
        <ChatPanel roomId={roomId} />
      </div>
    </div>
  );
};