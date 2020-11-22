const mongoose = require('mongoose');
const Validator = require('../src/Validator');
const Sanitizer = require('../src/Sanitizer');

let UserApi = {
  reset: async () => {
    await mongoose.model('Users').updateMany({}, {isOnline:false});
  },

  connection: async (socket) => {
    global.log.entry('Socket', 'Client connected');
    socket.emit('Initialize', {
      version:global.config.version, release:global.config.release});
  },

  disconnect: async (socket) => {
    let user = await mongoose.model('Users').findOneAndUpdate(
      {sessionID:socket.id}, {isOnline:false});
    if (user !== null)
      global.log.entry('Socket', `${user.username} disconnected`);
  },

  CredsLogin: async (socket, data) => {
    cookies = false;
    let {username, password, sessionID} = data;
    let users = await mongoose.model('Users').find({username});
    let validation = Validator.composite({users, user:users[0], input:data},
      ['userExists', 'password', '!isOnline']);
    if (!validation.success) {
      socket.emit('Login', {cookies, success:false, reason:validation.reason});
      return;
    }
    await mongoose.model('Users').findOneAndUpdate({username},
      {isOnline:true, sessionID});
    socket.emit('Login', {cookies, success:true,
      user:Sanitizer.sanitizeUser(users[0])});
    global.log.entry('Socket', `${username} logged in`);
  },

  CookieLogin: async (socket, data) => {
    cookies = true;
    let {username, sessionID, newSession} = data;
    let users = await mongoose.model('Users').find({username});
    let validation = Validator.composite({users, user:users[0], input:data},
      ['userExists', 'sessionID', '!isOnline']);
    if (!validation.success) {
      socket.emit('Login', {cookies, success:false, reason:validation.reason});
      return;
    }
    await mongoose.model('Users').findOneAndUpdate({username},
      {isOnline:true, sessionID:newSession});
    socket.emit('Login', {cookies, success:true,
      user:Sanitizer.sanitizeUser(users[0])});
    global.log.entry('Socket', `${username} logged in (cookies)`);
  },

  Logout: async (socket, data) => {
    let {username, sessionID} = data;
    let users = await mongoose.model('Users').find({username});
    let validation = Validator.composite({users, user:users[0], input:data},
      ['userExists', 'sessionID', 'isOnline']);
    if (!validation.success) {
      socket.emit('Logout', {cookies, success:false, reason:validation.reason});
      return;
    }
    await mongoose.model('Users').findOneAndUpdate({username},
      {isOnline:false, sessionID:undefined});
    socket.emit('Logout', {success:true});
    global.log.entry('Socket', `${username} logged out`);
  },

  Signup: async (socket, data) => {
    let uc = global.config.user;
    let {username, email, password, sessionID} = data;
    let users = await mongoose.model('Users').find({username});
    let validation = Validator.composite({users, username, email, password},
      ['!userExists', 'validUsername', 'validEmail', 'validPassword']);
    if (!validation.success) {
      socket.emit('Signup', {success:false, reason:validation.reason});
      return;
    }
    mongoose.model('Users').create({
      username, email, password, sessionID,
      joined: Date.now() + global.config.tzOffset
    });
    socket.emit('Signup', {success:true});
    global.log.entry('Socket', `${username} signed up`);
  },

  SetAdminFlag: async (socket, data) => {
    return; // Comment this to enable admin promotion
    let {username, admin} = data;
    await mongoose.model('Users').findOneAndUpdate({username}, {admin});
    global.log.entry('Socket', `${username} admin status set to ${admin}`);
  }
};
module.exports = UserApi;
