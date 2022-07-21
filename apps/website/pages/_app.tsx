import Head from "next/head";
import { AppProps } from "next/app";
import React from "react";
import Particles from "preact-particles";
import { loadStarsPreset } from "tsparticles-preset-stars";

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
	const init = (main: any) => loadStarsPreset(main);

	return (
		<>
			<Head>
				<link rel="shortcut icon" href="/favicon.png" />
				<title>Like screaming into the Void...</title>
			</Head>
			<Particles
				width="100%"
				height="100%"
				init={init}
				options={{
					preset: "stars",
					fullScreen: {
						enable: true,
						zIndex: -1000,
					},
					background: {
						color: "#212121",
						size: "cover",
					},
				}}
			/>
			<Component {...pageProps} />
		</>
	);
};

export default App;
