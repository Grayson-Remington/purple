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
		this.gameOver = false;
		this.voteTotal = 0;
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
function generateRandomNumber() {
	const characters = '0123456789';
	let numbers = '';

	for (let i = 0; i < 4; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		numbers += characters.charAt(randomIndex);
	}

	return numbers;
}
function generateRandomName() {
	let randomNumbers = generateRandomNumber();
	let name = 'anon' + randomNumbers;

	return name;
}
io.on('connection', (socket) => {
	console.log('A user connected');
	socket.on('joinRoom', (data) => {
		const { requestedRoomId, playerName } = data;
		let roomId = requestedRoomId;
		if (!rooms[roomId] && roomId == '') {
			let randomCode = generateRandomCode();
			roomId = randomCode;
			rooms[roomId] = new Room(roomId);
		} else if (!rooms[roomId] && !roomId == '') {
			rooms[roomId] = new Room(roomId);
		}
		if (
			rooms[roomId].players.some((player) => player.name === playerName)
		) {
			io.to(socket.id).emit('usernameAlreadyExists');
		} else if (rooms[roomId].players.length >= 10) {
			io.to(socket.id).emit('tooManyPlayers');
		} else {
			socket.join(roomId);
			socket.roomId = roomId;

			// Store player information (you can use an array, object, or database)
			const player = { id: socket.id, name: playerName, score: 0 };
			// Example: store in an array
			if (player.name == '') {
				player.name = generateRandomName();
			}
			console.log(player.name);
			io.to(socket.id).emit('playerName', player.name);
			io.to(socket.id).emit('currentRoom', roomId);
			io.to(socket.id).emit(
				'currentCard',
				rooms[roomId].currentSuite +
					'_' +
					rooms[roomId].currentNumber.toString()
			);
			io.to(socket.id).emit(
				'nextCard',
				rooms[roomId].nextSuite +
					'_' +
					rooms[roomId].nextNumber.toString()
			);
			io.to(socket.id).emit(
				'thirdCard',
				rooms[roomId].thirdSuite +
					'_' +
					rooms[roomId].thirdNumber.toString()
			);
			rooms[roomId].addPlayer(player);
			io.to(socket.id).emit(
				'turn',
				rooms[roomId].players[rooms[roomId].currentPlayerIndex].name
			);

			// Emit an event to the room to update all clients about the new player
			io.to(socket.id).emit('deckSize', rooms[roomId].deck.length);
			io.to(roomId).emit('playerJoined', player.name);
			io.to(roomId).emit('players', rooms[roomId].players);
		}
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

			io.to(roomId).emit('guess', {
				guess: guess,
				correct: 'purpleTrue',
				players: rooms[roomId].players,
				turn: players[currentPlayerIndex].name,
				turnScore: rooms[roomId].turnScore,
				deathStack: rooms[roomId].deathStack,
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
		} else if (guess == 'purple') {
			rooms[roomId].deck = shuffleDeck(deck);
			rooms[roomId].currentNumber = rooms[roomId].deck[0].number;
			rooms[roomId].currentSuite = rooms[roomId].deck[0].suite;
			rooms[roomId].nextNumber = rooms[roomId].deck[1].number;
			rooms[roomId].nextSuite = rooms[roomId].deck[1].suite;
			rooms[roomId].thirdNumber = rooms[roomId].deck[2].number;
			rooms[roomId].thirdSuite = rooms[roomId].deck[2].suite;
			rooms[roomId].deck.splice(0, 3);

			players[currentPlayerIndex].score =
				players[currentPlayerIndex].score - deathStack - 2;

			if (currentPlayerIndex == players.length - 1) {
				rooms[roomId].currentPlayerIndex = 0;
			} else {
				rooms[roomId].currentPlayerIndex += 1;
			}
			rooms[roomId].players.forEach((player) => {
				if (player.score <= -20) {
					rooms[roomId].gameOver = true;
					io.to(roomId).emit('gameOver', rooms[roomId].gameOver);
				}
			});
			rooms[roomId].turnScore = 0;
			rooms[roomId].deathStack = 0;

			io.to(roomId).emit('guess', {
				guess: guess,
				correct: 'purpleFalse',
				players: rooms[roomId].players,
				turn: players[rooms[roomId].currentPlayerIndex].name,
				turnScore: rooms[roomId].turnScore,
				deathStack: rooms[roomId].deathStack,
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
			console.log(rooms[roomId].turnScore, rooms[roomId].deathStack);

			io.to(roomId).emit('guess', {
				guess: guess,
				correct: 'true',
				players: rooms[roomId].players,
				turn: players[currentPlayerIndex].name,
				turnScore: rooms[roomId].turnScore,
				deathStack: rooms[roomId].deathStack,
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
		} else if ((guess == 'higher') | (guess == 'lower')) {
			rooms[roomId].deck = shuffleDeck(deck);
			rooms[roomId].currentNumber = rooms[roomId].deck[0].number;
			rooms[roomId].currentSuite = rooms[roomId].deck[0].suite;
			rooms[roomId].nextNumber = rooms[roomId].deck[1].number;
			rooms[roomId].nextSuite = rooms[roomId].deck[1].suite;
			rooms[roomId].thirdNumber = rooms[roomId].deck[2].number;
			rooms[roomId].thirdSuite = rooms[roomId].deck[2].suite;
			rooms[roomId].deck.splice(0, 3);

			players[currentPlayerIndex].score =
				players[currentPlayerIndex].score - deathStack - 1;

			if (currentPlayerIndex == players.length - 1) {
				rooms[roomId].currentPlayerIndex = 0;
			} else {
				rooms[roomId].currentPlayerIndex += 1;
			}
			rooms[roomId].players.forEach((player) => {
				if (player.score <= -20) {
					rooms[roomId].gameOver = true;
					io.to(roomId).emit('gameOver', rooms[roomId].gameOver);
				}
			});
			rooms[roomId].turnScore = 0;
			rooms[roomId].deathStack = 0;
			console.log(rooms[roomId].turnScore, rooms[roomId].deathStack);

			io.to(roomId).emit('guess', {
				guess: guess,
				correct: 'false',
				players: rooms[roomId].players,
				turn: players[rooms[roomId].currentPlayerIndex].name,
				turnScore: rooms[roomId].turnScore,
				deathStack: rooms[roomId].deathStack,
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
		}

		io.to(roomId).emit('deckSize', rooms[roomId].deck.length);
	});
	socket.on('playAgain', () => {
		let roomId = socket.roomId;
		rooms[roomId].voteTotal = rooms[roomId].voteTotal + 1;
		if (
			rooms[roomId].voteTotal >=
			Math.ceil(rooms[roomId].players.length / 2)
		) {
			rooms[roomId].currentPlayerIndex = 0;
			rooms[roomId].deck = shuffleDeck(unshuffledDeck);
			rooms[roomId].currentNumber = rooms[roomId].deck[0].number;
			rooms[roomId].currentSuite = rooms[roomId].deck[0].suite;
			rooms[roomId].nextNumber = rooms[roomId].deck[1].number;
			rooms[roomId].nextSuite = rooms[roomId].deck[1].suite;
			rooms[roomId].thirdNumber = rooms[roomId].deck[2].number;
			rooms[roomId].thirdSuite = rooms[roomId].deck[2].suite;
			rooms[roomId].deathStack = 0;
			rooms[roomId].turnScore = 0;
			rooms[roomId].gameOver = false;
			rooms[roomId].deck.splice(0, 3);
			rooms[roomId].voteTotal = 0;
			rooms[roomId].players.forEach((player, index) => {
				rooms[roomId].players[index].score = 0;
			});

			io.to(roomId).emit('currentRoom', roomId);
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

			io.to(roomId).emit(
				'turn',
				rooms[roomId].players[rooms[roomId].currentPlayerIndex].name
			);

			// Emit an event to the room to update all clients about the new player
			io.to(roomId).emit('deckSize', rooms[roomId].deck.length);
			io.to(roomId).emit('gameOver', rooms[roomId].gameOver);
			io.to(roomId).emit('players', rooms[roomId].players);
		} else {
			io.to(roomId).emit('voteTotal', rooms[roomId].voteTotal);
		}
	});
	socket.on('pass', (turnScore) => {
		let roomId = socket.roomId;
		let currentPlayerIndex = rooms[roomId].currentPlayerIndex;
		let players = rooms[roomId].players;
		let deathStack = rooms[roomId].deathStack;

		players[currentPlayerIndex].score =
			players[currentPlayerIndex].score + turnScore;
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
