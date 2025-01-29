const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, '/')));

const rooms = new Map();
const MAX_PLAYERS_PER_ROOM = 2;
const connectedPlayers = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('setUsername', (username) => {
        connectedPlayers.set(socket.id, {
            username: username,
            status: 'available'
        });
        io.emit('playerList', Array.from(connectedPlayers.entries()));
    });

    socket.on('findGame', () => {
        let joinedRoom = false;
        
        // Try to join an existing room
        for (const [roomId, room] of rooms.entries()) {
            if (room.players.length < MAX_PLAYERS_PER_ROOM) {
                socket.join(roomId);
                room.players.push(socket.id);
                joinedRoom = true;
                
                if (room.players.length === MAX_PLAYERS_PER_ROOM) {
                    // Start the game when room is full
                    const gameState = {
                        tiles: createInitialTiles(),
                        players: room.players,
                        startTime: Date.now()
                    };
                    io.to(roomId).emit('gameStart', gameState);
                } else {
                    socket.emit('waiting');
                }
                break;
            }
        }

        // Create new room if couldn't join existing one
        if (!joinedRoom) {
            const roomId = 'room_' + Date.now();
            socket.join(roomId);
            rooms.set(roomId, {
                players: [socket.id],
                gameState: null
            });
            socket.emit('waiting');
        }
    });

    socket.on('challengePlayer', (challengedPlayerId) => {
        const challenger = connectedPlayers.get(socket.id);
        const challenged = connectedPlayers.get(challengedPlayerId);
        
        if (challenged && challenged.status === 'available') {
            // Create a new room for the challenge
            const roomId = 'room_' + Date.now();
            socket.join(roomId);
            io.to(challengedPlayerId).emit('challengeReceived', {
                challengerId: socket.id,
                challengerName: challenger.username,
                roomId: roomId
            });
        }
    });

    socket.on('acceptChallenge', (data) => {
        const { challengerId, roomId } = data;
        socket.join(roomId);
        
        // Start the game
        const initialTiles = createInitialTiles();
        const gameState = {
            roomId: roomId,
            board: initialTiles.board,
            solution: initialTiles.solution,
            players: [challengerId, socket.id],
            startTime: Date.now()
        };
        
        rooms.set(roomId, {
            players: [challengerId, socket.id],
            gameState: gameState
        });
        
        io.to(roomId).emit('gameStart', gameState);
    });

    socket.on('declineChallenge', (challengerId) => {
        io.to(challengerId).emit('challengeDeclined', socket.id);
    });

    socket.on('moveMade', (data) => {
        // Broadcast the move to everyone in the room except the sender
        socket.to(data.roomId).emit('opponentMove', {
            playerId: socket.id,
            board: data.board
        });
    });

    socket.on('gameWon', (roomId) => {
        io.to(roomId).emit('gameOver', {
            winnerId: socket.id,
            endTime: Date.now()
        });
        // Clean up room
        rooms.delete(roomId);
    });

    socket.on('disconnect', () => {
        // Remove from connected players
        connectedPlayers.delete(socket.id);
        io.emit('playerList', Array.from(connectedPlayers.entries()));
        
        // Handle disconnection and clean up rooms
        for (const [roomId, room] of rooms.entries()) {
            const playerIndex = room.players.indexOf(socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                io.to(roomId).emit('playerDisconnected');
                if (room.players.length === 0) {
                    rooms.delete(roomId);
                }
            }
        }
    });
});

function createInitialTiles() {
    const tiles = [];
    const COLORS = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5'
    ];
    const GRID_SIZE = 5;
    
    // Create 4 tiles of each color
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
    
    // Shuffle tiles and create boards
    const shuffledTiles = [...tiles].sort(() => Math.random() - 0.5);
    const solutionTiles = [...tiles].sort(() => Math.random() - 0.5);
    
    // Create boards
    const board = [];
    const solution = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        board.push(shuffledTiles.slice(i * GRID_SIZE, (i + 1) * GRID_SIZE));
        solution.push(solutionTiles.slice(i * GRID_SIZE, (i + 1) * GRID_SIZE));
    }
    
    return {
        board: board,
        solution: solution
    };
}

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
