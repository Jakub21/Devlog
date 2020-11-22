
class Validator {
  constructor() {}

  composite(data, keys) {
    let result = {success:true};
    for (let key of keys) {
      let reversed = false;
      if (key.substr(0,1) == '!') {
        key = key.substr(1);
        reversed = true;
      }
      let current = this[key](data, reversed);
      if (reversed) current.success = !current.success;
      result.success = current.success && result.success;
      if (!result.success) {
        result.reason = current.reason;
        break;
      }
    }
    return result;
  }

  // Special composite used before each action of logged-in users
  actionAuth(data) {
    return this.composite(data, ['userExists', 'sessionID', 'isOnline']);
  }

  // String validation that other methods utilize
  isOfLength(data) {
    let {name, str, min, max} = data;
    return { success: (str.length >= min && str.length <= max),
      reason: `${name} must be ${min} to ${max} characters`
    };
  }
  isAlphanumerical(data) {
    let {name, str} = data;
    let invalidChars = false;
    for (let c of str) {
      if (!'abcdefghijklmnopqrstuvwxyz0123456789_'.includes(c.toLowerCase())) {
        invalidChars = true;
        break;
      }
    }
    return { success: !invalidChars,
      reason: `${name} must consist only of letters, numbers and underscores`
    };
  }

  // User authentication
  userExists(data, reversed) {
    return {success:data.users.length == 1,
      reason: reversed? 'User does not exist' : 'User already exists'
    };
  }
  password(data, reversed) {
    let {user, input} = data;
    return { success: user.password == input.password,
      reason: 'Incorrect password'
    };
  }
  sessionID(data, reversed) {
    let {user, input} = data;
    let sessionExists = user.sessionID != undefined;
    return { success: (user.sessionID == input.sessionID) && sessionExists,
      reason: 'Authentication error'
    };
  }
  isOnline(data, reversed) {
    let {user} = data;
    return { success: data.user.isOnline,
      reason: reversed ? 'You are already logged in' : 'You must be logged in'
    };
  }

  // Validation at sign-up
  validUsername(data, reversed) {
    let uc = global.config.user;
    let {username} = data;
    return this.composite(
      {name:'Username', str:username, min:uc.usernameMin, max:uc.usernameMax},
      ['isOfLength', 'isAlphanumerical']
    );
  }
  validEmail(data, reversed) {
    return { success: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email),
      reason: 'Invalid email format'
    };
  }
  validPassword(data, reversed) {
    let uc = global.config.user;
    let {password} = data;
    return this.composite(
      {name:'Password', str:password, min:uc.passwordMin, max:uc.passwordMax},
      ['isOfLength']
    );
  }

  // Post related validation
  postExists(data, reversed) {
    return {success: data.posts.length == 1,
      reason: reversed? 'Post already exists' : 'Post does not exist'
    };
  }
  validPostTitle(data, reversed) {
    let pc = global.config.post;
    let {title} = data;
    return this.composite(
      {name:'Post title', str:title, min:pc.titleMin, max:pc.titleMax},
      ['isOfLength', 'isAlphanumerical']
    );
  }
};
module.exports = new Validator();
