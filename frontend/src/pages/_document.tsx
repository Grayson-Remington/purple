import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html
			className='h-full'
			lang='en'
		>
			<Head>
				<link
					rel='shortcut icon'
					href='./blob.ico'
					type='image/svg'
				/>
			</Head>
			<body className='h-full '>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
