import React from 'react';

interface TileProps {
  color: string;
  isEmpty: boolean;
  onClick?: () => void;
}

export const Tile: React.FC<TileProps> = ({ color, isEmpty, onClick }) => {
  return (
    <button
      className={`w-full aspect-square rounded-lg ${isEmpty ? 'bg-gray-200' : ''}`}
      style={{ backgroundColor: isEmpty ? undefined : color }}
      onClick={onClick}
    />
  );
};
