import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerCard } from '../PlayerCard';

describe('PlayerCard', () => {
  const mockPlayer = {
    id: '1',
    username: 'Alice',
    slot_index: 0,
    character_name: 'Batman',
    room_id: 'r1',
    is_host: true,
    is_online: true
  };

  it('hides character name for the current player', () => {
    render(<PlayerCard player={mockPlayer} isMe={true} isCurrentTurn={false} gameState="PLAYING" />);
    expect(screen.queryByText('Batman')).toBeNull();
    expect(screen.getByText('???')).toBeDefined();
  });

  it('shows character name for other players', () => {
    render(<PlayerCard player={mockPlayer} isMe={false} isCurrentTurn={false} gameState="PLAYING" />);
    expect(screen.getByText('Batman')).toBeDefined();
  });
});