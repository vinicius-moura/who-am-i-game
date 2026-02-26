import React, { useState, useEffect } from 'react';
import { useSession } from './hooks/useSession';
import { useRoom } from './hooks/useRoom';
import { Home } from './pages/Home/Home';
import { Lobby } from './pages/Lobby/Lobby';
import { GameRoom } from './pages/Game/GameRoom';

const App: React.FC = () => {
  const { currentPlayer, saveSession } = useSession();
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);
  
  // O hook useRoom monitora o status da sala via Realtime
  const { room } = useRoom(activeRoomCode || undefined);

  // LOG PARA DEBUG
  useEffect(() => {
    if (room) {
      console.log("APP.TSX DEBUG: Current Room Status:", room.status);
    }
  }, [room]);

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

  // Se o status for LOBBY, fica no lobby
  if (room?.status === 'LOBBY') {
    return <Lobby roomCode={activeRoomCode} />;
  }

  // Se o status mudar para QUALQUER outra coisa (ASSIGNING, PLAYING), vai para o GameRoom
  if (room) {
    return <GameRoom roomId={room.id} roomCode={room.code} />;
  }

  return <div>Connecting to room...</div>;
};

export default App;