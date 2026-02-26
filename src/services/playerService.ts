import { supabase } from './supabaseClient';
import type { Player } from '../types/game';

export const playerService = {
  async createPlayer(roomId: string, username: string, isHost: boolean, slotIndex: number): Promise<Player> {
    const { data, error } = await supabase
      .from('players')
      .insert([{ room_id: roomId, username, is_host: isHost, slot_index: slotIndex }])
      .select()
      .single();
    if (error) throw error;
    return data as Player;
  },

  async getPlayers(roomId: string): Promise<Player[]> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomId)
      .order('slot_index', { ascending: true });
    if (error) throw error;
    return (data as Player[]) || [];
  }
};