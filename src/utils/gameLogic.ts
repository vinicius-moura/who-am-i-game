import type { Player } from '../types/game';

/**
 * Returns the player ID of the person the current player should assign a character to.
 * Ensures a circular assignment: 0 -> 1 -> 2 -> 3 -> 0
 */
export const getTargetPlayerId = (players: Player[], myId: string): string => {
  const sorted = [...players].sort((a, b) => a.slot_index - b.slot_index);
  const myIndex = sorted.findIndex(p => p.id === myId);
  if (myIndex === -1) return '';
  
  const targetIndex = (myIndex + 1) % sorted.length;
  return sorted[targetIndex].id;
};

/**
 * Calculates the next player's ID for turn rotation.
 */
export const getNextTurnPlayerId = (players: Player[], currentId: string): string => {
  const sorted = [...players].sort((a, b) => a.slot_index - b.slot_index);
  const currentIndex = sorted.findIndex(p => p.id === currentId);
  const nextIndex = (currentIndex + 1) % sorted.length;
  return sorted[nextIndex].id;
};