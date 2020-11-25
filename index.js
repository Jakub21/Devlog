const fs = require('fs');
require('dotenv/config');

const mng = require('mongoose');
const Application = require('./server/src/Application');
const Logger = require('./server/src/Logger');

mng.set('useFindAndModify', false);

let main = async () => {
  // Load config
  global.config = JSON.parse(fs.readFileSync('config.json'));
  // Create logger
  global.log = new Logger(global.config);
  global.log.newSession();
  // Connect to the DB and setup schemas
  mng.connect(process.env.DB_URI,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {global.log.entry('Database', 'Connection successful');});
  require('./server/Schemas');
  // Create socket app instance
  global.app = new Application(process.env.PORT, {
    publicDirectory: process.env.DIR_PUBLIC,
    faviconDirectory: process.env.DIR_FAVICON
  });
  // Define socket callbacks
  for (let name of ['User', 'Post']) {
    global.log.entry('Socket', `Assigning callbacks from "${name}"`);
    let api = require(`./server/api/${name}`);
    await api.reset();
    for (let [key, callback] of Object.entries(api)) {
      global.app.on(key, callback);
  }}
  // Start socket app
  global.app.setupSocket();
};
main();
