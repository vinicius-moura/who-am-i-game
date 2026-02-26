export type RoomStatus = 'LOBBY' | 'ASSIGNING' | 'PLAYING' | 'FINISHED';
export type ResponseType = 'YES' | 'NO' | 'MAYBE' | 'UNKNOWN';

export interface Player {
  id: string;
  room_id: string;
  username: string;
  is_host: boolean;
  is_online: boolean;
  slot_index: number;
  target_player_id?: string | null;
  character_name?: string | null;
}

export interface Room {
  id: string;
  code: string;
  status: RoomStatus;
  max_players: number;
  current_turn_player_id?: string | null;
}

// Type for Realtime Payloads from Supabase
export interface RealtimePayload<T> {
  commit_timestamp: string;
  errors: string[] | null;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: Partial<T>;
  schema: string;
  table: string;
}

export interface Message {
  id: string;
  room_id: string;
  player_id: string;
  content: string;
  type: 'CHAT' | 'SYSTEM';
  created_at: string;
}