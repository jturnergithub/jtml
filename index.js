import http from "http";
import {radians} from "./common/util/MathUtil.js";

const PORT = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World! '  + radians(90));
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});