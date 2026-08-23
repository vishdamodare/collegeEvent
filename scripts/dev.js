process.env.ELECTRON_RUN_AS_NODE = "1";
process.env.NODE_ENV = "development";

const { nextDev } = require("next/dist/cli/next-dev");

// Start next dev server on port 3000
nextDev({ port: 3000 }, undefined, process.cwd());
