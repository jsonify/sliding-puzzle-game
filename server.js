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

    socket.on('moveMade', (data) => {
        socket.broadcast.to(data.roomId).emit('opponentMove', {
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
    // This should match your client-side tile creation logic
    // Return the initial game state
    return {
        board: [],
        solution: []
    };
}

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
