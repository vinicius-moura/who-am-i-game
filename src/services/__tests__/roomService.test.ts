import { describe, it, expect, vi, beforeEach } from 'vitest';
import { roomService } from '../roomService';

const { mocks } = vi.hoisted(() => ({
  mocks: {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  }
}));

vi.mock('../supabaseClient', () => ({
  supabase: mocks
}));

describe('roomService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should create a room', async () => {
    vi.mocked(mocks.single).mockResolvedValue({ data: { code: 'ABC' }, error: null });

    const room = await roomService.createRoom('ABC');
    
    expect(room.code).toBe('ABC');
    expect(mocks.from).toHaveBeenCalledWith('rooms');
  });

  it('should get a room by code', async () => {
    vi.mocked(mocks.single).mockResolvedValue({ data: { code: 'XYZ' }, error: null });
    
    const room = await roomService.getRoom('XYZ');
    
    expect(room.code).toBe('XYZ');
    expect(mocks.eq).toHaveBeenCalledWith('code', 'XYZ');
  });
});