import React from 'react';
import { useGameState } from '../../hooks/useGameState';

export const Menu: React.FC = () => {
  const { gameMode, setGameMode } = useGameState();

  return (
    <nav className="fixed top-0 left-0 p-4">
      {/* Menu implementation */}
    </nav>
  );
};
