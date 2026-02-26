import { supabase } from './supabaseClient';
import type { RealtimePayload, Message } from '../types/game';

export const chatService = {
  async sendMessage(roomId: string, playerId: string, content: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .insert([{ 
        room_id: roomId, 
        player_id: playerId, 
        content, 
        type: 'CHAT' 
      }]);
    
    if (error) throw error;
  },

  subscribeToMessages(
    roomId: string, 
    callback: (payload: RealtimePayload<Message>) => void
  ) {
    return supabase
      .channel(`chat:${roomId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          filter: `room_id=eq.${roomId}`, 
          schema: 'public', 
          table: 'messages' 
        },
        (payload) => callback(payload as RealtimePayload<Message>)
      )
      .subscribe();
  }
};