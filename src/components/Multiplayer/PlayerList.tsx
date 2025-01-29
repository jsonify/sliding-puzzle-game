import React from 'react';
import { useMultiplayer } from '../../hooks/useMultiplayer';

export const PlayerList: React.FC = () => {
  const { players, challengePlayer } = useMultiplayer();

  return (
    <div className="w-64 bg-white rounded-lg p-4">
      {/* Player list implementation */}
    </div>
  );
};
