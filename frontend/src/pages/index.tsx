import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { motion, useAnimation } from 'framer-motion';

const Chat = () => {
	const [roomId, setRoomId] = useState<string>();
	const [playerName, setPlayerName] = useState<string>();
	const [connectedToRoom, setConnectedToRoom] = useState(false);
	const [currentCard, setCurrentCard] = useState();
	const [nextCard, setNextCard] = useState();
	const [thirdCard, setThirdCard] = useState();
	const [turnScore, setTurnScore] = useState(0);
	const [totalScore, setTotalScore] = useState(0);
	const [correct, setCorrect] = useState(null);
	const [deathStack, setDeathStack] = useState(0);
	const [socket, setSocket] = useState<any>();
	const [turn, setTurn] = useState(undefined);
	const turnRef = useRef();
	const playerNameRef = useRef<string>();
	const currentCardRef = useRef();
	const nextCardRef = useRef();
	const thirdCardRef = useRef();
	const turnScoreRef = useRef(0);
	const deathStackRef = useRef(0);
	const [isFlipped, setIsFlipped] = useState(false);
	const controls = useAnimation();
	const controls2 = useAnimation();
	const [isAnimating, setIsAnimating] = useState(false);
	const handleFlip = async () => {
		await controls.start({
			x: 150,
			rotateY: 0,
			zIndex: 0,
			transition: { duration: 0.5 },
		});

		// Snap back to the original position
		await controls.start({
			x: 0,
			rotateY: 0,
			zIndex: 20,
			transition: { duration: 0.5 },
		});
		await controls.start({
			x: 0,
			rotateY: 180,
			zIndex: 0,
			transition: { duration: 0 },
		});
		setIsFlipped(false);
		setIsAnimating(false);
	};
	const handleFlip2 = async () => {
		await controls.start({
			x: 150,
			rotateY: 0,
			zIndex: 0,
			transition: { duration: 0.5 },
		});
		await controls2.start({
			x: 300,
			rotateY: 0,
			zIndex: 0,
			transition: { duration: 0.5 },
		});

		// Snap back to the original position
		await controls.start({
			x: 0,
			rotateY: 0,
			zIndex: 0,
			transition: { duration: 0.5 },
		});
		await controls2.start({
			x: 0,
			rotateY: 0,
			zIndex: 20,
			transition: { duration: 0.5 },
		});
		await controls.start({
			x: 0,
			rotateY: 180,
			zIndex: 0,
			transition: { duration: 0 },
		});
		await controls2.start({
			x: 0,
			rotateY: 180,
			zIndex: 0,
			transition: { duration: 0 },
		});
		setIsFlipped(false);
		setIsAnimating(false);
	};
	useEffect(() => {
		turnRef.current = turn;
		playerNameRef.current = playerName;
		currentCardRef.current = currentCard;
		nextCardRef.current = nextCard;
		thirdCardRef.current = thirdCard;
		turnScoreRef.current = turnScore;
		deathStackRef.current = deathStack;
	}, [
		turn,
		playerName,
		nextCard,
		currentCard,
		turnScore,
		deathStack,
		thirdCard,
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
		newSocket.on('currentCard', (currentCard) => {
			setCurrentCard(currentCard);
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
		newSocket.on('guess', (guess) => {
			if (guess == 'purple') {
				handleFlip2();
				setTimeout(() => {
					setIsFlipped(true);
				}, 150);
				setTimeout(() => {
					const thirdCard = thirdCardRef.current;

					setCurrentCard(thirdCard);
				}, 2000);
				setTimeout(() => {
					const thirdCard = thirdCardRef.current;

					setCurrentCard(thirdCard);
				}, 2000);
			} else {
				handleFlip();
				setTimeout(() => {
					setIsFlipped(true);
				}, 300);
				setTimeout(() => {
					const nextCard = nextCardRef.current;

					setCurrentCard(nextCard);
				}, 1000);
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
				setTotalScore(
					(prevTotalScore) => prevTotalScore - currentDeathStack - 1
				);

				setDeathStack(0);
				setTurnScore(0);
			}
			if (
				currentTurn &&
				currentTurn === currentPlayerName &&
				correct === 'purpleFalse'
			) {
				setTotalScore(
					(prevTotalScore) => prevTotalScore - currentDeathStack - 2
				);

				setDeathStack(0);
				setTurnScore(0);
			}
		});
		newSocket.on('turn', (turn) => {
			setTurn(turn);
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

			setTotalScore(
				(prevTotalScore) => prevTotalScore + turnScoreRef.current
			);
		}
	};
	return (
		<div className='flex flex-col items-center p-4 gap-4'>
			<h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl '>
				Purple
			</h1>

			{!connectedToRoom ? (
				<div className='max-w-4xl flex flex-col'>
					<h1>RoomId</h1>
					<input
						className='border border-black'
						type='input'
						onChange={(e) => setRoomId(e.target.value)}
					/>
					<h1>Username</h1>
					<input
						className='border border-black'
						type='input'
						onChange={(e) => setPlayerName(e.target.value)}
					/>
					<button onClick={() => handleJoinRoom(roomId, playerName)}>
						Join
					</button>
				</div>
			) : (
				<>
					<div className='flex text-center gap-4'>
						<div className='font-bold'>
							<h1>Total Score</h1>
							<h1 className=' text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl'>
								{totalScore}
							</h1>
						</div>

						<div className='font-bold'>
							<h1>Turn Score</h1>
							<h1 className=' text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl'>
								{turnScore}
							</h1>
						</div>
						<div className='font-bold'>
							<h1>Death Stack</h1>
							<h1 className=' text-3xl font-semibold tracking-tight text-red-600 sm:text-5xl'>
								{deathStack}
							</h1>
						</div>
					</div>
					<div className='flex relative gap-4'>
						<div className='z-10 flashcard'>
							<div className='front'>
								<img
									className=' h-44'
									src={`./${currentCard}.svg`}
									alt=''
								/>
							</div>
						</div>
						<motion.div
							className='absolute h-44'
							initial={{ rotateY: 180, x: 0 }}
							animate={controls}
						>
							<div className='front'>
								{isFlipped ? (
									<img
										className=' h-44'
										src={`./${nextCard}.svg`}
										alt=''
									/>
								) : (
									<img
										className=' h-44'
										src={`./blue2.svg`}
										alt=''
									/>
								)}
							</div>
						</motion.div>
						<motion.div
							className='absolute h-44'
							initial={{ rotateY: 180, x: 0 }}
							animate={controls2}
						>
							<div className='front'>
								{isFlipped ? (
									<img
										className=' h-44'
										src={`./${thirdCard}.svg`}
										alt=''
									/>
								) : (
									<img
										className=' h-44'
										src={`./blue2.svg`}
										alt=''
									/>
								)}
							</div>
						</motion.div>
					</div>

					{turn && turn == playerName && (
						<div className='flex gap-4 p-4'>
							<button
								onClick={() => handleGuess('lower')}
								disabled={isAnimating}
								className='disabled:bg-red-500 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded'
							>
								Lower
							</button>
							<button
								onClick={() => handleGuess('higher')}
								disabled={isAnimating}
								className='disabled:bg-red-500 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded'
							>
								Higher
							</button>
							<button
								onClick={() => handleGuess('purple')}
								disabled={isAnimating}
								className='disabled:bg-red-500 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded'
							>
								Purple
							</button>
							{turnScore >= 3 && (
								<button
									onClick={() => handlePass(deathStack)}
									disabled={isAnimating}
									className='disabled:bg-red-500 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded'
								>
									Pass
								</button>
							)}
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default Chat;
