import React, { createContext } from 'react';

interface MultiplayerState {
  room: string | null;
  players: Array<{ id: string; username: string }>;
  // Other multiplayer state
}

export const MultiplayerContext = createContext<MultiplayerState | null>(null);

export const MultiplayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MultiplayerContext.Provider value={null}>
      {children}
    </MultiplayerContext.Provider>
  );
};
