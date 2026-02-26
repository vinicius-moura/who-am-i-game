import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gameService } from '../gameService';

const { mocks } = vi.hoisted(() => ({
  mocks: {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ error: null }),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ error: null }),
    channel: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  }
}));

vi.mock('../supabaseClient', () => ({
  supabase: mocks
}));

describe('gameService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should submit a role', async () => {
    await gameService.submitRole('p1', 'p2', 'Hero');
    expect(mocks.from).toHaveBeenCalledWith('role_submissions');
  });

  it('should update turn', async () => {
    await gameService.updateTurn('r1', 'p2');
    expect(mocks.from).toHaveBeenCalledWith('rooms');
    expect(mocks.update).toHaveBeenCalledWith({ current_turn_player_id: 'p2' });
  });
});