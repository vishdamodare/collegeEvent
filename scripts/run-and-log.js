const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const logFile = path.join(process.cwd(), "dev-server.log");
const logStream = fs.createWriteStream(logFile, { flags: "w" });

const helperPath =
  "/Applications/Antigravity IDE.app/Contents/Frameworks/Antigravity IDE Helper (Plugin).app/Contents/MacOS/Antigravity IDE Helper (Plugin)";

logStream.write(`--- Starting Next.js Dev Server at ${new Date().toISOString()} ---\n`);
console.log("Starting Next.js process and streaming output to dev-server.log...");

const child = spawn(
  helperPath,
  ["./node_modules/next/dist/bin/next", "dev", "-p", "3000"],
  {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      PATH: `${path.join(process.cwd(), "scripts/bin")}:${process.env.PATH}`,
    },
  }
);

child.stdout.on("data", (d) => {
  process.stdout.write(d);
  logStream.write(d);
});

child.stderr.on("data", (d) => {
  process.stderr.write(d);
  logStream.write(d);
});

child.on("error", (err) => {
  console.error("Child error:", err);
  logStream.write(`Error: ${err.message}\n`);
});

child.on("exit", (code) => {
  console.log(`Child exited with code ${code}`);
  logStream.write(`Child exited with code ${code}\n`);
});
