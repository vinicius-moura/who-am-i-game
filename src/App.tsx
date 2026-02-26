import React, { useState } from 'react';
import { useSession } from './hooks/useSession';
import { useRoom } from './hooks/useRoom';
import { Home } from './pages/Home/Home';
import { Lobby } from './pages/Lobby/Lobby';
import { GameRoom } from './pages/Game/GameRoom';

const App: React.FC = () => {
  const { currentPlayer, saveSession } = useSession();
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);
  const { room } = useRoom(activeRoomCode || undefined);

  // Se não houver jogador ou sala, mostra Home
  if (!currentPlayer || !activeRoomCode) {
    return (
      <Home 
        onJoin={(player, room) => {
          saveSession(player);
          setActiveRoomCode(room.code);
        }} 
      />
    );
  }

  if (room?.status === 'LOBBY') {
    return <Lobby roomCode={activeRoomCode} />;
  }

  return <GameRoom roomId={room?.id || ''} />;
};

export default App;