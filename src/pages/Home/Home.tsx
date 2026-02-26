import React, { useState } from 'react';
import { useRoom } from '../../hooks/useRoom';
import type { Player, Room } from '../../types/game';
import styles from './Home.module.scss';

interface HomeProps {
  onJoin: (player: Player, room: Room) => void;
}

export const Home: React.FC<HomeProps> = ({ onJoin }) => {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const { createNewRoom, joinExistingRoom } = useRoom();

  const handleCreate = async () => {
    if (!username.trim()) return;
    try {
      const result = await createNewRoom(username);
      onJoin(result.player, result.room);
    } catch { // Removido o (e)
      alert('Error creating room');
    }
  };

  const handleJoin = async () => {
    if (!username.trim() || !roomCode.trim()) return;
    try {
      const result = await joinExistingRoom(roomCode.toUpperCase(), username);
      onJoin(result.player, result.room);
    } catch {
      alert('Room not found or full');
    }
  };

  return (
    <div className={styles.homeWrapper}>
      <main className={styles.card}>
        <h1>Who Am I?</h1>
        <div className={styles.inputGroup}>
          <label>Your Name</label>
          <input 
            value={username} 
            onChange={e => setUsername(e.target.value)}
            placeholder="Ex: Batman"
          />
        </div>
        
        <div className={styles.actions}>
          <button className={styles.primary} onClick={handleCreate}>Create New Game</button>
          <div className={styles.divider}><span>OR</span></div>
          <div className={styles.joinGroup}>
            <input 
              placeholder="Room Code" 
              value={roomCode} 
              onChange={e => setRoomCode(e.target.value.toUpperCase())} 
            />
            <button onClick={handleJoin}>Join</button>
          </div>
        </div>
      </main>
    </div>
  );
};