import { useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { getNextTurnPlayerId } from '../utils/gameLogic';
import type { Player } from '../types/game';

export const useGame = (roomId: string | undefined, myId: string) => {
  
  const startGame = useCallback(async () => {
    // Verificação Crítica: O ID da sala deve ser um UUID válido
    if (!roomId || roomId.length < 10) {
      console.error("DEBUG: StartGame failed - roomId is invalid:", roomId);
      return;
    }

    console.log("DEBUG: Attempting to update room status to ASSIGNING for room:", roomId);

    const { data, error } = await supabase
      .from('rooms')
      .update({ status: 'ASSIGNING' })
      .eq('id', roomId)
      .select();

    if (error) {
      console.error("DEBUG: Supabase Update Error:", error.message);
      alert("Database error: " + error.message);
    } else {
      console.log("DEBUG: Database updated successfully:", data);
    }
  }, [roomId]);

  const submitCharacterForTarget = useCallback(async (targetId: string, characterName: string) => {
    if (!roomId) return;
    const { error } = await supabase
      .from('players')
      .update({ character_name: characterName })
      .eq('id', targetId);
    if (error) throw error;

    const { data: players } = await supabase
      .from('players')
      .select('character_name')
      .eq('room_id', roomId);

    if (players?.every(p => p.character_name !== null)) {
      const { data: first } = await supabase
        .from('players')
        .select('id')
        .eq('room_id', roomId)
        .eq('slot_index', 0)
        .single();

      await supabase
        .from('rooms')
        .update({ status: 'PLAYING', current_turn_player_id: first?.id })
        .eq('id', roomId);
    }
  }, [roomId]);

  const passTurn = useCallback(async (allPlayers: Player[], currentTurnId: string) => {
    if (!roomId || myId !== currentTurnId) return;
    const nextId = getNextTurnPlayerId(allPlayers, currentTurnId);
    await supabase
      .from('rooms')
      .update({ current_turn_player_id: nextId })
      .eq('id', roomId);
  }, [roomId, myId]);

  return { startGame, submitCharacterForTarget, passTurn };
};