const fs = require("fs");
const { execSync } = require("child_process");

function main() {
	const rustInfo = execSync("rustc -vV", { encoding: "utf8" });
	const targetTriple = /host: (\S+)/g.exec(rustInfo)[1];
	if (!targetTriple) {
		console.error("Failed to determine platform target triple");
	}
	fs.renameSync(
		`src-tauri/binaries/backend`,
		`src-tauri/binaries/backend-${targetTriple}`
	);
}

main();
