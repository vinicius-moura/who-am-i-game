import { useState, useEffect, useRef } from 'react';
import { playerService } from '../services/playerService';
import { supabase } from '../services/supabaseClient';
import type { Player } from '../types/game';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export const usePlayers = (roomId?: string) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const isInitialFetched = useRef(false);

  useEffect(() => {
    if (!roomId || roomId.length < 30) return;

    const fetchPlayers = async () => {
      try {
        const data = await playerService.getPlayers(roomId);
        setPlayers(data);
        isInitialFetched.current = true;
      } catch (err) {
        console.error("Error fetching players:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();

    const channelName = `lobby_players_${roomId}_${Math.random().toString(36).substring(7)}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        (payload: RealtimePostgresChangesPayload<Player>) => {
          if (payload.eventType === 'INSERT') {
            const newPlayer = payload.new as Player;
            setPlayers((prev) => {
              if (prev.find(p => p.id === newPlayer.id)) return prev;
              return [...prev, newPlayer];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedPlayer = payload.new as Player;
            setPlayers((prev) => 
              prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p)
            );
          } else if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as Partial<Player>).id;
            setPlayers((prev) => prev.filter(p => p.id !== oldId));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          playerService.getPlayers(roomId).then(setPlayers);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return { players, loading };
};