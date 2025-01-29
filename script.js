const socket = io();
let currentRoom = null;
let isGameActive = false;
let currentUsername = '';
let currentGameMode = null;

function toggleMenu() {
    const menuButton = document.querySelector('.menu-toggle');
    const sideMenu = document.querySelector('.side-menu');
    const isMenuOpen = sideMenu.classList.toggle('active');
    
    // Hide/show the hamburger button based on menu state
    menuButton.style.display = isMenuOpen ? 'none' : 'block';
}

function selectGameMode(mode) {
    currentGameMode = mode;
    const menuButton = document.querySelector('.menu-toggle');
    const sideMenu = document.querySelector('.side-menu');
    
    // Hide menu and show menu button
    sideMenu.classList.remove('active');
    menuButton.style.display = 'block';
    
    // Reset game state
    const loginContainer = document.getElementById('login-container');
    const gameContainer = document.getElementById('game-container');
    const singlePlayerMode = document.getElementById('single-player-mode');
    const multiPlayerMode = document.getElementById('multi-player-mode');
    const playerList = document.getElementById('playerList');
    const gameStatus = document.getElementById('gameStatus');
    
    if (mode === 'single') {
        loginContainer.style.display = 'none';
        gameContainer.style.display = 'block';
        singlePlayerMode.style.display = 'block';
        multiPlayerMode.style.display = 'none';
        playerList.style.display = 'none';
        gameStatus.style.display = 'none';
        document.querySelector('.solution-container').style.display = 'block';
        initializeGame();
    } else {
        loginContainer.style.display = 'block';
        gameContainer.style.display = 'none';
        singlePlayerMode.style.display = 'none';
        multiPlayerMode.style.display = 'block';
        playerList.style.display = 'block';
        gameStatus.style.display = 'block';
        document.querySelector('.solution-container').style.display = 'block';
    }
}

function setUsername() {
    const usernameInput = document.getElementById('username');
    const username = usernameInput.value.trim();
    
    if (username) {
        currentUsername = username;
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        socket.emit('setUsername', username);
    }
}

function updatePlayerList(players) {
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = '';
    
    players.forEach(([playerId, playerData]) => {
        if (playerId !== socket.id) {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';
            playerItem.innerHTML = `
                <span>${playerData.username}</span>
                <button onclick="challengePlayer('${playerId}')">Challenge</button>
            `;
            playerList.appendChild(playerItem);
        }
    });
}

function challengePlayer(playerId) {
    socket.emit('challengePlayer', playerId);
    document.getElementById('gameStatus').textContent = 'Challenge sent...';
}

function acceptChallenge(challengerId, roomId) {
    socket.emit('acceptChallenge', { challengerId, roomId });
    // Remove the challenge modal
    const modal = document.querySelector('.win-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

function declineChallenge(challengerId, modalElement) {
    socket.emit('declineChallenge', challengerId);
    // Remove the challenge modal
    document.body.removeChild(modalElement);
}

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
    
    // Broadcast move to opponent if in multiplayer game
    if (isGameActive && currentRoom) {
        socket.emit('moveMade', {
            roomId: currentRoom,
            board: board
        });
    }
    
    if (checkWin() && isGameActive) {
        handleWin();
    }
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
            <button onclick="startNewGame(this)">Start New Game</button>
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

function findGame() {
    document.getElementById('findGame').disabled = true;
    document.getElementById('gameStatus').textContent = 'Finding opponent...';
    socket.emit('findGame');
}

function startGame(gameState) {
    isGameActive = true;
    currentRoom = gameState.roomId;
    document.getElementById('gameStatus').textContent = 'Game Started!';
    document.getElementById('solveAllButLast').disabled = false;
    
    // Initialize boards with provided game state
    board = gameState.board;
    solutionPattern = gameState.solution;
    
    // Find empty position
    board.forEach((row, rowIndex) => {
        row.forEach((tile, colIndex) => {
            if (tile.isEmpty) {
                currentEmptyPos = { row: rowIndex, col: colIndex };
            }
        });
    });
    
    renderBoard();
    renderSolutionBoard();
    renderOpponentBoard(gameState.board);
}

function renderOpponentBoard(opponentBoard) {
    const opponentBoardElement = document.getElementById('opponent-board');
    opponentBoardElement.innerHTML = '';

    opponentBoard.forEach(row => {
        row.forEach(tile => {
            const tileElement = document.createElement('div');
            tileElement.className = `tile ${tile.isEmpty ? 'empty' : ''}`;
            tileElement.style.backgroundColor = tile.color;
            opponentBoardElement.appendChild(tileElement);
        });
    });
}

function handleWin() {
    if (isGameActive && currentRoom) {
        socket.emit('gameWon', currentRoom);
    }
}

function randomizeGame() {
    initializeGame();
}

function initializeGame() {
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

// Socket.IO Event Listeners
socket.on('playerList', (players) => {
    updatePlayerList(players);
});

socket.on('challengeReceived', (data) => {
    const modal = document.createElement('div');
    modal.className = 'win-modal';
    modal.innerHTML = `
        <div class="win-modal-content">
            <h2>Challenge Received!</h2>
            <p>${data.challengerName} wants to play with you!</p>
            <button onclick="acceptChallenge('${data.challengerId}', '${data.roomId}')">Accept</button>
            <button onclick="declineChallenge('${data.challengerId}', this.parentElement.parentElement)">Decline</button>
        </div>
    `;
    document.body.appendChild(modal);
});

socket.on('challengeDeclined', (challengerId) => {
    document.getElementById('gameStatus').textContent = 'Challenge declined!';
});

socket.on('waiting', () => {
    document.getElementById('gameStatus').textContent = 'Waiting for opponent...';
});

socket.on('gameStart', (gameState) => {
    startGame(gameState);
});

socket.on('opponentMove', (data) => {
    renderOpponentBoard(data.board);
});

socket.on('gameOver', (data) => {
    const isWinner = data.winnerId === socket.id;
    const modal = document.createElement('div');
    modal.className = 'win-modal';
    modal.innerHTML = `
        <div class="win-modal-content">
            <h2>${isWinner ? 'You Won! 🎉' : 'Opponent Won!'}</h2>
            <p>Game completed in ${((data.endTime - data.startTime) / 1000).toFixed(2)} seconds</p>
            <button onclick="location.reload()">Play Again</button>
        </div>
    `;
    document.body.appendChild(modal);
});

socket.on('playerDisconnected', () => {
    document.getElementById('gameStatus').textContent = 'Opponent disconnected!';
    isGameActive = false;
});

// Event Listeners
document.getElementById('findGame').addEventListener('click', findGame);
document.getElementById('solveAllButLast').addEventListener('click', solveAllButLast);
document.getElementById('randomize')?.addEventListener('click', () => {
    if (currentGameMode === 'single') {
        randomizeGame();
    }
});

function startNewGame(buttonElement) {
    // Remove the modal
    const modal = buttonElement.parentElement.parentElement;
    document.body.removeChild(modal);
    
    // Start a new randomized game
    randomizeGame();
}

// Initialize the game
window.addEventListener('DOMContentLoaded', () => {
    // Start in single player mode by default
    selectGameMode('single');
});
