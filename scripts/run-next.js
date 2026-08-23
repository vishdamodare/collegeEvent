process.env.ELECTRON_RUN_AS_NODE = "1";
process.env.NODE_ENV = "development";

const { spawn } = require("child_process");
const helperPath = "/Applications/Antigravity IDE.app/Contents/Frameworks/Antigravity IDE Helper (Plugin).app/Contents/MacOS/Antigravity IDE Helper (Plugin)";

console.log("Starting Next.js via CLI wrapper...");

const child = spawn(helperPath, ["./node_modules/next/dist/bin/next", "dev", "-p", "3000"], {
  cwd: process.cwd(),
  env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" },
  stdio: "inherit",
});

child.on("error", (err) => console.error("Spawn error:", err));
child.on("exit", (code) => console.log("Next process exited with code:", code));
