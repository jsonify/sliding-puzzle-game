import React from 'react';
import { Board } from './Board';

export const SolutionBoard: React.FC = () => {
  return (
    <div className="w-1/2">
      <h2 className="text-xl font-bold mb-4">Solution</h2>
      <Board mode="solution" />
    </div>
  );
};
