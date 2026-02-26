import { useState, useEffect } from 'react';
import { playerService } from '../services/playerService';
import { gameService } from '../services/gameService';
import type { Player } from '../types/game';

export const usePlayers = (roomId?: string) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    // Initial fetch
    playerService.getPlayers(roomId).then((data) => {
      setPlayers(data);
      setLoading(false);
    });

    // Realtime subscription
    const subscription = gameService.subscribeToRoomChanges<Player>(
      roomId,
      'players',
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setPlayers((prev) => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setPlayers((prev) => prev.map(p => p.id === payload.new.id ? payload.new : p));
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [roomId]);

  return { players, loading };
};