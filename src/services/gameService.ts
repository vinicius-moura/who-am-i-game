import { supabase } from './supabaseClient';
import type { RealtimePayload } from '../types/game';

export const gameService = {
  async submitRole(fromId: string, toId: string, characterName: string): Promise<void> {
    const { error } = await supabase
      .from('role_submissions')
      .insert([{ from_player_id: fromId, to_player_id: toId, character_name: characterName }]);
    if (error) throw error;
  },

  async updateTurn(roomId: string, nextPlayerId: string): Promise<void> {
    const { error } = await supabase
      .from('rooms')
      .update({ current_turn_player_id: nextPlayerId })
      .eq('id', roomId);
    if (error) throw error;
  },

  // Realtime subscription helper
    subscribeToRoomChanges<T>(
        roomId: string, 
        table: string, 
        callback: (payload: RealtimePayload<T>) => void
    ) {
        return supabase
        .channel(`room_changes_${roomId}`)
        .on(
            'postgres_changes', 
            { event: '*', filter: `room_id=eq.${roomId}`, schema: 'public', table: table }, 
            (payload) => callback(payload as RealtimePayload<T>)
        )
        .subscribe();
    }
};