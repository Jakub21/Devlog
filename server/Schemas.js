const mongoose = require('mongoose');
const Schema = mongoose.Schema;
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
mongoose.model('Users', usersSchema);
exports.usersSchema = usersSchema;

const contentSchema = new Schema({
  content: String,
  images: [String],
});
mongoose.model('Content', contentSchema);
exports.contentSchema = contentSchema;

const postsSchema = new Schema({
  title: String,
  prompt: String,
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
mongoose.model('Posts', postsSchema);
exports.postsSchema = postsSchema;
