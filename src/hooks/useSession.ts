import { useState } from 'react';
import type { Player } from '../types/game';

const STORAGE_KEY = 'who_am_i_session';

export const useSession = () => {
  // Lazy Initializer: This function runs only once during the initial mount
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to parse session storage', error);
      return null;
    }
  });

  const saveSession = (player: Player) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(player));
    setCurrentPlayer(player);
  };

  const clearSession = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setCurrentPlayer(null);
  };

  return { 
    currentPlayer, 
    saveSession, 
    clearSession, 
    isHost: currentPlayer?.is_host ?? false 
  };
};