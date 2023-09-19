import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const Chat = () => {
	const [rules, setRules] = useState(false);
	const [roomId, setRoomId] = useState<string>('');
	const [playerName, setPlayerName] = useState<string>('');
	const [usernameAlreadyExists, setUsernameAlreadyExists] = useState(false);
	const [players, setPlayers] = useState([]);
	const [tooManyPlayers, setTooManyPlayers] = useState(false);
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
	const [gameOver, setGameOver] = useState(false);
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
	const [isFlipped, setIsFlipped] = useState(false);
	const [isShownFlipped, setIsShownFlipped] = useState(true);

	const [isAnimating, setIsAnimating] = useState(false);
	const [animationNextCard, setAnimationNextCard] = useState('undefined');
	const [animationThirdCard, setAnimationThirdCard] = useState('undefined');
	const [animationShownCard, setAnimationShownCard] = useState('undefined');

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
			let sortedPlayers = players.sort(
				(a: any, b: any) => b.score - a.score
			);
			setPlayers(sortedPlayers);
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
			} = data;
			setCorrect(correct);
			setTurn(turn);
			setTurnScore(turnScore);
			setDeathStack(deathStack);
			let localNextCard = nextCardRef.current;
			let localThirdCard = thirdCardRef.current;
			const currentTurn = turnRef.current;
			const currentPlayerName = playerNameRef.current;
			setIsAnimating(true);
			if (guess == 'purple' && correct == 'purpleTrue') {
				setAnimationNextCard('flipCardHigherAnimation');
				setAnimationThirdCard('flipCardLowerAnimation');
				try {
					await delay(150);
					setIsFlipped(true);

					await delay(850); // Adjust the delay as needed
					setNextCard(nextCard);
					setThirdCard(thirdCard);
					setShownCard(localThirdCard);
					setAnimationNextCard('undefined');
					setAnimationThirdCard('undefined');
					setIsFlipped(false);
					setIsAnimating(false);
					// Adjust the delay as needed
				} catch (error) {
					console.error('An error occurred:', error);
				}
			} else if (guess == 'purple' && correct == 'purpleFalse') {
				setAnimationNextCard('flipCardHigherAnimation');
				setAnimationThirdCard('flipCardLowerAnimation');
				try {
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
					setIsFlipped(false);
					setIsAnimating(false);
					// Adjust the delay as needed
				} catch (error) {
					console.error('An error occurred:', error);
				}
			}
			if (guess == 'higher' && correct == 'true') {
				setAnimationNextCard('flipCardHigherAnimation');
				try {
					await delay(150);
					setIsFlipped(true);

					await delay(850); // Adjust the delay as needed
					setNextCard(nextCard);
					setThirdCard(thirdCard);
					setShownCard(localNextCard);
					setAnimationNextCard('undefined');
					setIsFlipped(false);
					setIsAnimating(false);
					// Adjust the delay as needed
				} catch (error) {
					console.error('An error occurred:', error);
				}
			} else if (guess == 'higher' && correct == 'false') {
				setAnimationNextCard('flipCardHigherAnimation');
				try {
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
					setIsFlipped(false);
					setIsAnimating(false);
					// Adjust the delay as needed
				} catch (error) {
					console.error('An error occurred:', error);
				}
			}

			if (guess == 'lower' && correct == 'true') {
				setAnimationNextCard('flipCardLowerAnimation');
				try {
					await delay(150);
					setIsFlipped(true);

					await delay(850); // Adjust the delay as needed
					setNextCard(nextCard);
					setThirdCard(thirdCard);
					setShownCard(localNextCard);
					setAnimationNextCard('undefined');
					setIsFlipped(false);
					setIsAnimating(false);
					// Adjust the delay as needed
				} catch (error) {
					console.error('An error occurred:', error);
				}
			} else if (guess == 'lower' && correct == 'false') {
				setAnimationNextCard('flipCardLowerAnimation');
				try {
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
					setIsFlipped(false);
					setIsAnimating(false);
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
			socket.emit('playAgain');
		}
	};
	return (
		<div className='flex flex-col gap-4 w-full items-center min-h-screen h-fit bg-gradient-to-b from-purple-400 to-purple-800'>
			{gameOver && (
				<div className='absolute h-[700px] min-h-full w-full flex flex-col items-center z-50'>
					<div className='absolute inset-0 bg-gradient-to-b from-purple-400 to-purple-800 h-full opacity-95'></div>
					<div className='absolute flex flex-col items-center max-w-4xl h-full w-full gap-4'>
						<h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
							Game Over
						</h1>
						<button
							className='cursor-pointer disabled:bg-red-500 bg-purple-400 hover:bg-purple-400 text-white font-bold py-2 px-4 border-b-4 border-purple-700 hover:border-purple-500 rounded'
							onClick={handlePlayAgain}
						>
							Play Again?
						</button>
						<h1>Votes Needed: {Math.ceil(players.length / 2)}</h1>
						<h1>Vote Total: {voteTotal}</h1>
						{players.map((player: any, index: number) => (
							<div
								key={index}
								className='flex flex-col text-2xl text-center items-center'
							>
								<div className='flex w-full text-center justify-center'>
									{index + 1}. {player.name}: {player.score}
								</div>
								<div></div>
							</div>
						))}
					</div>
				</div>
			)}
			{rules && (
				<div className='absolute h-fit min-h-screen w-full flex flex-col items-center z-50'>
					<div className='absolute inset-0 bg-gradient-to-b from-purple-400 to-purple-800 '></div>
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
					<h1 className='text-4xl font-bold tracking-tight text-gray-900  '>
						Purple
					</h1>
					<div className='items-center text-center'>
						<h1>Room Id </h1>

						<input
							required
							maxLength={8}
							className='border border-black text-center'
							type='input'
							onChange={(e) => setRoomId(e.target.value)}
						/>
						{tooManyPlayers && (
							<h1 className='text-red-800'>Room is Full</h1>
						)}
					</div>
					<div className='items-center text-center'>
						<h1>Username</h1>
						<input
							required
							maxLength={8}
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
				<div className='flex flex-col items-center h-[700px] w-full max-w-2xl shadow-2xl rounded-lg p-4'>
					<h1 className='text-4xl font-bold tracking-tight text-gray-900 uppercase '>
						Purple
					</h1>
					<div className='flex justify-between items-center w-full px-8'>
						<button
							className='cursor-pointer bg-purple-500 hover:bg-purple-400 text-white font-bold py-2 px-4 border-b-4 border-purple-700 hover:border-purple-500 rounded'
							onClick={() => setRules(!rules)}
						>
							Rules
						</button>

						<div>
							<h1 className='font-bold tracking-tight text-gray-900 text-xl '>
								Room: {roomId}
							</h1>
							<h1 className='font-bold tracking-tight text-gray-900 text-xl '>
								Username: {playerName}
							</h1>
						</div>
					</div>

					<div className='flex justify-between items-stretch rounded-t-lg bg-slate-200 text-purple-800 w-full overflow-x-auto overflow-y-hidden gap-4'>
						<div className='vertical-text text-xs bg-white items-stretch font-bold'>
							Last
						</div>
						<div className='flex w-full text-xl gap-4'>
							{players
								.sort((a: any, b: any) => b.score - a.score)
								.reverse()
								.map((player: any, index: number) => (
									<div
										key={index}
										className={`flex flex-col items-center justify-center ${
											player.score < -10
												? 'text-red-600 animate-scale'
												: ''
										}`}
									>
										<span>{player.name}</span>
										<span>{player.score}</span>
									</div>
								))}
						</div>
						<div className='vertical-text text-xs font-bold  bg-white items-stretch'>
							First
						</div>
					</div>

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
						className='flex flex-col  items-center relative gap-4 w-full py-4 justify-between'
					>
						<img
							className='z-10 w-[90px]'
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
							} w-[90px]`}
						>
							{isFlipped ? (
								<img
									style={{ width: '90px' }}
									src={`./${nextCard}.svg`}
									alt=''
								/>
							) : (
								<img
									style={{ width: '90px' }}
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
							} w-[90px]`}
						>
							{isFlipped ? (
								<img
									style={{ width: '90px' }}
									src={`./${thirdCard}.svg`}
									alt=''
								/>
							) : (
								<img
									style={{ width: '90px' }}
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
							} w-[90px]`}
						>
							{isShownFlipped ? (
								<img
									style={{ width: '90px' }}
									src={`./${shownCard}.svg`}
									alt=''
								/>
							) : (
								<img
									style={{ width: '90px' }}
									src={`./blue2.svg`}
									alt=''
								/>
							)}
						</div>
						{turn && turn == playerName && turnScore >= 3 && (
							<button
								onClick={() => handlePass(deathStack)}
								disabled={isAnimating}
								className='disabled:bg-red-500 bg-purple-500 hover:bg-purple-400 text-white font-bold py-2 px-4 border-b-4 border-purple-700 hover:border-purple-500 rounded col-span-3 absolute z-40 translate-y-52'
							>
								Pass
							</button>
						)}
					</div>

					{turn && turn == playerName && (
						<div className='grid grid-cols-3 gap-4 p-4'>
							<button
								onMouseDown={() => handleGuess('lower')}
								disabled={isAnimating}
								className=' cursor-pointer disabled:bg-red-500 bg-purple-500 hover:bg-purple-400 text-white font-bold py-2 px-4 border-b-4 border-purple-700 hover:border-purple-500 rounded'
							>
								Lower
							</button>
							<button
								onMouseDown={() => handleGuess('purple')}
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
