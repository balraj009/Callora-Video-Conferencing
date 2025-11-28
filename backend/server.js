import http from "http";
import app from "./app.js";
import connectToSocketIO from "./controller/socket.controller.js";

const port = process.env.PORT || 5000;

const server = http.createServer(app);

connectToSocketIO(server);

server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
