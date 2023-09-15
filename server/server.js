const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors()); // Enable CORS for all routes

const suites = ['diamonds', 'hearts', 'spades', 'clubs'];
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const unshuffledDeck = [];
for (const element1 of suites) {
	for (const element2 of numbers) {
		// Create a combination object and push it to the 'combinations' array
		const combination = { suite: element1, number: element2 };
		unshuffledDeck.push(combination);
	}
}
function shuffleDeck(array) {
	const shuffledArray = [...array]; // Create a new array to hold the shuffled elements
	for (let i = shuffledArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1)); // Generate a random index
		// Swap elements at i and j
		[shuffledArray[i], shuffledArray[j]] = [
			shuffledArray[j],
			shuffledArray[i],
		];
	}
	return shuffledArray;
}
function getRandomSuite() {
	const randomIndex = Math.floor(Math.random() * suites.length);
	return suites[randomIndex];
}
console.log(unshuffledDeck);
class Room {
	constructor(roomId) {
		this.roomId = roomId;
		this.players = [];
		this.currentPlayerIndex = 0;
		this.deck = shuffleDeck(unshuffledDeck);
		this.currentNumber = this.deck[0].number;
		this.currentSuite = this.deck[0].suite;
		this.nextNumber = this.deck[1].number;
		this.nextSuite = this.deck[1].suite;
		this.thirdNumber = this.deck[2].number;
		this.thirdSuite = this.deck[2].suite;
		this.deathStack = 0;
		this.turnScore = 0;

		this.deck.splice(0, 3);
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
function generateRandomCode() {
	const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	let code = '';

	for (let i = 0; i < 6; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		code += characters.charAt(randomIndex);
	}

	return code;
}
io.on('connection', (socket) => {
	console.log('A user connected');
	socket.on('joinRoom', (data) => {
		const { requestedRoomId, playerName } = data;
		let roomId = requestedRoomId;
		if (!rooms[requestedRoomId] && requestedRoomId == '') {
			let randomCode = generateRandomCode();
			roomId = randomCode;
			rooms[randomCode] = new Room(randomCode);
		} else if (!rooms[requestedRoomId]) {
			roomId = requestedRoomId;
			rooms[requestedRoomId] = new Room(requestedRoomId);
		}
		// Join the specified room
		if (
			rooms[roomId].players.some((player) => player.name === playerName)
		) {
			io.to(socket.id).emit('usernameAlreadyExists');
		} else {
			socket.join(roomId);
			socket.roomId = roomId;

			// Store player information (you can use an array, object, or database)
			const player = { id: socket.id, name: playerName, score: 0 };
			// Example: store in an array
			io.to(socket.id).emit('currentRoom', roomId);
			io.to(roomId).emit(
				'currentCard',
				rooms[roomId].currentSuite +
					'_' +
					rooms[roomId].currentNumber.toString()
			);
			io.to(roomId).emit(
				'nextCard',
				rooms[roomId].nextSuite +
					'_' +
					rooms[roomId].nextNumber.toString()
			);
			io.to(roomId).emit(
				'thirdCard',
				rooms[roomId].thirdSuite +
					'_' +
					rooms[roomId].thirdNumber.toString()
			);
			rooms[roomId].addPlayer(player);
			io.to(roomId).emit(
				'turn',
				rooms[roomId].players[rooms[roomId].currentPlayerIndex].name
			);

			// Emit an event to the room to update all clients about the new player
			io.to(roomId).emit('deckSize', rooms[roomId].deck.length);
			io.to(roomId).emit('playerJoined', player.name);
			io.to(roomId).emit('players', rooms[roomId].players);
			console.log('players', rooms[roomId].players);
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
		let deck = unshuffledDeck;
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
			guess == 'purple' &&
			(((nextSuite == 'diamonds' || nextSuite == 'hearts') &&
				(thirdSuite == 'clubs' || thirdSuite == 'spades')) ||
				((nextSuite == 'clubs' || nextSuite == 'spades') &&
					(thirdSuite == 'diamonds' || thirdSuite == 'hearts')))
		) {
			rooms[roomId].currentNumber = thirdNumber;
			rooms[roomId].currentSuite = thirdSuite;

			rooms[roomId].deathStack = deathStack + 2;
			rooms[roomId].turnScore = turnScore + 2;
			rooms[roomId].nextNumber = rooms[roomId].deck[0].number;
			rooms[roomId].nextSuite = rooms[roomId].deck[0].suite;
			rooms[roomId].thirdNumber = rooms[roomId].deck[1].number;
			rooms[roomId].thirdSuite = rooms[roomId].deck[1].suite;
			rooms[roomId].deck.splice(0, 2);
			io.to(roomId).emit('correct', 'purpleTrue');

			io.to(roomId).emit('players', rooms[roomId].players);
			io.to(roomId).emit('turn', players[currentPlayerIndex].name);
			io.to(roomId).emit('turnScore', rooms[roomId].turnScore);
			io.to(roomId).emit('deathStack', rooms[roomId].deathStack);
		} else if (guess == 'purple') {
			rooms[roomId].deathStack = 0;
			rooms[roomId].turnScore = 0;
			rooms[roomId].deck = shuffleDeck(deck);
			rooms[roomId].currentNumber = rooms[roomId].deck[0].number;
			rooms[roomId].currentSuite = rooms[roomId].deck[0].suite;
			rooms[roomId].nextNumber = rooms[roomId].deck[1].number;
			rooms[roomId].nextSuite = rooms[roomId].deck[1].suite;
			rooms[roomId].thirdNumber = rooms[roomId].deck[2].number;
			rooms[roomId].thirdSuite = rooms[roomId].deck[2].suite;
			rooms[roomId].deck.splice(0, 3);
			io.to(roomId).emit('correct', 'purpleFalse');

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
			rooms[roomId].nextNumber = thirdNumber;
			rooms[roomId].nextSuite = thirdSuite;
			rooms[roomId].thirdNumber = rooms[roomId].deck[0].number;
			rooms[roomId].thirdSuite = rooms[roomId].deck[0].suite;
			rooms[roomId].deck.splice(0, 1);
			console.log(
				rooms[roomId].currentNumber,
				rooms[roomId].nextNumber,
				rooms[roomId].thirdNumber
			);
			io.to(roomId).emit('correct', 'true');

			io.to(roomId).emit('players', rooms[roomId].players);
			io.to(roomId).emit('turn', players[currentPlayerIndex].name);
			io.to(roomId).emit('turnScore', rooms[roomId].turnScore);
			io.to(roomId).emit('deathStack', rooms[roomId].deathStack);
		} else if ((guess == 'higher') | (guess == 'lower')) {
			rooms[roomId].deathStack = 0;
			rooms[roomId].turnScore = 0;
			rooms[roomId].deck = shuffleDeck(deck);
			rooms[roomId].currentNumber = rooms[roomId].deck[0].number;
			rooms[roomId].currentSuite = rooms[roomId].deck[0].suite;
			rooms[roomId].nextNumber = rooms[roomId].deck[1].number;
			rooms[roomId].nextSuite = rooms[roomId].deck[1].suite;
			rooms[roomId].thirdNumber = rooms[roomId].deck[2].number;
			rooms[roomId].thirdSuite = rooms[roomId].deck[2].suite;
			rooms[roomId].deck.splice(0, 3);
			console.log(
				rooms[roomId].currentNumber,
				rooms[roomId].nextNumber,
				rooms[roomId].thirdNumber
			);
			io.to(roomId).emit('correct', 'false');

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
		console.log(
			rooms[roomId].thirdSuite +
				'_' +
				rooms[roomId].thirdNumber.toString()
		);
		io.to(roomId).emit('deckSize', rooms[roomId].deck.length);
		// Broadcast the message to all connected clients
		io.emit('guess', {
			guess: guess,
			currentCard:
				rooms[roomId].currentSuite +
				'_' +
				rooms[roomId].currentNumber.toString(),
			nextCard:
				rooms[roomId].nextSuite +
				'_' +
				rooms[roomId].nextNumber.toString(),
			thirdCard:
				rooms[roomId].thirdSuite +
				'_' +
				rooms[roomId].thirdNumber.toString(),
		});
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
		if (players.length == 1) {
			rooms[roomId].deathStack = 0;
			io.to(roomId).emit('players', rooms[roomId].players);
			io.to(roomId).emit('deathStack', 0);
			io.to(roomId).emit('turnScore', 0);
			io.to(roomId).emit(
				'turn',
				players[rooms[roomId].currentPlayerIndex].name
			);
		} else {
			io.to(roomId).emit('players', rooms[roomId].players);
			io.to(roomId).emit('deathStack', deathStack);
			io.to(roomId).emit('turnScore', 0);
			io.to(roomId).emit(
				'turn',
				players[rooms[roomId].currentPlayerIndex].name
			);
		}
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
