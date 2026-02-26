import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ someClientInstance: true }))
}));

describe('supabaseClient', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('throws an error if environment variables are missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    await expect(import('../supabaseClient')).rejects.toThrow('Missing Supabase environment variables');
  });

  it('initializes correctly when environment variables are present', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'some-key');

    const { supabase } = await import('../supabaseClient');
    const { createClient } = await import('@supabase/supabase-js');

    expect(createClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'some-key'
    );
    expect(supabase).toBeDefined();
  });
});