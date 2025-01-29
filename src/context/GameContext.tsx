import React, { createContext, useReducer } from 'react';

interface GameState {
  mode: 'single' | 'multi';
  board: Array<Array<{ color: string; isEmpty: boolean }>>;
  // Other game state
}

export const GameContext = createContext<GameState | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <GameContext.Provider value={null}>
      {children}
    </GameContext.Provider>
  );
};
