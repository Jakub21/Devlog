const mng = require('mongoose');
const Validator = require('../src/Validator');
const Sanitizer = require('../src/Sanitizer');
const bcrypt = require('bcrypt');

let UserApi = {
  reset: async () => {
    await mng.model('Users').updateMany({}, {isOnline:false});
  },

  connection: async (socket) => {
    global.log.entry('Socket', 'Client connected');
    socket.emit('Initialize', {
      version:global.config.version, release:global.config.release});
  },

  disconnect: async (socket) => {
    let user = await mng.model('Users').findOneAndUpdate(
      {sessionID:socket.id}, {isOnline:false});
    if (user !== null)
      global.log.entry('Socket', `${user.username} disconnected`);
  },

  CredsLogin: async (socket, data) => {
    cookies = false;
    let {username, password, sessionID} = data;
    let users = await mng.model('Users').find({username});
    let validation = Validator.composite({users, user:users[0], input:data},
      ['userExists', 'password', '!isOnline']);
    if (!validation.success) {
      socket.emit('Login', {cookies, success:false, reason:validation.reason});
      return;
    }
    await mng.model('Users').findOneAndUpdate({username},
      {isOnline:true, sessionID});
    socket.emit('Login', {cookies, success:true,
      user:Sanitizer.sanitizeUser(users[0])});
    global.log.entry('Socket', `${username} logged in`);
  },

  CookieLogin: async (socket, data) => {
    cookies = true;
    let {username, sessionID, newSession} = data;
    let users = await mng.model('Users').find({username});
    let validation = Validator.composite({users, user:users[0], input:data},
      ['userExists', 'sessionID', '!isOnline']);
    if (!validation.success) {
      socket.emit('Login', {cookies, success:false, reason:validation.reason});
      return;
    }
    await mng.model('Users').findOneAndUpdate({username},
      {isOnline:true, sessionID:newSession});
    socket.emit('Login', {cookies, success:true,
      user:Sanitizer.sanitizeUser(users[0])});
    global.log.entry('Socket', `${username} logged in (cookies)`);
  },

  Logout: async (socket, data) => {
    let {username, sessionID} = data;
    let users = await mng.model('Users').find({username});
    let validation = Validator.composite({users, user:users[0], input:data},
      ['userExists', 'sessionID', 'isOnline']);
    if (!validation.success) {
      socket.emit('Logout', {cookies, success:false, reason:validation.reason});
      return;
    }
    await mng.model('Users').findOneAndUpdate({username},
      {isOnline:false, sessionID:undefined});
    socket.emit('Logout', {success:true});
    global.log.entry('Socket', `${username} logged out`);
  },

  Signup: async (socket, data) => {
    let uc = global.config.user;
    let {username, email, password, sessionID} = data;
    let users = await mng.model('Users').find({username});
    let validation = Validator.composite({users, username, email, password},
      ['!userExists', 'validUsername', 'validEmail', 'validPassword']);
    if (!validation.success) {
      socket.emit('Signup', {success:false, reason:validation.reason});
      return;
    }
    let hash = bcrypt.hashSync(password, global.config.bcrypt.saltRounds);
    mng.model('Users').create({
      username, email, password:hash, sessionID,
      joined: Date.now() + global.config.tzOffset
    });
    socket.emit('Signup', {success:true});
    global.log.entry('Socket', `${username} signed up`);
  },

  SetAdminFlag: async (socket, data) => {
    return; // Comment this to enable admin promotion
    let {username, admin} = data;
    await mng.model('Users').findOneAndUpdate({username}, {admin});
    global.log.entry('Socket', `${username} admin status set to ${admin}`);
  },

  RemoveUser: async (socket, data) => {
    return; // Comment this to enable user removal
    let {username} = data;
    (await mng.model('Users').findOne({username})).deleteOne();
    global.log.entry('Socket', `User ${username} removed from the database`);
  }
};
module.exports = UserApi;
