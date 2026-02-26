import type { Player } from '../types/game';

// Finds the next player in the circle based on slot_index
export const getNextPlayerId = (players: Player[], currentId: string): string => {
  const sortedPlayers = [...players].sort((a, b) => a.slot_index - b.slot_index);
  const currentIndex = sortedPlayers.findIndex(p => p.id === currentId);
  const nextIndex = (currentIndex + 1) % sortedPlayers.length;
  return sortedPlayers[nextIndex].id;
};

// Logic for Who Am I: Each player assigns a name to the NEXT player in the circle
// Player 0 -> Assigns for Player 1
// Player 1 -> Assigns for Player 2
// ...
// Player N -> Assigns for Player 0
export const getTargetPlayerId = (players: Player[], currentPlayerId: string): string => {
  const sorted = [...players].sort((a, b) => a.slot_index - b.slot_index);
  const currentIndex = sorted.findIndex(p => p.id === currentPlayerId);
  const targetIndex = (currentIndex + 1) % sorted.length;
  return sorted[targetIndex].id;
};