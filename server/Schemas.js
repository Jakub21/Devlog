const mng = require('mongoose');
const Schema = mng.Schema;
const ObjectId = Schema.ObjectId;

const usersSchema = new Schema({
  username: String,
  admin: Boolean,
  email: String,
  password: String,
  sessionID: String,
  isOnline: Boolean,
  joined: Date
});
mng.model('Users', usersSchema);
exports.usersSchema = usersSchema;

const contentSchema = new Schema({
  content: String,
});
mng.model('Content', contentSchema);
exports.contentSchema = contentSchema;

const postsSchema = new Schema({
  title: String,
  prompt: String,
  draft: Boolean,
  tags: [String],
  timestamp: Date,
  lastUpdate: Date,
  updatesCount: Number,
  views: Number,
  content: {
    type: ObjectId,
    ref: 'Content'
  },
  author: {
    type: ObjectId,
    ref: 'Users'
  },
  likes: [{
    type: ObjectId,
    ref: 'Users'
  }],
  comments: [{
    content: String,
    timestamp: Date,
    userID: {
      type: ObjectId,
      ref: 'Users'
    },
    likes: [{
      type: ObjectId,
      ref: 'Users'
    }]
  }],
});
mng.model('Posts', postsSchema);
exports.postsSchema = postsSchema;
