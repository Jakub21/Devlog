const mng = require('mongoose');
const Validator = require('../src/Validator');
const Sanitizer = require('../src/Sanitizer');

let authenticate = async (data, admin=false) => {
  let {userID, sessionID} = data;
  let users = await mng.model('Users').find({_id:userID});
  let {success, reason} = Validator.actionAuth({users, user:users[0], input:data}, admin);
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
    let posts = await mng.model('Posts').find({});
    for (let post of posts) {
      for (let tag of post.tags) {
        if (!tags.includes(tag)) tags.push(tag);
      }
    }
    socket.emit('LoadTagsList', {tags});
  },

  GetLatestPosts: async (socket, data) => {
    let admin = (await authenticate(data, true)).auth;
    let {page} = data;
    let pc = global.config.post;
    let postsRaw = await mng.model('Posts').find({}, null,
      {limit: pc.postsOnPage, sort: {'timestamp': 'desc'}});
    let posts = [];
    for (let post of postsRaw) {
      if (!admin && post.draft) continue;
      posts.push(Sanitizer.sanitizePost(post, admin));
    }
    socket.emit('GetLatestPosts', {success:true, posts, page});
  },

  GetPostDetails: async (socket, data) => {
    let {postID, target, noNav} = data;
    let posts = await mng.model('Posts').find({_id:postID});
    let admin = (await authenticate(data, true)).auth;
    let post = posts[0];
    if (!admin && post.draft) {
      socket.emit('GetPostDetails', {success:false, reason:'Forbidden'});
      return;
    }
    let validation = Validator.composite({posts}, ['postExists']);
    if (!validation.success) {
      socket.emit('GetPostDetails', {success:false, reason:validation.reason});
      return;
    }
    let author = await mng.model('Users').findOne({_id:post.author}).username;
    let commenters = {};
    for (let comment of post.comments) {
      let userID = comment.userID;
      let user = await mng.model('Users').findOne({_id:userID});
      commenters[userID] = user.username;
    }
    let content = await mng.model('Content').findOne({_id:post.content});
    content = Sanitizer.sanitizeContent(content);
    post = Sanitizer.sanitizePost(post);
    socket.emit('GetPostDetails', { success:true,
      postID, post, author, commenters, content, target, noNav
    });
  },

  PublishPost: async (socket, data) => {
    let {auth, reason, user} = await authenticate(data, true); // ADMIN
    if (!auth) {
      socket.emit('PublishPost', {success:false, reason});
      return;
    }
    let {title, prompt, draft, tags, content} = data;
    let posts = await mng.model('Posts').find({title});
    let validation = Validator.composite({posts, title},
      ['!postExists', 'validPostTitle']);
    if (!validation.success) {
      socket.emit('PublishPost', {success:false, reason:validation.reason});
      return;
    }
    let contentEntry = await mng.model('Content').create({content});
    let post = await mng.model('Posts').create({
      title, prompt, draft, tags,
      timestamp: Date.now(), lastUpdate: Date.now(), updatesCount: 0,
      views: 0, content:contentEntry._id, author: user._id,
      likes: [], comments: [],
    });
    socket.emit('PublishPost', {success:true, title});
    global.log.entry('Socket', `${user.username} created post ${title}`);
    global.app.io.sockets.emit('ForceRefresh', {
      action:'publish', postID:post._id});
  },

  UpdatePost: async (socket, data) => {
    let {auth, reason, user} = await authenticate(data, true); // ADMIN
    if (!auth) {
      socket.emit('UpdatePost', {success:false, reason});
      return;
    }
    let {postID, title, prompt, draft, tags, content} = data;
    let posts = await mng.model('Posts').find({_id:postID});
    let newTitlePosts = await mng.model('Posts').find({title});
    let post = posts[0];
    let validation = Validator.composite({posts, newTitlePosts, title},
      ['postExists', 'freePostTitle', 'validPostTitle']);
    if (!validation.success) {
      socket.emit('UpdatePost', {success:false, reason:validation.reason});
      return;
    }
    let update = Object.assign({ title, prompt, draft, tags }, post.draft ? {
        timestamp: Date.now(),
        lastUpdate: Date.now(),
        updatesCount: 0,
      } : {
        lastUpdate: Date.now(),
        updatesCount: post.updatesCount + 1,
    });
    await mng.model('Posts').findOneAndUpdate({_id:postID}, update);
    await mng.model('Content').findOneAndUpdate({_id:post.content}, {content});
    socket.emit('UpdatePost', {success:true, title});
    global.app.io.sockets.emit('ForceRefresh', {action:'update', postID});
  },

  RemovePost: async (socket, data) => {
    let {auth, reason, user} = await authenticate(data, true); // ADMIN
    if (!auth) {
      socket.emit('RemovePost', {success:false, reason});
      return;
    }
    let {postID} = data;
    let post = await mng.model('Posts').findOne({_id:postID});
    let content = await mng.model('Content').findOne({_id:post.content});
    post.deleteOne();
    content.deleteOne();
    socket.emit('RemovePost', {success:true, title:post.title});
    global.log.entry('Socket', `${user.username} removed post ${post.title}`);
    global.app.io.sockets.emit('ForceRefresh', {action:'remove', postID});
  },

  AddComment: async (socket, data) => {
  },

  LikePost: async (socket, data) => {
  },

  LikeComment: async (socket, data) => {
  },
};
module.exports = PostApi;
