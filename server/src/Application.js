const http = require('http');
const express = require('express');
const favicon = require('serve-favicon');
const socketio = require('socket.io');

class Application {
  constructor(port, config) {
    this.express = express();
    this.express.use(express.static(config.publicDirectory));
    this.express.use(favicon(config.faviconDirectory));
    this.http = http.createServer(this.express);
    this.io = socketio.listen(this.http);
    this.http.listen(port);
    this.port = port;
    this.socketApi = {}
  }
  setupSocket() {
    this.io.on('connection', (socket) => {
      for (const [key, value] of Object.entries(this.socketApi)) {
        if (key == 'connection') continue;
        socket.on(key, (evt) => {value(socket, evt)});
      }
      if (this.socketApi.connection) this.socketApi.connection(socket);
    });
  }
  on(name, callback) {
    global.log.entry('Socket', `Assigned callback for "${name}"`);
    this.socketApi[name] = callback;
  }
}
module.exports = Application;
