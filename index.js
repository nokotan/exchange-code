const http = require('http');
const handleRequest = require('./src/handleRequest');

const port = process.env.PORT || 8083;
const ip = '0.0.0.0';

const server = http.createServer(handleRequest);

console.log("Listening on http://" + ip + ":" + port);
server.listen(port, ip);
