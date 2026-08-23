const http = require("http");
const url = require("url");
const next = require("next");

process.env.ELECTRON_RUN_AS_NODE = "1";
process.env.NODE_ENV = "development";

const dev = true;
const port = 3000;
const app = next({ dev, dir: process.cwd() });
const handle = app.getRequestHandler();

console.log("[Direct Server] Starting app.prepare()...");

app.prepare()
  .then(() => {
    const server = http.createServer((req, res) => {
      const parsedUrl = url.parse(req.url, true);
      handle(req, res, parsedUrl);
    });

    server.listen(port, "0.0.0.0", (err) => {
      if (err) throw err;
      console.log(`\n>>> Next.js App is running at http://localhost:${port} <<<\n`);
    });
  })
  .catch((err) => {
    console.error("[Direct Server] Error:", err);
  });
