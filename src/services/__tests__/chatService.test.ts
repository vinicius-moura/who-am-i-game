import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatService } from '../chatService';

const { mocks } = vi.hoisted(() => ({
  mocks: {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ error: null }),
    channel: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  }
}));

vi.mock('../supabaseClient', () => ({
  supabase: mocks
}));

describe('chatService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should send a message', async () => {
    await chatService.sendMessage('room1', 'player1', 'Hello');
    
    expect(mocks.from).toHaveBeenCalledWith('messages');
    expect(mocks.insert).toHaveBeenCalled();
  });

  it('should subscribe to messages', () => {
    const cb = vi.fn();
    chatService.subscribeToMessages('room1', cb);
    
    expect(mocks.channel).toHaveBeenCalled();
    expect(mocks.on).toHaveBeenCalled();
  });
});