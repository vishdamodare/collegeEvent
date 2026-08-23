process.env.ELECTRON_RUN_AS_NODE = "1";
process.env.NODE_ENV = "development";

const next = require("next");
const http = require("http");

console.log("1. Creating next app instance...");
const app = next({
  dev: true,
  hostname: "localhost",
  port: 3000,
  dir: process.cwd(),
});

console.log("2. Calling app.prepare()...");
app
  .prepare()
  .then(() => {
    console.log("3. app.prepare() resolved successfully!");
    const handle = app.getRequestHandler();
    const server = http.createServer((req, res) => {
      handle(req, res);
    });

    server.listen(3000, "0.0.0.0", () => {
      console.log("4. 🚀 Server is listening at http://localhost:3000");
    });
  })
  .catch((err) => {
    console.error("❌ app.prepare() threw error:", err);
  });
