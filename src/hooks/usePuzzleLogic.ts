import { useState } from 'react';
import { createBoard, isSolved } from '../services/gameLogic';

export const usePuzzleLogic = () => {
  const [board, setBoard] = useState(() => createBoard());

  return {
    board,
    moveTile: () => {},
    checkWin: () => {},
    resetBoard: () => {},
  };
};
