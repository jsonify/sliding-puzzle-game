# Sliding Puzzle Game

A multiplayer sliding puzzle game built with Node.js, Socket.IO, and vanilla JavaScript. Players can play solo or challenge others to race in solving the puzzle.

## Features

- Single player mode
- Multiplayer mode with real-time opponent tracking
- Challenge system for player vs player matches
- "Solve All But Last" helper function
- Real-time move synchronization
- Win detection and game completion tracking
- Responsive design

## Prerequisites

Before running this project, make sure you have:
- Node.js (v12 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sliding-puzzle-game
```

2. Install dependencies:
```bash
npm install
```

## Running the Game

Start the server:
```bash
node server.js
```

Then open your browser and navigate to:
```
http://localhost:3000
```

## How to Play

### Single Player Mode
1. Select "Single Player" from the menu
2. Click tiles adjacent to the empty space to move them
3. Try to match the solution pattern shown below the game board
4. Use "Randomize" to start a new puzzle
5. Use "Solve All But Last" for help (leaves last two tiles to solve)

### Multiplayer Mode
1. Select "Multiplayer" from the menu
2. Enter your username
3. Challenge another player or wait to be challenged
4. Race to complete the puzzle first
5. Watch your opponent's progress in real-time

## Game Controls

- Click/tap tiles to move them
- Use the hamburger menu (☰) to switch between game modes
- "Randomize" button shuffles the puzzle (Single Player)
- "Solve All But Last" button helps when stuck

## Technical Details

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js with Express
- Real-time Communication: Socket.IO
- No database required - all game state managed in memory

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
