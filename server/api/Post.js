const mongoose = require('mongoose');
const Validator = require('../src/Validator');
const Sanitizer = require('../src/Sanitizer');

let authenticate = async (data) => {
  let {userID, sessionID} = data;
  let users = await mongoose.model('Users').find({_id:userID});
  let {success, reason} = Validator.actionAuth({users, user:users[0], input:data});
  return {auth:success, reason, user:users[0]};
}

let PostApi = {
  reset: async () => {},

  LoadTagsList: async (socket, data) => {
    let {auth, reason, user} = await authenticate(data);
    if (!auth) {
      socket.emit('LoadTagsList', {success:false, reason});
      return;
    }
    let tags = [];
    let posts = await mongoose.model('Posts').find({});
    for (let post of posts) {
      for (let tag of post.tags) {
        if (!tags.includes(tag)) tags.push(tag);
      }
    }
    socket.emit('LoadTagsList', {tags});
  },

  GetLatestPosts: async (socket, data) => {
  },

  GetUserPosts: async (socket, data) => {
  },

  GetPostUsernames: async (socket, data) => {
  },

  PublishPost: async (socket, data) => {
    let {auth, reason, user} = await authenticate(data);
    if (!auth) {
      socket.emit('PublishPost', {success:false, reason});
      return;
    }
    let {title, prompt, tags, content} = data;
    let posts = await mongoose.model('Posts').find({title});
    let validation = Validator.composite({posts, title},
      ['!postExists', 'validPostTitle']);
    if (!validation.success) {
      socket.emit('PublishPost', {success:false, reason:validation.reason});
      return;
    }
    let contentEntry = await mongoose.model('Content').create({content});
    mongoose.model('Posts').create({
      title, prompt, tags,
      timestamp: Date.now(), lastUpdate: Date.now(), updatesCount: 0,
      views: 0, content:contentEntry._id, author: user._id, likes: [], comments: [],
    });
    socket.emit('PublishPost', {success:true, title});
    global.log.entry('Socket', `${user.username} created post ${title}`);
  },

  AddComment: async (socket, data) => {
  },

  LikePost: async (socket, data) => {
  },

  LikeComment: async (socket, data) => {
  },
};
module.exports = PostApi;
