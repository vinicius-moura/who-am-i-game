import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { roomService } from '../services/roomService';
import { playerService } from '../services/playerService';
import { generateRoomCode } from '../utils/roomUtils';
import type { Room } from '../types/game';

export const useRoom = (roomCode?: string) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!roomCode) return;

    const fetchAndSubscribe = async () => {
      try {
        const data = await roomService.getRoom(roomCode);
        setRoom(data);

        // Subscribe to room status changes (LOBBY -> ASSIGNING)
        const channel = supabase
          .channel(`room_sync_${data.id}`)
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${data.id}` },
            (payload) => {
              setRoom(payload.new as Room);
            }
          )
          .subscribe();

        return () => { supabase.removeChannel(channel); };
      } catch (err) {
        console.error("Room sync error:", err);
      }
    };

    fetchAndSubscribe();
  }, [roomCode]);

  const createNewRoom = useCallback(async (username: string) => {
    setLoading(true);
    try {
      const code = generateRoomCode();
      const newRoom = await roomService.createRoom(code);
      const host = await playerService.createPlayer(newRoom.id, username, true, 0);
      return { room: newRoom, player: host };
    } finally {
      setLoading(false);
    }
  }, []);

  const joinExistingRoom = useCallback(async (code: string, username: string) => {
    setLoading(true);
    try {
      const targetRoom = await roomService.getRoom(code);
      // Validar jogadores atuais para definir o slot_index corretamente
      const currentPlayers = await playerService.getPlayers(targetRoom.id);
      
      if (currentPlayers.length >= targetRoom.max_players) {
        throw new Error('Room is full');
      }

      const newPlayer = await playerService.createPlayer(
        targetRoom.id, 
        username, 
        false, 
        currentPlayers.length // Define o próximo slot (0, 1, 2 ou 3)
      );

      return { room: targetRoom, player: newPlayer };
    } finally {
      setLoading(false);
    }
  }, []);

  return { room, loading, createNewRoom, joinExistingRoom };
};