import React from 'react';
import { useSession } from '../../hooks/useSession';
import { useRoom } from '../../hooks/useRoom';
import { usePlayers } from '../../hooks/usePlayers';
import { useGame } from '../../hooks/useGame';
import { PlayerCard } from '../../components/game/PlayerCard';
import { ChatPanel } from '../../components/chat/ChatPanel';
import { RoleAssignment } from '../../components/game/RoleAssignment';
import styles from './GameRoom.module.scss';

interface GameRoomProps {
  roomId: string;
  roomCode: string;
}

export const GameRoom: React.FC<GameRoomProps> = ({ roomId, roomCode }) => {
  const { currentPlayer } = useSession();
  const { room, loading: roomLoading } = useRoom(roomCode);
  const { players, loading: playersLoading } = usePlayers(roomId);
  const { submitCharacterForTarget, passTurn } = useGame(roomId, currentPlayer?.id || '');

  const isLoading = roomLoading || playersLoading || !room || !currentPlayer;

  if (isLoading) {
    return <div className={styles.loading}>Loading match...</div>;
  }

  // Phase 1: Assigning characters to each other
  if (room.status === 'ASSIGNING') {
    return (
      <div className={styles.assignmentOverlay}>
        <RoleAssignment 
          players={players} 
          myId={currentPlayer.id} 
          onConfirm={submitCharacterForTarget} 
        />
      </div>
    );
  }

  // Phase 2: Playing the game
  const isMyTurn = room.current_turn_player_id === currentPlayer.id;

  return (
    <div className={styles.container}>
      <main className={styles.tableArea}>
        <div className={styles.visualTable}>
          {players.map((player) => (
            <PlayerCard 
              key={player.id}
              player={player}
              isMe={player.id === currentPlayer.id}
              isCurrentTurn={player.id === room.current_turn_player_id}
              gameState={room.status}
            />
          ))}

          <div className={styles.centerConsole}>
            {room.status === 'PLAYING' ? (
              <>
                <h3>{isMyTurn ? "It's your turn!" : "Waiting for turn..."}</h3>
                {isMyTurn ? (
                  <div className={styles.turnActions}>
                    <p>Ask a Yes/No question in the chat</p>
                    <button 
                      className={styles.passBtn} 
                      onClick={() => passTurn(players, currentPlayer.id)}
                    >
                      End My Turn
                    </button>
                  </div>
                ) : (
                  <p>Pay attention to the questions!</p>
                )}
              </>
            ) : (
              <div className={styles.finished}>
                <h2>Game Over!</h2>
                <button onClick={() => window.location.reload()}>Play Again</button>
              </div>
            )}
          </div>
        </div>
      </main>

      <aside className={styles.sidebar}>
        <div className={styles.roomInfo}>
          <span>Room: <strong>{room.code}</strong></span>
        </div>
        <ChatPanel roomId={roomId} />
      </aside>
    </div>
  );
};