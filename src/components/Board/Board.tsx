import React from 'react';
import { Tile } from './Tile';
import { useGameState } from '../../hooks/useGameState';

interface BoardProps {
  mode: 'main' | 'opponent' | 'solution';
}

export const Board: React.FC<BoardProps> = ({ mode }) => {
  const { board, handleTileClick } = useGameState();
  
  return (
    <div className="grid grid-cols-5 gap-2">
      {/* Board implementation */}
    </div>
  );
};
