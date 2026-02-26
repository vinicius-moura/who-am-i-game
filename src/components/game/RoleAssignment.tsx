import React, { useState } from 'react';
import { getTargetPlayerId } from '../../utils/gameLogic';
import type { Player } from '../../types/game';
import styles from './RoleAssignment.module.scss';

interface Props {
  players: Player[];
  myId: string;
  onConfirm: (targetId: string, name: string) => void;
}

export const RoleAssignment: React.FC<Props> = ({ players, myId, onConfirm }) => {
  const [name, setName] = useState('');
  const targetId = getTargetPlayerId(players, myId);
  const targetPlayer = players.find(p => p.id === targetId);
  const me = players.find(p => p.id === myId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return;
    onConfirm(targetId, name.trim());
  };

  if (me?.character_name) {
    return (
      <div className={styles.waiting}>
        <h3>Character submitted!</h3>
        <p>Waiting for other players to finish...</p>
      </div>
    );
  }

  return (
    <div className={styles.assignmentBox}>
      <h2>Assign a Character</h2>
      <p>You are choosing for: <strong>{targetPlayer?.username}</strong></p>
      <form onSubmit={handleSubmit}>
        <input 
          value={name} 
          onChange={e => setName(e.target.value)} 
          placeholder="Ex: Spider-Man, Cleopatra..."
          autoFocus
        />
        <button type="submit" disabled={!name.trim()}>Confirm Character</button>
      </form>
    </div>
  );
};