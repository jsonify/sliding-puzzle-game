import React from 'react';
import { Board } from '../Board/Board';
import { useMultiplayer } from '../../hooks/useMultiplayer';

export const GameRoom: React.FC = () => {
  const { gameState, opponent } = useMultiplayer();

  return (
    <div className="flex gap-8">
      {/* Game room implementation */}
    </div>
  );
};
