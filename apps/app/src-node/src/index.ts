import readline from "readline";

function onMessage(callback: (msg: any) => void) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: false,
	});
	rl.on("line", (line) => {
		try {
			const ev = JSON.parse(line);
			callback(ev);
		} catch {
			process.exit(2);
		}
	});
}

function send(msg: any) {
	console.log(JSON.stringify(msg));
}

function main() {
	let interval: any;
	let count = 0;
	onMessage((msg) => {
		switch (msg.event) {
			case "start":
				interval = setInterval(
					() => send({ event: "run", payload: ++count }),
					1500,
				);
				break;
			case "stop":
				clearInterval(interval);
				break;
			case "reset":
				count = 0;
				break;
		}
	});
}

main();
