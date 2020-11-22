
class Sanitizer {
  constructor() {}

  _sanitize(what, schema, exclude=[]) {
    let sanitized = {};
    for (let key of Object.keys(schema)) {
      if (exclude.includes(key)) continue;
      sanitized[key] = what[key];
    }
    sanitized.ID = what._id;
    return sanitized;
  }

  sanitizeUser(user) {
    let schema = require('../Schemas').usersSchema.obj;
    return this._sanitize(user, schema, ['password', 'sessionID']);
  }

  sanitizePost(post, includePasscode) {
    let schema = require('../Schemas').postsSchema.obj;
    return this._sanitize(post, schema, ['views']);
  }
}
module.exports = new Sanitizer();
