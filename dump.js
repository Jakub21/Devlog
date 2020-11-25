require('dotenv/config');
const mng = require('mongoose');
mng.set('useFindAndModify', false);

let main = async () => {
  // Connect to the DB and setup schemas
  mng.connect(process.env.DB_URI,
    { useNewUrlParser: true, useUnifiedTopology: true });
  require('./server/Schemas');

  if (process.argv.includes('users')) {
    console.log('Users');
    console.log((await mng.model('Users').find({})));
  }
  if (process.argv.includes('posts')) {
    console.log('Posts');
    console.log((await mng.model('Posts').find({})));
  }
  if (process.argv.includes('content')) {
    console.log('Content');
    console.log((await mng.model('Content').find({})));
  }

  mng.disconnect();
};
main();
