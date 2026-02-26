import { supabase } from './supabaseClient';
import type { Room } from '../types/game';

export const roomService = {
  async createRoom(code: string, maxPlayers: number = 4): Promise<Room> {
    const { data, error } = await supabase
      .from('rooms')
      .insert([{ code, max_players: maxPlayers }])
      .select()
      .single();
    if (error) throw error;
    return data as Room;
  },

  async getRoom(code: string): Promise<Room> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .single();
    if (error) throw error;
    return data as Room;
  }
};