import { useState, useEffect } from 'react';
import { playerService } from '../services/playerService';
import { supabase } from '../services/supabaseClient';
import type { Player } from '../types/game';

export const usePlayers = (roomId?: string) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId || roomId.length < 30) return;

    const loadPlayers = async () => {
      const data = await playerService.getPlayers(roomId);
      setPlayers(data);
      setLoading(false);
    };

    loadPlayers();

    const channel = supabase
      .channel(`players_channel_${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
        () => {
          playerService.getPlayers(roomId).then(setPlayers);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return { players, loading };
};