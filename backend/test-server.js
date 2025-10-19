const http = require('http');
const port = 5001;
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type':'text/plain'});
  res.end('ok');
});
server.listen(port, () => console.log('tiny server listening on', port));
