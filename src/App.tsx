import React from 'react';
import { GameProvider } from './context/GameContext';
import { MultiplayerProvider } from './context/MultiplayerContext';
import { Board } from './components/Board/Board';
import { Menu } from './components/GameControls/Menu';

export const App: React.FC = () => {
  return (
    <GameProvider>
      <MultiplayerProvider>
        <div className="min-h-screen bg-gray-100">
          <Menu />
          {/* Main app layout */}
        </div>
      </MultiplayerProvider>
    </GameProvider>
  );
};
