import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { gameService } from '../services/gameService';
import { getNextPlayerId } from '../utils/gameLogic';
import type { Player, RoomStatus } from '../types/game';

export const useGame = (roomId: string, currentPlayerId: string) => {
  const [gameState, setGameState] = useState<RoomStatus>('LOBBY');
  const [currentTurnId, setCurrentTurnId] = useState<string | null>(null);

  // 1. Sync Game State and Turn
  useEffect(() => {
    const fetchInitialState = async () => {
      const { data } = await supabase
        .from('rooms')
        .select('status, current_turn_player_id')
        .eq('id', roomId)
        .single();
      
      if (data) {
        setGameState(data.status);
        setCurrentTurnId(data.current_turn_player_id);
      }
    };

    fetchInitialState();

    const subscription = supabase
      .channel(`game_loop_${roomId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'rooms', 
        filter: `id=eq.${roomId}` 
      }, (payload) => {
        setGameState(payload.new.status);
        setCurrentTurnId(payload.new.current_turn_player_id);
      })
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, [roomId]);

  // 2. Actions
  const startGame = async () => {
    if (!roomId) return;
    const { error } = await supabase
      .from('rooms')
      .update({ status: 'ASSIGNING' })
      .eq('id', roomId);
    
    if (error) {
      console.error("Error starting game:", error);
      alert("Failed to start game");
    }
  };

  const submitCharacter = async (targetPlayerId: string, characterName: string) => {
    // This adds the character to the target player
    const { error } = await supabase
      .from('players')
      .update({ character_name: characterName })
      .eq('id', targetPlayerId);
    
    if (error) throw error;

    // Check if everyone has a character assigned to move to PLAYING
    const { data: players } = await supabase
      .from('players')
      .select('character_name')
      .eq('room_id', roomId);

    const allAssigned = players?.every(p => p.character_name !== null);
    if (allAssigned) {
      // First player in slot 0 starts
      const { data: firstPlayer } = await supabase
        .from('players')
        .select('id')
        .eq('room_id', roomId)
        .eq('slot_index', 0)
        .single();

      await supabase
        .from('rooms')
        .update({ status: 'PLAYING', current_turn_player_id: firstPlayer?.id })
        .eq('id', roomId);
    }
  };

  const nextTurn = async (allPlayers: Player[]) => {
    if (!currentTurnId) return;
    const nextId = getNextPlayerId(allPlayers, currentTurnId);
    await gameService.updateTurn(roomId, nextId);
  };

  const makeGuess = async (guess: string, actualCharacter: string, allPlayers: Player[]) => {
    const isCorrect = guess.toLowerCase() === actualCharacter.toLowerCase();
    
    if (isCorrect) {
      // Logic for winning can be added here (e.g., set status to FINISHED)
      await supabase
        .from('rooms')
        .update({ status: 'FINISHED' })
        .eq('id', roomId);
      return true;
    } else {
      // Wrong guess, move turn
      await nextTurn(allPlayers);
      return false;
    }
  };

  return {
    gameState,
    currentTurnId,
    isMyTurn: currentTurnId === currentPlayerId,
    startGame,
    submitCharacter,
    nextTurn,
    makeGuess
  };
};