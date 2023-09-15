import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { motion, useAnimation } from 'framer-motion';
import next from 'next';

const Chat = () => {
	const [rules, setRules] = useState(false);
	const [roomId, setRoomId] = useState<string>('');
	const [playerName, setPlayerName] = useState<string>();
	const [usernameAlreadyExists, setUsernameAlreadyExists] = useState(false);
	const [players, setPlayers] = useState([]);
	const [connectedToRoom, setConnectedToRoom] = useState(false);
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
	const turnRef = useRef();
	const correctRef = useRef<string>();
	const playerNameRef = useRef<string>();
	const shownCardRef = useRef<string>('');
	const currentCardRef = useRef<string>('');
	const nextCardRef = useRef<string>('');
	const thirdCardRef = useRef<string>('');
	const turnScoreRef = useRef(0);
	const deathStackRef = useRef(0);
	const [isFlipped, setIsFlipped] = useState(false);
	const [isShownFlipped, setIsShownFlipped] = useState(true);
	const controls = useAnimation();
	const controls2 = useAnimation();
	const controls3 = useAnimation();
	const [isAnimating, setIsAnimating] = useState(false);
	const handleSingleFlip = async () => {
		await controls3.start({
			x: 0,
			y: -144.06,
			scale: 1.0,
			rotateY: 180,
			zIndex: 20,
			transition: { duration: 0.0 },
		});

		// Snap back to the original position
		await controls3.start({
			x: 0,
			y: 0,
			scale: 1.0,
			rotateY: 0,
			zIndex: 20,
			transition: { duration: 0.5 },
		});
	};
	const putAwayCards = async () => {
		await controls3.start({
			x: 0,
			y: -144.06,
			scale: 1.0,
			rotateY: 180,
			zIndex: 0,
			transition: { duration: 0.5 },
		});

		// Snap back to the original position
	};
	const resetCardPosition = async () => {
		await controls.start({
			zIndex: 0,
			transition: { duration: 0.0 },
		});

		await controls.start({
			x: 0,
			y: 0,
			scale: 1.0,
			rotateY: 180,
			zIndex: 0,
			transition: { duration: 0.0 },
		});
	};
	const reset2Cards = async () => {
		await (controls.start({
			zIndex: 0,
			transition: { duration: 0.0 },
		}),
		controls2.start({
			zIndex: 0,
			transition: { duration: 0.0 },
		}));

		await (controls.start({
			x: 0,
			y: 0,
			scale: 1.0,
			rotateY: 180,
			zIndex: 0,
			transition: { duration: 0.0 },
		}),
		controls2.start({
			x: 0,
			y: 0,
			scale: 1.0,
			rotateY: 180,
			zIndex: 0,
			transition: { duration: 0.0 },
		}));
	};
	const handleFlipHigher = async () => {
		await controls.start({
			zIndex: 20,
			transition: { duration: 0.0 },
		});
		await controls.start({
			x: 120,
			y: 72,
			scale: 1.5,
			rotateY: 0,
			zIndex: 20,
			transition: { duration: 0.5 },
		});
		await controls.start({
			x: 120,
			y: 72,
			scale: 1.5,
			rotateY: 0,
			zIndex: 20,
			transition: { duration: 0.3 },
		});
		// Snap back to the original position
		await controls.start({
			x: 0,
			y: 144.06,
			scale: 1.0,
			rotateY: 0,
			zIndex: 20,
			transition: { duration: 0.5 },
		});
	};
	const handleFlipLower = async () => {
		await controls.start({
			zIndex: 20,
			transition: { duration: 0.0 },
		});
		await controls.start({
			x: -120,
			y: 72,
			scale: 1.5,
			rotateY: 0,
			zIndex: 20,
			transition: { duration: 0.5 },
		});
		await controls.start({
			x: -120,
			y: 72,
			scale: 1.5,
			rotateY: 0,
			zIndex: 20,
			transition: { duration: 0.3 },
		});
		// Snap back to the original position
		await controls.start({
			x: 0,
			y: 144.06,
			scale: 1.0,
			rotateY: 0,
			zIndex: 20,
			transition: { duration: 0.5 },
		});
	};
	const handleFlip2 = async () => {
		await (controls.start({
			zIndex: 20,
			transition: { duration: 0.0 },
		}),
		controls2.start({
			zIndex: 20,
			transition: { duration: 0.0 },
		}));

		await (controls.start({
			x: -120,
			y: 72,
			scale: 1.5,
			rotateY: 0,
			zIndex: 20,
			transition: { duration: 0.5 },
		}),
		controls2.start({
			x: 120,
			y: 72,
			scale: 1.5,
			rotateY: 0,
			zIndex: 20,
			transition: { duration: 0.5 },
		}));
		await (controls.start({
			x: -120,
			y: 72,
			scale: 1.5,
			rotateY: 0,
			zIndex: 20,
			transition: { duration: 0.3 },
		}),
		controls2.start({
			x: 120,
			y: 72,
			scale: 1.5,
			rotateY: 0,
			zIndex: 20,
			transition: { duration: 0.3 },
		}));
		// Snap back to the original position
		await (controls.start({
			x: 0,
			y: 144.06,
			scale: 1.0,
			rotateY: 0,
			zIndex: 20,
			transition: { duration: 0.5 },
		}),
		controls2.start({
			x: 0,
			y: 144.06,
			scale: 1.0,
			rotateY: 0,
			zIndex: 20,
			transition: { duration: 0.5 },
		}));
	};
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
	useEffect(() => {
		console.log('Connecting to WebSocket server...');
		const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL!, {
			transports: ['websocket'],
		});

		newSocket.on('connect', () => {
			console.log('Connected to WebSocket server');
		});
		newSocket.on('playerJoined', () => {
			setConnectedToRoom(true);
		});
		newSocket.on('players', (players) => {
			let sortedPlayers = players.sort(
				(a: any, b: any) => b.score - a.score
			);
			setPlayers(sortedPlayers);
			console.log(players);
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
		newSocket.on('guess', (data) => {
			const { guess, currentCard, nextCard, thirdCard } = data;
			let correct = correctRef.current;
			let localNextCard = nextCardRef.current;
			let localThirdCard = thirdCardRef.current;
			if (guess == 'purple' && correct == 'purpleTrue') {
				console.log(localNextCard, localThirdCard);
				setTimeout(() => {
					setIsFlipped(true);
				}, 150);
				handleFlip2()
					.then(() => setShownCard(localThirdCard))
					.then(() => reset2Cards())
					.then(() => {
						setNextCard(nextCard), setThirdCard(thirdCard);
					})
					.then(() => {
						setIsFlipped(false);
						setIsAnimating(false);
					});
			} else if (guess == 'purple' && correct == 'purpleFalse') {
				console.log(localNextCard, localThirdCard);
				setTimeout(() => {
					setIsFlipped(true);
				}, 150);
				handleFlip2()
					.then(() => setShownCard(localThirdCard))
					.then(() => reset2Cards())

					.then(() =>
						setTimeout(() => {
							setIsShownFlipped(false);
						}, 150)
					)
					.then(() => putAwayCards())

					.then(() => setShownCard(currentCard))
					.then(() =>
						setTimeout(() => {
							setIsShownFlipped(true);
						}, 150)
					)
					.then(() => handleSingleFlip())
					.then(() => {
						setNextCard(nextCard), setThirdCard(thirdCard);
					})
					.then(() => {
						setIsFlipped(false);
						setIsAnimating(false);
					});
			}
			if (guess == 'higher' && correct == 'true') {
				setTimeout(() => {
					setIsFlipped(true);
				}, 150);
				handleFlipHigher()
					.then(() => setShownCard(localNextCard))
					.then(() => resetCardPosition())
					.then(() => {
						setNextCard(nextCard), setThirdCard(thirdCard);
					})
					.then(() => {
						setIsFlipped(false);
						setIsAnimating(false);
					});
			} else if (guess == 'higher' && correct == 'false') {
				setTimeout(() => {
					setIsFlipped(true);
				}, 150);
				handleFlipHigher()
					.then(() => setShownCard(localNextCard))
					.then(() => resetCardPosition())
					.then(() =>
						setTimeout(() => {
							setIsShownFlipped(false);
						}, 150)
					)
					.then(() => putAwayCards())

					.then(() =>
						setTimeout(() => {
							setIsShownFlipped(true);
							setShownCard(currentCard);
						}, 150)
					)
					.then(() => handleSingleFlip())
					.then(() => {
						setNextCard(nextCard), setThirdCard(thirdCard);
					})
					.then(() => {
						setIsFlipped(false);
						setIsAnimating(false);
					});
			}
			if (guess == 'lower' && correct == 'true') {
				setTimeout(() => {
					setIsFlipped(true);
				}, 150);
				handleFlipLower()
					.then(() => setShownCard(localNextCard))
					.then(() => resetCardPosition())
					.then(() => {
						setNextCard(nextCard), setThirdCard(thirdCard);
					})
					.then(() => {
						setIsFlipped(false);
						setIsAnimating(false);
					});
			} else if (guess == 'lower' && correct == 'false') {
				setTimeout(() => {
					setIsFlipped(true);
				}, 150);
				handleFlipLower()
					.then(() => setShownCard(localNextCard))
					.then(() => resetCardPosition())
					.then(() =>
						setTimeout(() => {
							setIsShownFlipped(false);
						}, 150)
					)
					.then(() => putAwayCards())

					.then(() =>
						setTimeout(() => {
							setIsShownFlipped(true);
							setShownCard(currentCard);
						}, 150)
					)
					.then(() => handleSingleFlip())
					.then(() => {
						setNextCard(nextCard), setThirdCard(thirdCard);
					})
					.then(() => {
						setIsFlipped(false);
						setIsAnimating(false);
					});
			}
		});
		newSocket.on('correct', (correct) => {
			console.log('Received correct:', correct);
			setCorrect(correct);
			setIsAnimating(true);

			const currentTurn = turnRef.current;
			const currentPlayerName = playerNameRef.current;
			const currentTurnScore = turnScoreRef.current;
			const currentDeathStack = deathStackRef.current;
			if (
				currentTurn &&
				currentTurn === currentPlayerName &&
				correct === 'purpleTrue'
			) {
				// Increase the score

				setTurnScore((prevTurnScore) => prevTurnScore + 1);
				setDeathStack((prevDeathStack) => prevDeathStack + 1);
			}
			if (
				currentTurn &&
				currentTurn === currentPlayerName &&
				correct === 'false'
			) {
				setDeathStack(0);
				setTurnScore(0);
			}
			if (
				currentTurn &&
				currentTurn === currentPlayerName &&
				correct === 'purpleFalse'
			) {
				setDeathStack(0);
				setTurnScore(0);
			}
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
	return (
		<div className='flex flex-col gap-4 w-full items-center h-full bg-gradient-to-b from-purple-400   to-purple-800  p-4 min-h-screen'>
			{rules && (
				<div className='absolute max-w-4xl h-full w-full bg-gradient-to-b from-purple-400 to-purple-800 z-50'>
					<div className='relative max-w-xl mx-auto p-6 rounded-lg shadow-md'>
						<button
							className='absolute right-4 top-4'
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
								Guessing higher or lower draws ONE card and
								compares it to the current card. If you get it
								right, the card goes in the death stack.
							</li>
							<li className='mb-2'>
								Guessing Purple draws TWO cards and compares the
								two suits. Red and blue need to combine to make
								purple. If you get it right, both cards goes in
								the death stack.
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
								to the amount of cards in the death stack.
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
								to the amount of cards in the death stack.
							</li>
						</ol>
						<span className='font-bold'>Getting it Wrong</span>
						<ol className='list-disc pl-5 space-y-2'>
							<li className='mb-2'>
								Getting it wrong shuffles the deck
							</li>
							<li className='mb-2'>
								When you get one wrong, you lose points equal to
								the death stack AND the cards you were dealt
							</li>
						</ol>
					</div>
				</div>
			)}

			{!connectedToRoom ? (
				<div className='max-w-4xl flex flex-col gap-2 uppercase font-bold h-full'>
					<h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl '>
						Purple
					</h1>
					<div className='items-center text-center'>
						<h1>Room Id</h1>
						<input
							required
							className='border border-black text-center'
							type='input'
							onChange={(e) => setRoomId(e.target.value)}
						/>
					</div>
					<div className='items-center text-center'>
						<h1>Username</h1>
						<input
							required
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

					<button
						className='uppercase font-bold border rounded-full bg-white text-purple-900 hover:scale-105 p-2 mt-4'
						onClick={() => handleJoinRoom(roomId, playerName)}
					>
						Join
					</button>
				</div>
			) : (
				<div className='flex flex-col items-center h-full w-full max-w-4xl'>
					<h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl '>
						Purple
					</h1>
					<div className='flex justify-between items-center w-full px-8'>
						<button onClick={() => setRules(!rules)}>Rules</button>

						<div>
							<h1 className='font-bold tracking-tight text-gray-900 text-xl '>
								Room: {roomId}
							</h1>
							<h1 className='font-bold tracking-tight text-gray-900 text-xl '>
								Username: {playerName}
							</h1>
						</div>
					</div>

					<div className='flex  w-full text-center justify-center p-4 gap-4'>
						{players
							.slice(0, 3)
							.map((player: any, index: number) => (
								<div
									key={index}
									className='flex flex-col text-2xl text-center items-center'
								>
									{index == 0 && (
										<h1 className='underline'>1st Place</h1>
									)}
									{index == 1 && (
										<h1 className='underline'>2nd Place</h1>
									)}
									{index == 2 && (
										<h1 className='underline'>3rd Place</h1>
									)}
									<div className='flex w-full text-center justify-center'>
										{player.name}: {player.score}
									</div>
									<div></div>
								</div>
							))}
					</div>

					<div className='flex text-center w-full justify-between gap-4'>
						<div className='font-bold w-full'>
							<h1>Death Stack</h1>
							<h1 className=' text-3xl font-semibold tracking-tight text-red-600 sm:text-5xl'>
								{deathStack}
							</h1>
						</div>
						<div className='font-bold w-full'>
							<h1>Cards Left</h1>
							<h1 className=' text-3xl font-semibold tracking-tight text-red-600 sm:text-5xl'>
								{deckSize}
							</h1>
						</div>
						<div className='font-bold w-full'>
							<h1>Your Score</h1>
							<h1 className=' text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl'>
								{totalScore}
							</h1>
						</div>
					</div>
					<div className='flex flex-col items-center relative gap-4 w-full py-4 justify-between'>
						<img
							className='z-10 w-[90px]'
							src={`./blue2.svg`}
							alt=''
						/>

						<motion.div
							className=' w-[90px]'
							initial={{}}
							animate={controls3}
						>
							<div className='front'>
								{isShownFlipped ? (
									<img
										className=' w-[90px]'
										src={`./${shownCard}.svg`}
										alt=''
									/>
								) : (
									<img
										className=' w-[90px]'
										src={`./blue2.svg`}
										alt=''
									/>
								)}
							</div>
						</motion.div>
						{turnScore >= 3 && (
							<button
								onClick={() => handlePass(deathStack)}
								disabled={isAnimating}
								className='disabled:bg-red-500 bg-purple-500 hover:bg-purple-400 text-white font-bold py-2 px-4 border-b-4 border-purple-700 hover:border-purple-500 rounded col-span-3 absolute z-40 translate-y-52'
							>
								Pass
							</button>
						)}
						<motion.div
							className='absolute w-[90px]'
							initial={{ rotateY: 180, x: 0 }}
							animate={controls}
						>
							<div className='front'>
								{isFlipped ? (
									<img
										className=' w-[90px]'
										src={`./${nextCard}.svg`}
										alt=''
									/>
								) : (
									<img
										className=' w-[90px]'
										src={`./blue2.svg`}
										alt=''
									/>
								)}
							</div>
						</motion.div>
						<motion.div
							className='absolute w-[90px]'
							initial={{ rotateY: 180, x: 0 }}
							animate={controls2}
						>
							<div className='front'>
								{isFlipped ? (
									<img
										className=' w-[90px]'
										src={`./${thirdCard}.svg`}
										alt=''
									/>
								) : (
									<img
										className=' w-[90px]'
										src={`./blue2.svg`}
										alt=''
									/>
								)}
							</div>
						</motion.div>
					</div>

					{turn && turn == playerName && (
						<div className='grid grid-cols-3 gap-4 p-4'>
							<button
								onClick={() => handleGuess('lower')}
								disabled={isAnimating}
								className='disabled:bg-red-500 bg-purple-400 hover:bg-purple-400 text-white font-bold py-2 px-4 border-b-4 border-purple-700 hover:border-purple-500 rounded'
							>
								Lower
							</button>
							<button
								onClick={() => handleGuess('purple')}
								disabled={isAnimating}
								className='disabled:bg-red-500 bg-purple-900 hover:bg-purple-400 text-white font-bold text-xl py-2 px-4 border-b-4 border-purple-950 hover:border-purple-500 rounded'
							>
								Purple
							</button>
							<button
								onClick={() => handleGuess('higher')}
								disabled={isAnimating}
								className='disabled:bg-red-500 bg-purple-500 hover:bg-purple-400 text-white font-bold py-2 px-4 border-b-4 border-purple-700 hover:border-purple-500 rounded'
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
