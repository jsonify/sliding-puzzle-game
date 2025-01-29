const COLORS = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEEAD', // Yellow
    '#D4A5A5'  // Pink
];

const GRID_SIZE = 5;
const EMPTY_POSITION = { row: 4, col: 4 };
let currentEmptyPos = { ...EMPTY_POSITION };
let board = [];
let solutionPattern = [];

function createColorPattern() {
    const tiles = [];
    // Create 4 tiles of each color (except last color which gets 3 + empty)
    for (let colorIndex = 0; colorIndex < COLORS.length - 1; colorIndex++) {
        for (let i = 0; i < 4; i++) {
            tiles.push({ color: COLORS[colorIndex], isEmpty: false });
        }
    }
    // Add 4 tiles of the last color
    for (let i = 0; i < 4; i++) {
        tiles.push({ color: COLORS[COLORS.length - 1], isEmpty: false });
    }
    // Add empty tile
    tiles.push({ color: '#e5e7eb', isEmpty: true });
    return tiles;
}

function shuffleTiles(tiles) {
    const shuffled = [...tiles];
    for (let i = shuffled.length - 2; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function createBoard(tiles) {
    const board = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        board.push(tiles.slice(i * GRID_SIZE, (i + 1) * GRID_SIZE));
    }
    return board;
}

function canMoveTile(row, col) {
    return (row === currentEmptyPos.row || col === currentEmptyPos.col) &&
           !(row === currentEmptyPos.row && col === currentEmptyPos.col);
}

function moveTile(row, col) {
    if (!canMoveTile(row, col)) return;

    const newBoard = board.map(row => [...row]);

    if (row === currentEmptyPos.row) {
        // Move horizontally
        const direction = col < currentEmptyPos.col ? 1 : -1;
        for (let c = currentEmptyPos.col; c !== col; c -= direction) {
            newBoard[row][c] = newBoard[row][c - direction];
        }
    } else {
        // Move vertically
        const direction = row < currentEmptyPos.row ? 1 : -1;
        for (let r = currentEmptyPos.row; r !== row; r -= direction) {
            newBoard[r][col] = newBoard[r - direction][col];
        }
    }

    // Place empty tile in the clicked position
    newBoard[row][col] = { color: '#e5e7eb', isEmpty: true };
    board = newBoard;
    currentEmptyPos = { row, col };

    renderBoard();
    checkWin();
}

function checkWin() {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (board[row][col].color !== solutionPattern[row][col].color) {
                return false;
            }
        }
    }
    
    // Create and show win modal
    const modal = document.createElement('div');
    modal.className = 'win-modal';
    modal.innerHTML = `
        <div class="win-modal-content">
            <h2>Congratulations! 🎉</h2>
            <p>You solved the puzzle!</p>
            <button onclick="randomizeGame(); document.body.removeChild(this.parentElement.parentElement)">
                Start New Game
            </button>
        </div>
    `;
    document.body.appendChild(modal);
    return true;
}

function renderBoard() {
    const puzzleBoard = document.getElementById('puzzle-board');
    puzzleBoard.innerHTML = '';

    board.forEach((row, rowIndex) => {
        row.forEach((tile, colIndex) => {
            const tileElement = document.createElement('button');
            tileElement.className = `tile ${tile.isEmpty ? 'empty' : ''}`;
            tileElement.style.backgroundColor = tile.color;
            
            if (!tile.isEmpty) {
                tileElement.onclick = () => moveTile(rowIndex, colIndex);
                if (!canMoveTile(rowIndex, colIndex)) {
                    tileElement.classList.add('disabled');
                }
            }
            
            puzzleBoard.appendChild(tileElement);
        });
    });
}

function renderSolutionBoard() {
    const solutionBoard = document.getElementById('solution-board');
    solutionBoard.innerHTML = '';

    solutionPattern.forEach(row => {
        row.forEach(tile => {
            const tileElement = document.createElement('div');
            tileElement.className = 'solution-tile';
            tileElement.style.backgroundColor = tile.color;
            solutionBoard.appendChild(tileElement);
        });
    });
}

function solveAllButLast() {
    // Set the board to match the solution pattern
    board = solutionPattern.map(row => row.map(tile => ({ ...tile })));
    
    // Move empty tile to the last position
    board[EMPTY_POSITION.row][EMPTY_POSITION.col] = { color: '#e5e7eb', isEmpty: true };
    currentEmptyPos = { ...EMPTY_POSITION };
    
    // Swap the last two non-empty tiles
    const lastRow = GRID_SIZE - 1;
    const secondLastCol = GRID_SIZE - 2;
    const thirdLastCol = GRID_SIZE - 3;
    
    [board[lastRow][thirdLastCol], board[lastRow][secondLastCol]] = 
    [board[lastRow][secondLastCol], board[lastRow][thirdLastCol]];
    
    renderBoard();
}

function randomizeGame() {
    // Create and shuffle tiles for both boards
    const tiles = createColorPattern();
    const shuffledMainTiles = shuffleTiles(tiles);
    const shuffledSolutionTiles = shuffleTiles(tiles);

    // Create boards from shuffled tiles
    board = createBoard(shuffledMainTiles);
    solutionPattern = createBoard(shuffledSolutionTiles);

    // Find empty tile position in main board
    board.forEach((row, rowIndex) => {
        row.forEach((tile, colIndex) => {
            if (tile.isEmpty) {
                currentEmptyPos = { row: rowIndex, col: colIndex };
            }
        });
    });

    // Render both boards
    renderBoard();
    renderSolutionBoard();
}

function initializeGame() {
    randomizeGame();
}

// Event Listeners
document.getElementById('randomize').addEventListener('click', randomizeGame);
document.getElementById('solveAllButLast').addEventListener('click', solveAllButLast);

// Initialize the game
window.addEventListener('DOMContentLoaded', initializeGame);
