process.env.ELECTRON_RUN_AS_NODE = "1";
process.env.NODE_ENV = "development";

const next = require("next");
const http = require("http");

const port = parseInt(process.env.PORT || "3000", 10);
const hostname = "0.0.0.0";
const app = next({ dev: true, hostname, port, dir: process.cwd() });
const handle = app.getRequestHandler();

console.log(`[Next.js] Initializing dev environment on port ${port}...`);

app.prepare()
  .then(() => {
    const server = http.createServer((req, res) => {
      handle(req, res);
    });

    server.listen(port, hostname, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 CollegeEvents App is LIVE at http://localhost:${port}`);
      console.log(`======================================================\n`);
    });
  })
  .catch((err) => {
    console.error("[Next.js] Failed to start:", err);
  });
