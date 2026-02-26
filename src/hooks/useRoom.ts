import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { roomService } from '../services/roomService';
import { playerService } from '../services/playerService';
import { generateRoomCode } from '../utils/roomUtils';
import type { Room } from '../types/game';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export const useRoom = (roomCode?: string) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Synchronize room data and listen for status changes
  useEffect(() => {
    if (!roomCode) return;

    const fetchAndSubscribe = async () => {
      setLoading(true);
      try {
        const data = await roomService.getRoom(roomCode);
        setRoom(data);

        // Subscribe to changes for this specific room
        const channel = supabase
          .channel(`room_sync_${data.id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'rooms',
              filter: `id=eq.${data.id}`,
            },
            (payload: RealtimePostgresChangesPayload<Room>) => {
              setRoom(payload.new as Room);
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        setError('Room not found');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSubscribe();
  }, [roomCode]);

  /**
   * Creates a new room and sets the creator as Host
   */
  const createNewRoom = useCallback(async (username: string) => {
    setLoading(true);
    try {
      const code = generateRoomCode();
      const newRoom = await roomService.createRoom(code);
      
      // Create the host player in slot 0
      const hostPlayer = await playerService.createPlayer(newRoom.id, username, true, 0);
      
      return { room: newRoom, player: hostPlayer };
    } catch (err) {
      console.error('Failed to create room:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Joins an existing room after validating capacity
   */
  const joinExistingRoom = useCallback(async (code: string, username: string) => {
    setLoading(true);
    try {
      const targetRoom = await roomService.getRoom(code);
      
      // Fetch current players to check capacity and determine next slot
      const players = await playerService.getPlayers(targetRoom.id);
      
      if (players.length >= targetRoom.max_players) {
        throw new Error('Room is full');
      }

      // Check if username is already taken in this room
      if (players.some(p => p.username.toLowerCase() === username.toLowerCase())) {
        throw new Error('Username already taken in this room');
      }

      const newPlayer = await playerService.createPlayer(
        targetRoom.id, 
        username, 
        false, 
        players.length
      );

      return { room: targetRoom, player: newPlayer };
    } catch (err) {
      console.error('Failed to join room:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    room,
    loading,
    error,
    createNewRoom,
    joinExistingRoom
  };
};