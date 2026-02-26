import { useState, useEffect } from 'react';
import { roomService } from '../services/roomService';
import { playerService } from '../services/playerService';
import { gameService } from '../services/gameService';
import { generateRoomCode } from '../utils/roomUtils';
import type { Room } from '../types/game';

export const useRoom = (roomCode?: string) => {
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    if (!roomCode) return;

    roomService.getRoom(roomCode).then(setRoom);

    const subscription = gameService.subscribeToRoomChanges<Room>(
      roomCode, // Note: Simplified, usually needs internal ID
      'rooms',
      (payload) => {
        if (payload.eventType === 'UPDATE') setRoom(payload.new);
      }
    );

    return () => { subscription.unsubscribe(); };
  }, [roomCode]);

  const createNewRoom = async (username: string) => {
    const code = generateRoomCode();
    const newRoom = await roomService.createRoom(code);
    const host = await playerService.createPlayer(newRoom.id, username, true, 0);
    return { room: newRoom, player: host };
  };

  const joinExistingRoom = async (code: string, username: string, currentPlayersCount: number) => {
    const targetRoom = await roomService.getRoom(code);
    if (currentPlayersCount >= targetRoom.max_players) throw new Error('Room is full');
    
    const newPlayer = await playerService.createPlayer(targetRoom.id, username, false, currentPlayersCount);
    return { room: targetRoom, player: newPlayer };
  };

  return { room, createNewRoom, joinExistingRoom };
};