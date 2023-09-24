import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { motion, useAnimate } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
const Chat = () => {
	const [rules, setRules] = useState(false);
	const [chat, setChat] = useState(false);
	const [roomId, setRoomId] = useState<string>('');
	const [messages, setMessages] = useState([]);
	const [message, setMessage] = useState('');
	const [playerName, setPlayerName] = useState<string>('');
	const [usernameAlreadyExists, setUsernameAlreadyExists] = useState(false);
	const [players, setPlayers] = useState([]);
	const [tooManyPlayers, setTooManyPlayers] = useState(false);
	const [connectedToRoom, setConnectedToRoom] = useState(false);
	const [isGameOverButtonDisabled, setIsGameOverButtonDisabled] =
		useState(false);
	const [deckSize, setDeckSize] = useState<string>();
	const [shownCard, setShownCard] = useState<string>('');
	const [currentCard, setCurrentCard] = useState<string>('');
	const [nextCard, setNextCard] = useState<string>('');
	const [thirdCard, setThirdCard] = useState<string>('');
	const [turnScore, setTurnScore] = useState(0);
	const [totalScore, setTotalScore] = useState(0);
	const [correct, setCorrect] = useState<string>('');
	const [deathStack, setDeathStack] = useState(0);
	const [socket, setSocket] = useState<any>();
	const [turn, setTurn] = useState(undefined);
	const [gameOver, setGameOver] = useState(false);
	const [round, setRound] = useState(1);
	const [voteTotal, setVoteTotal] = useState(0);
	const turnRef = useRef();
	const correctRef = useRef<string>();
	const playerNameRef = useRef<string>();
	const shownCardRef = useRef<string>('');
	const currentCardRef = useRef<string>('');
	const nextCardRef = useRef<string>('');
	const thirdCardRef = useRef<string>('');
	const turnScoreRef = useRef(0);
	const deathStackRef = useRef(0);
	const messageContainerRef = useRef<HTMLDivElement | null>(null);
	const [isFlipped, setIsFlipped] = useState(false);
	const [isShownFlipped, setIsShownFlipped] = useState(true);

	const [isAnimating, setIsAnimating] = useState(false);
	const [animationNextCard, setAnimationNextCard] = useState('undefined');
	const [animationThirdCard, setAnimationThirdCard] = useState('undefined');
	const [animationShownCard, setAnimationShownCard] = useState('undefined');
	const [scope, animate] = useAnimate();
	const [scope2, animate2] = useAnimate();
	const [scope3, animate3] = useAnimate();
	const [scope4, animate4] = useAnimate();
	const [scope5, animate5] = useAnimate();
	const [scope6, animate6] = useAnimate();
	const [scope7, animate7] = useAnimate();

	async function myAnimation() {
		await animate(
			scope.current,

			{
				pathLength: 1,
				opacity: 1,
			},
			{ duration: 0.1 }
		);
		await animate2(
			scope2.current,
			{
				pathLength: 1,
				opacity: 1,
			},
			{ duration: 0.1 }
		);

		await animate(
			scope.current,
			{
				rotateY: 180,
				rotateX: 180,
			},
			{ duration: 0 }
		);
		await animate2(
			scope2.current,
			{
				rotateY: 180,
				rotateX: 180,
			},
			{ duration: 0 }
		);
		await animate(
			scope.current,
			{
				pathLength: 0,
				opacity: 0,
			},
			{ duration: 0.2 }
		);
		await animate2(
			scope2.current,
			{
				pathLength: 0,
				opacity: 0,
			},
			{ duration: 0.2 }
		);
		await animate(
			scope.current,
			{
				rotateY: 0,
				rotateX: 0,
			},
			{ duration: 0 }
		);
		await animate2(
			scope2.current,
			{
				rotateY: 0,
				rotateX: 0,
			},
			{ duration: 0 }
		);
	}
	async function myAnimation2() {
		await animate3(
			scope3.current,

			{
				pathLength: 1,
				opacity: 1,
			},
			{ duration: 0.1 }
		);
		await animate4(
			scope4.current,
			{
				pathLength: 1,
				opacity: 1,
			},
			{ duration: 0.1 }
		);

		await animate3(
			scope3.current,
			{
				rotateY: 180,
				rotateX: 180,
			},
			{ duration: 0 }
		);
		await animate4(
			scope4.current,
			{
				rotateY: 180,
				rotateX: 180,
			},
			{ duration: 0 }
		);
		await animate3(
			scope3.current,
			{
				pathLength: 0,
				opacity: 0,
			},
			{ duration: 0.2 }
		);
		await animate4(
			scope4.current,
			{
				pathLength: 0,
				opacity: 0,
			},
			{ duration: 0.2 }
		);
		await animate3(
			scope3.current,
			{
				rotateY: 0,
				rotateX: 0,
			},
			{ duration: 0 }
		);
		await animate4(
			scope4.current,
			{
				rotateY: 0,
				rotateX: 0,
			},
			{ duration: 0 }
		);
	}

	async function myAnimation3() {
		await Promise.all([
			animate5(
				scope5.current,
				{
					rotate: 0,
				},
				{ duration: 0 } // Change duration to 1000 milliseconds (1 second)
			),
			animate6(
				scope6.current,
				{
					backgroundColor: '#ff0000',
				},
				{ duration: 0 } // Change duration to 1000 milliseconds (1 second)
			),
			animate7(
				scope7.current,
				{
					backgroundColor: '#0000ff',
				},
				{ duration: 0 } // Change duration to 1000 milliseconds (1 second)
			),
		]);
		await Promise.all([
			animate5(
				scope5.current,
				{
					rotate: 1080,
				},
				{ duration: 1 } // Change duration to 1000 milliseconds (1 second)
			),
			animate6(
				scope6.current,
				{
					backgroundColor: '#800080',
				},
				{ duration: 1 } // Change duration to 1000 milliseconds (1 second)
			),
			animate7(
				scope7.current,
				{
					backgroundColor: '#800080',
				},
				{ duration: 1 } // Change duration to 1000 milliseconds (1 second)
			),
		]);
	}
	useEffect(() => {
		// Set the scrollTop to the maximum to keep the newest message visible
		if (turn == playerName) {
			toast('Your Turn!');
		}
	}, [turn]);
	useEffect(() => {
		// Set the scrollTop to the maximum to keep the newest message visible
		if (messageContainerRef.current) {
			messageContainerRef.current.scrollTop =
				messageContainerRef.current.scrollHeight;
		}
	}, [messages]);
	useEffect(() => {
		let player: any = players.find(
			(playerObj: any) => playerObj.name === playerName
		);
		if (player) {
			setTotalScore(player.score);
		}
	}, [players]);

	useEffect(() => {
		turnRef.current = turn;
		playerNameRef.current = playerName;
		shownCardRef.current = shownCard;
		currentCardRef.current = currentCard;
		nextCardRef.current = nextCard;
		thirdCardRef.current = thirdCard;
		turnScoreRef.current = turnScore;
		deathStackRef.current = deathStack;
		correctRef.current = correct;
	}, [
		turn,
		playerName,
		nextCard,
		currentCard,
		turnScore,
		deathStack,
		thirdCard,
		correct,
		shownCard,
	]);

	function delay(ms: any) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
	useEffect(() => {
		console.log('Connecting to WebSocket server...');
		const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL!, {
			transports: ['websocket'],
		});

		newSocket.on('connect', () => {
			console.log('Connected to WebSocket server');
		});
		newSocket.on('gameOver', (gameOver) => {
			setGameOver(gameOver);
		});
		newSocket.on('messages', (messages) => {
			setMessages(messages);
		});
		newSocket.on('round', (round) => {
			setRound(round);
		});
		newSocket.on('playerJoined', () => {
			setConnectedToRoom(true);
		});
		newSocket.on('voteTotal', (voteTotal) => {
			setVoteTotal(voteTotal);
		});
		newSocket.on('playerName', (playerName) => {
			setPlayerName(playerName);
		});
		newSocket.on('players', (players) => {
			setPlayers(players);
		});
		newSocket.on('currentCard', (currentCard) => {
			let localCurrentCardRef = currentCardRef.current;

			if (localCurrentCardRef == '') {
				setCurrentCard(currentCard);
				setShownCard(currentCard);
			} else {
				setCurrentCard(currentCard);
			}
		});
		newSocket.on('deckSize', (deckSize) => {
			setDeckSize(deckSize + 2);
		});
		newSocket.on('tooManyPlayers', () => {
			setTooManyPlayers(true);
		});
		newSocket.on('nextCard', (nextCard) => {
			setNextCard(nextCard);
		});
		newSocket.on('thirdCard', (thirdCard) => {
			setThirdCard(thirdCard);
		});
		newSocket.on('deathStack', (deathStack) => {
			setDeathStack(deathStack);
		});
		newSocket.on('turnScore', (turnScore) => {
			setTurnScore(turnScore);
		});
		newSocket.on('guess', async (data) => {
			const {
				guess,
				correct,
				turn,
				turnScore,
				deathStack,
				currentCard,
				nextCard,
				thirdCard,
				players,
				gameOver,
				round,
			} = data;
			setCorrect(correct);

			let localNextCard = nextCardRef.current;
			let localThirdCard = thirdCardRef.current;

			setIsAnimating(true);
			if (guess == 'purple' && correct == 'purpleTrue') {
				try {
					setAnimationNextCard('flipCardLowerAnimation');
					setAnimationThirdCard('flipCardHigherAnimation');
					await delay(150);
					setIsFlipped(true);
					await delay(185);
					myAnimation();
					myAnimation2();
					myAnimation3();

					await delay(665);
					setShownCard(localThirdCard);
					setNextCard(nextCard);
					setThirdCard(thirdCard);

					setAnimationNextCard('undefined');
					setAnimationThirdCard('undefined');
					setTurn(turn);
					setTurnScore(turnScore);
					setDeathStack(deathStack);
					setPlayers(players);
					await delay(10);

					setIsFlipped(false);
					setIsAnimating(false);

					// Adjust the delay as needed
				} catch (error) {
					console.error('An error occurred:', error);
				}
			} else if (guess == 'purple' && correct == 'purpleFalse') {
				try {
					setAnimationNextCard('flipCardLowerAnimation');
					setAnimationThirdCard('flipCardHigherAnimation');
					await delay(150);
					setIsFlipped(true);

					await delay(850); // Adjust the delay as needed
					setShownCard(localThirdCard);
					setNextCard(nextCard);
					setThirdCard(thirdCard);
					setAnimationNextCard('undefined');
					setAnimationThirdCard('undefined');
					setAnimationShownCard('putAwayAndDrawAnimation');

					await delay(150);
					setIsShownFlipped(false);
					setShownCard(currentCard);
					await delay(500);
					setIsShownFlipped(true);
					await delay(350);
					setAnimationShownCard('undefined');
					setTurn(turn);
					setTurnScore(turnScore);
					setDeathStack(deathStack);
					setPlayers(players);
					await delay(10);

					setIsFlipped(false);
					setIsAnimating(false);
					setRound(round);
					setGameOver(gameOver);
					if (gameOver == false) {
						setIsGameOverButtonDisabled(false);
					}
					// Adjust the delay as needed
				} catch (error) {
					console.error('An error occurred:', error);
				}
			}
			if (guess == 'higher' && correct == 'true') {
				try {
					setAnimationNextCard('flipCardHigherAnimation');
					await delay(150);
					setIsFlipped(true);

					await delay(850);
					setNextCard(nextCard);
					setThirdCard(thirdCard);
					setShownCard(localNextCard);
					setAnimationNextCard('undefined');
					setTurn(turn);
					setTurnScore(turnScore);
					setDeathStack(deathStack);
					setPlayers(players);
					await delay(10);
					setIsFlipped(false);
					setIsAnimating(false);
				} catch (error) {
					console.error('An error occurred:', error);
				}
			} else if (guess == 'higher' && correct == 'false') {
				try {
					setAnimationNextCard('flipCardHigherAnimation');
					await delay(150);
					setIsFlipped(true);

					await delay(850);
					setAnimationNextCard('undefined');
					setAnimationShownCard('putAwayAndDrawAnimation');
					setShownCard(localNextCard);
					setNextCard(nextCard);
					setThirdCard(thirdCard);

					await delay(150);
					setIsShownFlipped(false);
					setShownCard(currentCard);
					await delay(500);
					setIsShownFlipped(true);
					await delay(350);
					setAnimationShownCard('undefined');
					setTurn(turn);
					setTurnScore(turnScore);
					setDeathStack(deathStack);
					setPlayers(players);
					await delay(10);

					setIsFlipped(false);
					setIsAnimating(false);
					setRound(round);
					setGameOver(gameOver);
					if (gameOver == false) {
						setIsGameOverButtonDisabled(false);
					}
					// Adjust the delay as needed
				} catch (error) {
					console.error('An error occurred:', error);
				}
			}

			if (guess == 'lower' && correct == 'true') {
				try {
					setAnimationNextCard('flipCardLowerAnimation');
					await delay(150);
					setIsFlipped(true);

					await delay(850); // Adjust the delay as needed
					setNextCard(nextCard);
					setThirdCard(thirdCard);
					setShownCard(localNextCard);
					setAnimationNextCard('undefined');
					setTurn(turn);
					setTurnScore(turnScore);
					setDeathStack(deathStack);
					setPlayers(players);
					await delay(10);
					setIsFlipped(false);
					setIsAnimating(false);
					// Adjust the delay as needed
				} catch (error) {
					console.error('An error occurred:', error);
				}
			} else if (guess == 'lower' && correct == 'false') {
				try {
					setAnimationNextCard('flipCardLowerAnimation');
					await delay(150);
					setIsFlipped(true);

					await delay(850); // Adjust the delay as needed
					setAnimationNextCard('undefined');
					setAnimationShownCard('putAwayAndDrawAnimation');
					setShownCard(localNextCard);
					setNextCard(nextCard);
					setThirdCard(thirdCard);

					await delay(150);
					setIsShownFlipped(false);
					setShownCard(currentCard);
					await delay(500);
					setIsShownFlipped(true);
					await delay(350);
					setAnimationShownCard('undefined');
					setTurn(turn);
					setTurnScore(turnScore);
					setDeathStack(deathStack);
					setPlayers(players);
					await delay(10);
					setIsFlipped(false);
					setIsAnimating(false);
					setRound(round);
					setGameOver(gameOver);
					if (gameOver == false) {
						setIsGameOverButtonDisabled(false);
					}
					// Adjust the delay as needed
				} catch (error) {
					console.error('An error occurred:', error);
				}
			}
		});
		newSocket.on('correct', (correct) => {
			console.log('Received correct:', correct);
			setCorrect(correct);

			const currentTurnScore = turnScoreRef.current;
			const currentDeathStack = deathStackRef.current;
		});
		newSocket.on('currentRoom', (roomId) => {
			setRoomId(roomId);
		});
		newSocket.on('turn', (turn) => {
			setTurn(turn);
		});
		newSocket.on('usernameAlreadyExists', () => {
			setUsernameAlreadyExists(true);
		});
		newSocket.on('playerLeft', (playerId) => {
			// Handle a player leaving
			console.log(`Player with ID ${playerId} has left the room.`);
		});
		setSocket(newSocket);

		// Clean up the socket connection on unmount
		return () => {
			console.log('Disconnecting from WebSocket server...');
			newSocket.disconnect();
			setConnectedToRoom(false);
		};
	}, []);

	const handleJoinRoom = (roomId: any, playerName: any) => {
		if (socket) {
			socket.emit('joinRoom', {
				requestedRoomId: roomId,
				playerName: playerName,
			});
		}
	};

	const handleGuess = (guess: any) => {
		if (socket) {
			socket.emit('guess', guess);
		}
	};
	const handlePass = (turnScore: any) => {
		if (socket) {
			socket.emit('pass', turnScore);
			setTurnScore(0);
		}
	};
	const handlePlayAgain = () => {
		if (socket) {
			setIsGameOverButtonDisabled(true);
			socket.emit('playAgain');
		}
	};
	function containsOnlySpaces(inputString: string) {
		for (let i = 0; i < inputString.length; i++) {
			if (inputString[i] !== ' ') {
				return false;
			}
		}
		return true;
	}
	const sendMessage = () => {
		if (socket) {
			if (!containsOnlySpaces(message)) {
				let newMessage = playerName + ': ' + message;
				socket.emit('message', newMessage);
				setMessage('');
			} else {
				setMessage('');
			}
		}
	};
	return (
		<div className='flex flex-col gap-4 w-full items-center min-h-screen h-fit bg-gradient-to-b from-purple-400 to-purple-800'>
			<Toaster />
			{gameOver && (
				<div className='fixed min-h-[1000px] h-full w-full flex flex-col items-center z-50'>
					<div className='absolute inset-0 bg-gradient-to-b from-purple-400 to-purple-800 h-[full] opacity-95'></div>
					<div className='relative flex flex-col items-center max-w-4xl h-full w-full gap-4'>
						<h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
							Game Over
						</h1>

						<h1>Votes Needed: {Math.ceil(players.length / 2)}</h1>
						<h1>Vote Total: {voteTotal}</h1>
						<div className='font-bold'>Round {round}</div>
						{players
							.sort((a: any, b: any) => b.score - a.score)
							.map((player: any, index: number) => (
								<div
									key={index}
									className='flex flex-col text-2xl text-center items-center'
								>
									<div className='flex w-full text-center justify-center'>
										{index + 1}. {player.name}:{' '}
										{player.score}
									</div>
									<div></div>
								</div>
							))}
						<button
							id='gameOverButton'
							className='cursor-pointer disabled:bg-red-500 bg-purple-400 hover:bg-purple-400 text-white font-bold py-2 px-4 border-b-4 border-purple-700 hover:border-purple-500 rounded'
							onClick={handlePlayAgain}
							disabled={isGameOverButtonDisabled}
						>
							Play Again?
						</button>
					</div>
				</div>
			)}
			{chat && (
				<div className='fixed min-h-[1000px] h-full w-full flex flex-col items-center justify-center z-50'>
					<div className='absolute h-full inset-0 bg-gradient-to-b from-purple-400 to-purple-800 '></div>
					<div className='relative max-w-xl w-full mx-auto h-full pt-10 p-6 rounded-lg shadow-md'>
						<div className='flex flex-col items-center h-full max-w-xl w-full rounded-lg'>
							<div className='overflow-y-auto overflow-x-clip break-words w-full h-[500px] relative'>
								{messages &&
									messages.map((message, index) => (
										<div
											key={index}
											className=' break-words'
										>
											{message}
										</div>
									))}
							</div>
							<div className='flex gap-1 w-full'>
								<input
									type='text'
									maxLength={120}
									className='w-full rounded-lg'
									value={message}
									onChange={(e: any) => {
										setMessage(e.target.value);
									}}
									onKeyDown={(
										e: React.KeyboardEvent<HTMLInputElement>
									) => {
										if (e.key === 'Enter') {
											e.preventDefault(); // Prevent the default form submission
											sendMessage();
										}
									}}
								/>
								<button
									className=' cursor-pointer bg-purple-500 hover:bg-purple-400 text-white font-bold p-1 border-b-4 border-purple-700 hover:border-purple-500 rounded'
									onClick={sendMessage}
								>
									Send
								</button>
							</div>
						</div>
						<button
							className='absolute right-4 top-4 cursor-pointer bg-purple-500 hover:bg-purple-400 text-white font-bold p-1 border-b-4 border-purple-700 hover:border-purple-500 rounded'
							onClick={() => setChat(!chat)}
						>
							Close
						</button>
					</div>
				</div>
			)}
			{rules && (
				<div className='absolute h-min w-full flex flex-col items-center z-50'>
					<div className='absolute h-full inset-0 bg-gradient-to-b from-purple-400 to-purple-800 '></div>
					<div className='relative h-full max-w-xl mx-auto p-6 rounded-lg shadow-md'>
						<button
							className='absolute right-4 top-4 cursor-pointer bg-purple-500 hover:bg-purple-400 text-white font-bold p-1 border-b-4 border-purple-700 hover:border-purple-500 rounded'
							onClick={() => setRules(!rules)}
						>
							Close
						</button>
						<h1 className='text-2xl font-semibold mb-4'>
							Purple Instructions
						</h1>
						<span className='font-bold'>Guessing</span>
						<ol className='list-disc pl-5 space-y-2'>
							<li className='mb-2'>
								Guessing Higher or Lower draws ONE card and
								compares it to the current card. If you get it
								right, the card goes in the Death Stack.
							</li>
							<li className='mb-2'>
								Guessing Purple draws TWO cards and compares the
								two suits. Red and blue need to combine to make
								purple. If you get it right, both cards goes in
								the Death Stack.
							</li>
						</ol>
						<span className='font-bold'>Passing</span>
						<ol className='list-disc pl-5 space-y-2'>
							<li className='mb-2'>
								Add 3 cards to the Death Stack in a row and earn
								the ability to pass to the Death Stack to the
								next player.
							</li>
							<li className='mb-2'>
								Passing the Death Stack earns you points equal
								to the amount of cards you added to the Death
								Stack.
							</li>
						</ol>
						<span className='font-bold'>Earning Points</span>
						<ol className='list-disc pl-5 space-y-2'>
							<li className='mb-2'>
								Add 3 cards to the Death Stack in a row and earn
								the ability to pass to the death stack to the
								next player.
							</li>
							<li className='mb-2'>
								Passing the Death Stack earns you points equal
								to the amount of cards you added to the Death
								Stack.
							</li>
						</ol>
						<span className='font-bold'>Losing Points</span>
						<ol className='list-disc pl-5 space-y-2'>
							<li className='mb-2'>
								The game ends when one person gets below -20
							</li>
							<li className='mb-2'>
								When you get one wrong, you lose points equal to
								the Death Stack AND the cards you were dealt.
							</li>
						</ol>
						<span className='font-bold'>Getting it Wrong</span>
						<ol className='list-disc pl-5 space-y-2'>
							<li className='mb-2'>
								Getting it wrong shuffles the deck.
							</li>
							<li className='mb-2'>
								When you get one wrong, you lose points equal to
								the death stack AND the cards you were dealt.
							</li>
						</ol>
						<span className='font-bold'>Getting it Right</span>
						<ol className='list-disc pl-5 space-y-2'>
							<li className='mb-2'>
								When you get one right, you add points to the
								Death Stack and Turn Score equal to the amount
								of cards you were dealt. Higher or Lower = 1
								point, Purple = 2 points
							</li>
							<li className='mb-2'>
								Add 3 cards to the Death Stack in a row and earn
								the ability to pass to the death stack to the
								next player.
							</li>
						</ol>
					</div>
				</div>
			)}
			{!connectedToRoom ? (
				<div className='max-w-3xl flex flex-col gap-2 uppercase font-bold  items-center p-4'>
					<div className='flex items-center'>
						<img
							src='./blob.svg'
							className='h-20'
							alt=''
						/>
						<h1 className='text-4xl italic tracking-tight text-gray-900 lowercase '>
							Purple
						</h1>
					</div>

					<div className='items-center text-center'>
						<h1>Room Id </h1>

						<input
							required
							value={roomId}
							maxLength={12}
							className='border border-black text-center'
							type='input'
							onChange={(e) =>
								setRoomId(
									e.target.value
										.toUpperCase()
										.replace(/\s/g, '')
								)
							}
						/>
						{tooManyPlayers && (
							<h1 className='text-red-800'>Room is Full</h1>
						)}
					</div>
					<div className='items-center text-center'>
						<h1>Username</h1>
						<input
							required
							value={playerName}
							maxLength={12}
							className='border border-black text-center'
							type='input'
							onChange={(e) => {
								setPlayerName(e.target.value);
								setUsernameAlreadyExists(false);
							}}
						/>
						{usernameAlreadyExists && (
							<h1 className='text-red-800'>
								Username Already exists
							</h1>
						)}
					</div>
					<div className='text-center mt-1 max-w-xs text-sm'>
						If left blank, a random room and username will be
						created for you
					</div>
					<button
						className='uppercase font-bold border rounded-full bg-white text-purple-900 hover:scale-105 p-2 mt-4'
						onClick={() => handleJoinRoom(roomId, playerName)}
					>
						Join
					</button>
				</div>
			) : (
				<div className='flex flex-col gap-2 items-center h-[1000px] w-full max-w-2xl shadow-2xl rounded-lg p-4'>
					<div className='flex items-center'>
						<img
							src='./blob.svg'
							className='h-20'
							alt=''
						/>
						<h1 className='text-4xl font-bold italic tracking-tight text-gray-900 lowercase  '>
							Purple
						</h1>
					</div>
					<div className='flex flex-col relative items-center max-w-lg w-full border rounded-lg p-1'>
						<div
							className='overflow-y-auto overflow-x-clip break-words w-full h-32 relative'
							ref={messageContainerRef}
						>
							{messages &&
								messages.map((message, index) => (
									<div
										key={index}
										className=' break-words'
									>
										{message}
									</div>
								))}
						</div>
						<div className='flex w-full gap-1'>
							<input
								type='text'
								maxLength={120}
								className='w-full rounded-lg'
								value={message}
								onChange={(e: any) => {
									setMessage(e.target.value);
								}}
								onKeyDown={(
									e: React.KeyboardEvent<HTMLInputElement>
								) => {
									if (e.key === 'Enter') {
										e.preventDefault(); // Prevent the default form submission
										sendMessage();
									}
								}}
							/>
							<button
								className='w-full max-w-fit cursor-pointer bg-purple-500 hover:bg-purple-400 text-white font-bold p-1 border-b-4 border-purple-700 hover:border-purple-500 rounded'
								onClick={sendMessage}
							>
								Send
							</button>
							<button
								className='w-full max-w-fit cursor-pointer bg-purple-500 hover:bg-purple-400 text-white font-bold p-1 border-b-4 border-purple-700 hover:border-purple-500 rounded z-30'
								onClick={() => setChat(!chat)}
							>
								All Chat
							</button>
						</div>
					</div>
					<div className='flex justify-between items-center w-full px-8'>
						<button
							className='cursor-pointer bg-purple-500 hover:bg-purple-400 text-white font-bold py-2 px-4 border-b-4 border-purple-700 hover:border-purple-500 rounded'
							onClick={() => setRules(!rules)}
						>
							Rules
						</button>

						<div>
							<h1 className='font-bold tracking-tight text-gray-900 text-sm '>
								Room: {roomId}
							</h1>
							<h1 className='font-bold tracking-tight text-gray-900 text-sm '>
								Username: {playerName}
							</h1>
						</div>
					</div>

					<div className='flex justify-between items-stretch rounded-lg bg-slate-200 text-purple-800 w-full overflow-x-auto overflow-y-hidden gap-4 min-h-[85px]'>
						<div className='flex w-full text-xl gap-4 px-2'>
							{players.map((player: any, index: number) => (
								<div
									key={index}
									className={`flex flex-col items-center ${
										player.name == turn
											? 'bg-purple-400'
											: ''
									} justify-center ${
										player.score < -10
											? 'text-red-600 animate-scale'
											: ''
									} ${
										player.name == turn
											? 'font-extrabold'
											: ''
									}`}
								>
									<span>{player.name}</span>
									<span>{player.score}</span>
								</div>
							))}
						</div>
					</div>
					<div className='font-bold'>Round {round}</div>
					<div className='flex text-center w-full justify-between gap-4'>
						<div className='font-bold w-full'>
							<h1>Turn Score</h1>
							<h1 className=' text-3xl font-semibold tracking-tight text-green-900  sm:text-5xl'>
								{turnScore}
							</h1>
						</div>
						<div className='font-bold w-full'>
							<h1>Death Stack </h1>
							<h1 className=' text-3xl font-semibold tracking-tight text-red-600 sm:text-5xl'>
								{deathStack}
							</h1>
							(cards left {deckSize})
						</div>

						<div className='font-bold w-full'>
							<h1>Your Score</h1>
							<h1 className=' text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl'>
								{totalScore}
							</h1>
						</div>
					</div>
					<div
						id='motion-container'
						className='flex flex-col  items-center relative gap-4 w-full py-4 justify-between mb-6'
					>
						<svg
							width='240'
							height='200'
							viewBox='0 0 240 200'
							className='absolute translate-y-[150px]'
						>
							<motion.line
								x1='0'
								y1='0'
								x2='0'
								y2='150'
								stroke='#FF0000'
								initial={{ pathLength: 0, opacity: 0 }}
								transition={{ ease: 'linear', duration: 250 }}
								ref={scope}
							/>
							<motion.line
								x1='0'
								y1='150'
								x2='120'
								y2='150'
								stroke='#FF0000'
								initial={{ pathLength: 0, opacity: 0 }}
								transition={{ ease: 'linear', duration: 250 }}
								ref={scope2}
							/>
							<motion.line
								x1='240'
								y1='0'
								x2='240'
								y2='150'
								stroke='#0000FF'
								initial={{ pathLength: 0, opacity: 0 }}
								transition={{ ease: 'linear', duration: 250 }}
								ref={scope3}
							/>
							<motion.line
								x1='240'
								y1='150'
								x2='120'
								y2='150'
								stroke='#0000FF'
								initial={{ pathLength: 0, opacity: 0 }}
								transition={{ ease: 'linear', duration: 250 }}
								ref={scope4}
							/>
							<foreignObject
								x='110'
								y='140'
								z='20'
								width='20'
								height='20'
							>
								<motion.div
									ref={scope5}
									className='swirling-div2'
								>
									<motion.div
										ref={scope6}
										className='red'
									></motion.div>
									<motion.div
										ref={scope7}
										className='blue'
									></motion.div>
								</motion.div>
							</foreignObject>
						</svg>
						<img
							className='z-10 h-[128.06px] w-[90px]'
							src={`./blue2.svg`}
							alt=''
						/>
						<div
							style={{
								transform: 'rotateY(180deg) ',
								opacity: 0,
							}}
							className={`absolute block ${animationNextCard} ${
								!(animationNextCard == 'undefined')
									? 'z-20'
									: ''
							}`}
						>
							{isFlipped ? (
								<img
									className='w-[90px] h-[128.06px]'
									src={`./${nextCard}.svg`}
									alt=''
								/>
							) : (
								<img
									className='w-[90px] h-[128.06px]'
									src={`./blue2.svg`}
									alt=''
								/>
							)}
						</div>
						<div
							style={{
								transform: 'rotateY(180deg)',
								opacity: 0,
							}}
							className={`absolute block ${animationThirdCard} ${
								!(animationThirdCard == 'undefined')
									? 'z-30'
									: ''
							}`}
						>
							{isFlipped ? (
								<img
									className='w-[90px] h-[128.06px]'
									src={`./${thirdCard}.svg`}
									alt=''
								/>
							) : (
								<img
									className='w-[90px] h-[128.06px]'
									src={`./blue2.svg`}
									alt=''
								/>
							)}
						</div>
						<div
							style={{
								transform: ' ',
								opacity: 100,
							}}
							className={`block ${animationShownCard} ${
								!(animationShownCard == 'undefined')
									? 'z-20'
									: ''
							}  `}
						>
							{isShownFlipped ? (
								<img
									className='w-[90px] h-[128.06px]'
									src={`./${shownCard}.svg`}
									alt=''
								/>
							) : (
								<img
									className='w-[90px] h-[128.06px]'
									src={`./blue2.svg`}
									alt=''
								/>
							)}
						</div>
						{turn && turn == playerName && turnScore >= 3 && (
							<button
								onClick={() => handlePass(turnScore)}
								disabled={isAnimating}
								className='disabled:bg-red-500 bg-purple-500 hover:bg-purple-400 text-white font-bold py-2 px-4 border-b-4 border-purple-700 hover:border-purple-500 rounded col-span-3 absolute z-40 translate-y-52'
							>
								Pass
							</button>
						)}
					</div>

					{turn && turn == playerName && (
						<div className='grid grid-cols-3 gap-4 p-4 z-20'>
							<button
								onMouseDown={() => handleGuess('lower')}
								disabled={isAnimating}
								className=' cursor-pointer disabled:bg-red-500 bg-purple-500 hover:bg-purple-400 text-white font-bold py-2 px-4 border-b-4 border-purple-700 hover:border-purple-500 rounded'
							>
								Lower
							</button>
							<button
								onMouseDown={() => {
									handleGuess('purple');
								}}
								disabled={isAnimating}
								className=' cursor-pointer disabled:bg-red-500 bg-purple-900 hover:bg-purple-400 text-white font-bold text-xl py-2 px-4 border-b-4 border-purple-950 hover:border-purple-500 rounded'
							>
								Purple
							</button>
							<button
								onMouseDown={() => handleGuess('higher')}
								disabled={isAnimating}
								className='cursor-pointer disabled:bg-red-500 bg-purple-500 hover:bg-purple-400 text-white font-bold py-2 px-4 border-b-4 border-purple-700 hover:border-purple-500 rounded'
							>
								Higher
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default Chat;
