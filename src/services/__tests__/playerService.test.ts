import { describe, it, expect, vi, beforeEach } from 'vitest';
import { playerService } from '../playerService';

const { mocks } = vi.hoisted(() => ({
  mocks: {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(),
  }
}));

vi.mock('../supabaseClient', () => ({
  supabase: mocks
}));

describe('playerService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should create a player', async () => {
    vi.mocked(mocks.single).mockResolvedValue({ data: { username: 'Bob' }, error: null });
    const player = await playerService.createPlayer('id', 'Bob', true, 0);
    expect(player.username).toBe('Bob');
    expect(mocks.from).toHaveBeenCalledWith('players');
  });

  it('should get all players', async () => {
    vi.mocked(mocks.order).mockResolvedValue({ data: [{ username: 'A' }], error: null });
    const players = await playerService.getPlayers('id');
    expect(players).toHaveLength(1);
    expect(mocks.order).toHaveBeenCalledWith('slot_index', { ascending: true });
  });
});