const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors()); // Enable CORS for all routes

const suites = ['diamonds', 'hearts', 'spades', 'clubs'];

function getRandomSuite() {
	const randomIndex = Math.floor(Math.random() * suites.length);
	return suites[randomIndex];
}

class Room {
	constructor(roomId) {
		this.roomId = roomId;
		this.players = [];
		this.currentPlayerIndex = 0;
		this.currentNumber = Math.floor(Math.random() * 12) + 1;
		this.currentSuite = getRandomSuite();
		this.nextNumber = Math.floor(Math.random() * 12) + 1;
		this.nextSuite = getRandomSuite();
		this.thirdNumber = Math.floor(Math.random() * 12) + 1;
		this.thirdSuite = getRandomSuite();
		this.deathStack = 0;
		this.turnScore = 0;
	}

	addPlayer(player) {
		this.players.push(player);
	}

	removePlayer(playerId) {
		const index = this.players.findIndex(
			(player) => player.id === playerId
		);
		if (index !== -1) {
			this.players.splice(index, 1);
		}
	}
}

// Store rooms in an object
const rooms = {};

io.on('connection', (socket) => {
	console.log('A user connected');
	socket.on('joinRoom', (data) => {
		const { requestedRoomId, playerName } = data;

		if (!rooms[requestedRoomId]) {
			rooms[requestedRoomId] = new Room(requestedRoomId);
		}
		// Join the specified room
		if (
			rooms[requestedRoomId].players.some(
				(player) => player.name === playerName
			)
		) {
			io.to(socket.id).emit('usernameAlreadyExists');
		} else {
			socket.join(requestedRoomId);
			socket.roomId = requestedRoomId;

			// Store player information (you can use an array, object, or database)
			const player = { id: socket.id, name: playerName, score: 0 };
			// Example: store in an array

			io.to(requestedRoomId).emit(
				'currentCard',
				rooms[requestedRoomId].currentSuite +
					'_' +
					rooms[requestedRoomId].currentNumber.toString()
			);
			io.to(requestedRoomId).emit(
				'nextCard',
				rooms[requestedRoomId].nextSuite +
					'_' +
					rooms[requestedRoomId].nextNumber.toString()
			);
			io.to(requestedRoomId).emit(
				'thirdCard',
				rooms[requestedRoomId].thirdSuite +
					'_' +
					rooms[requestedRoomId].thirdNumber.toString()
			);
			rooms[requestedRoomId].addPlayer(player);
			io.to(requestedRoomId).emit(
				'turn',
				rooms[requestedRoomId].players[
					rooms[requestedRoomId].currentPlayerIndex
				].name
			);

			// Emit an event to the room to update all clients about the new player
			io.to(requestedRoomId).emit('playerJoined', player.name);
			io.to(requestedRoomId).emit(
				'players',
				rooms[requestedRoomId].players
			);
			console.log('players', rooms[requestedRoomId].players);
		}
	});
	socket.on('deathStack', (deathStack) => {
		let roomId = socket.roomId;

		rooms[roomId].deathStack = deathStack;
	});
	socket.on('turnScore', (turnScore) => {
		let roomId = socket.roomId;

		rooms[roomId].turnScore = turnScore;
	});
	socket.on('guess', (guess) => {
		let roomId = socket.roomId;
		let thirdNumber = rooms[roomId].thirdNumber;
		let thirdSuite = rooms[roomId].thirdSuite;
		let nextNumber = rooms[roomId].nextNumber;
		let nextSuite = rooms[roomId].nextSuite;
		let currentNumber = rooms[roomId].currentNumber;
		let currentSuite = rooms[roomId].currentSuite;
		let currentPlayerIndex = rooms[roomId].currentPlayerIndex;
		let players = rooms[roomId].players;
		let deathStack = rooms[roomId].deathStack;
		let turnScore = rooms[roomId].turnScore;

		if (
			(guess == 'purple' &&
				(nextSuite == 'diamonds' || nextSuite == 'hearts') &&
				(thirdSuite == 'clubs' || thirdSuite == 'spades')) ||
			((nextSuite == 'clubs' || nextSuite == 'spades') &&
				(thirdSuite == 'diamonds' || thirdSuite == 'hearts'))
		) {
			rooms[roomId].currentNumber = thirdNumber;
			rooms[roomId].currentSuite = thirdSuite;
			rooms[roomId].deathStack = deathStack + 2;
			rooms[roomId].turnScore = turnScore + 2;
			rooms[roomId].nextNumber = Math.floor(Math.random() * 12) + 1;
			rooms[roomId].nextSuite = getRandomSuite();
			rooms[roomId].thirdNumber = Math.floor(Math.random() * 12) + 1;
			rooms[roomId].thirdSuite = getRandomSuite();
			io.to(roomId).emit('correct', 'purpleTrue');
			io.to(roomId).emit(
				'currentCard',
				currentSuite + '_' + currentNumber.toString()
			);
			io.to(roomId).emit(
				'nextCard',
				nextSuite + '_' + nextNumber.toString()
			);
			io.to(roomId).emit(
				'thirdCard',
				thirdSuite + '_' + thirdNumber.toString()
			);

			io.to(roomId).emit('players', rooms[roomId].players);
			io.to(roomId).emit('turn', players[currentPlayerIndex].name);
			io.to(roomId).emit('turnScore', rooms[roomId].turnScore);
			io.to(roomId).emit('deathStack', rooms[roomId].deathStack);
		} else if (guess == 'purple') {
			rooms[roomId].currentNumber = thirdNumber;
			rooms[roomId].currentSuite = thirdSuite;
			rooms[roomId].deathStack = 0;
			rooms[roomId].turnScore = 0;
			rooms[roomId].nextNumber = Math.floor(Math.random() * 12) + 1;
			rooms[roomId].nextSuite = getRandomSuite();
			rooms[roomId].thirdNumber = Math.floor(Math.random() * 12) + 1;
			rooms[roomId].thirdSuite = getRandomSuite();
			io.to(roomId).emit('correct', 'purpleFalse');
			io.to(roomId).emit(
				'currentCard',
				currentSuite + '_' + currentNumber.toString()
			);
			io.to(roomId).emit(
				'nextCard',
				nextSuite + '_' + nextNumber.toString()
			);
			io.to(roomId).emit(
				'thirdCard',
				thirdSuite + '_' + thirdNumber.toString()
			);
			players[currentPlayerIndex].score =
				players[currentPlayerIndex].score - deathStack - 2;
			io.to(roomId).emit('players', rooms[roomId].players);
			io.to(roomId).emit('deathStack', 0);
			io.to(roomId).emit('turnScore', 0);
			if (currentPlayerIndex == players.length - 1) {
				rooms[roomId].currentPlayerIndex = 0;
			} else {
				rooms[roomId].currentPlayerIndex += 1;
			}

			io.to(roomId).emit(
				'turn',
				players[rooms[roomId].currentPlayerIndex].name
			);
		}
		if (
			(guess == 'higher' && currentNumber < nextNumber) |
			(guess == 'lower' && currentNumber > nextNumber)
		) {
			rooms[roomId].currentNumber = nextNumber;
			rooms[roomId].currentSuite = nextSuite;
			rooms[roomId].deathStack = deathStack + 1;
			rooms[roomId].turnScore = turnScore + 1;
			rooms[roomId].nextNumber = Math.floor(Math.random() * 12) + 1;
			rooms[roomId].nextSuite = getRandomSuite();
			rooms[roomId].thirdNumber = Math.floor(Math.random() * 12) + 1;
			rooms[roomId].thirdSuite = getRandomSuite();
			io.to(roomId).emit('correct', 'true');
			io.to(roomId).emit(
				'currentCard',
				currentSuite + '_' + currentNumber.toString()
			);
			io.to(roomId).emit(
				'nextCard',
				nextSuite + '_' + nextNumber.toString()
			);
			io.to(roomId).emit(
				'thirdCard',
				thirdSuite + '_' + thirdNumber.toString()
			);

			io.to(roomId).emit('players', rooms[roomId].players);
			io.to(roomId).emit('turn', players[currentPlayerIndex].name);
			io.to(roomId).emit('turnScore', rooms[roomId].turnScore);
			io.to(roomId).emit('deathStack', rooms[roomId].deathStack);
		} else if ((guess == 'higher') | (guess == 'lower')) {
			rooms[roomId].currentNumber = nextNumber;
			rooms[roomId].currentSuite = nextSuite;
			rooms[roomId].deathStack = 0;
			rooms[roomId].turnScore = 0;
			rooms[roomId].nextNumber = Math.floor(Math.random() * 12) + 1;
			rooms[roomId].nextSuite = getRandomSuite();
			rooms[roomId].thirdNumber = Math.floor(Math.random() * 12) + 1;
			rooms[roomId].thirdSuite = getRandomSuite();
			io.to(roomId).emit('correct', 'false');
			io.to(roomId).emit(
				'currentCard',
				currentSuite + '_' + currentNumber.toString()
			);
			io.to(roomId).emit(
				'nextCard',
				nextSuite + '_' + nextNumber.toString()
			);
			io.to(roomId).emit(
				'thirdCard',
				thirdSuite + '_' + thirdNumber.toString()
			);
			players[currentPlayerIndex].score =
				players[currentPlayerIndex].score - deathStack - 1;
			io.to(roomId).emit('players', rooms[roomId].players);
			io.to(roomId).emit('deathStack', 0);
			io.to(roomId).emit('turnScore', 0);
			if (currentPlayerIndex == players.length - 1) {
				rooms[roomId].currentPlayerIndex = 0;
			} else {
				rooms[roomId].currentPlayerIndex += 1;
			}

			io.to(roomId).emit(
				'turn',
				players[rooms[roomId].currentPlayerIndex].name
			);
		}
		// Broadcast the message to all connected clients
		io.emit('guess', guess);
	});

	socket.on('pass', (turnScore) => {
		let roomId = socket.roomId;
		let currentPlayerIndex = rooms[roomId].currentPlayerIndex;
		let players = rooms[roomId].players;
		let deathStack = rooms[roomId].deathStack;
		players[currentPlayerIndex].score =
			players[currentPlayerIndex].score + deathStack;
		rooms[roomId].deathStack = turnScore;
		rooms[roomId].turnScore = 0;
		if (currentPlayerIndex == players.length - 1) {
			rooms[roomId].currentPlayerIndex = 0;
		} else {
			rooms[roomId].currentPlayerIndex += 1;
		}
		io.to(roomId).emit('players', rooms[roomId].players);
		io.to(roomId).emit('deathStack', deathStack);
		io.to(roomId).emit('turnScore', 0);
		io.to(roomId).emit(
			'turn',
			players[rooms[roomId].currentPlayerIndex].name
		);
	});
	// Handle disconnection
	socket.on('disconnect', () => {
		const roomId = socket.roomId;
		console.log(rooms);
		if (rooms[roomId]) {
			rooms[roomId].removePlayer(socket.id);
			io.to(roomId).emit('players', rooms[roomId].players);
			if (rooms[roomId].players.length === 0) {
				// If the room is empty, remove it
				delete rooms[roomId];
			} else {
				// If there are still players in the room, notify them about the disconnected player
				io.to(roomId).emit('playerLeft', socket.id);
			}
		}
		console.log('A user disconnected');
	});
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
