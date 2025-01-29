import { useContext, useEffect } from 'react';
import { MultiplayerContext } from '../context/MultiplayerContext';
import { socket } from '../services/socket';

export const useMultiplayer = () => {
  const context = useContext(MultiplayerContext);

  if (!context) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider');
  }

  return {
    // Multiplayer state and methods
  };
};
