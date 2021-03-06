
class UserManager {
  constructor() {
    this.loggedIn = false;
    this.user = {};
    SOCKET.on('Login', (data)=>{this.onLogin(data)});
    SOCKET.on('Logout', (data)=>{this.onLogout(data)});
    SOCKET.on('Signup', (data)=>{this.onSignup(data)});
    $on($id('BtnCredsLogin'), 'click', ()=>{USER.credsLogin();});
    $on($id('BtnSignup'), 'click', ()=>{USER.signup();});
    $on($id('BtnLogOut'), 'click', ()=>{USER.logout();});
  }
  purge() {
    $empty($id('SectionAccount'));
  }

  get() {
    if (this.loggedIn) return this.user;
  }

  /* SOCKETIO INTERFACE */

  credsLogin() {
    let username = $id('LoginUsername').value;
    let password = $id('LoginPassword').value;
    let sessionID = SOCKET.id;
    SOCKET.emit('CredsLogin', {username, password, sessionID});
    $id('LoginPassword').value = '';
  }
  cookieLogin() {
    let username = Cookie.get('Username');
    let sessionID = Cookie.get('SessionID');
    let newSession = SOCKET.id;
    SOCKET.emit('CookieLogin', {username, sessionID, newSession});
  }
  onLogin(data) {
    if (!data.success) {
      if (!data.cookies) Popup.create(`Could not log in (${data.reason})`);
      POSTS.getLatestPosts();
      return;
    }
    Cookie.set('Username', data.user.username);
    Cookie.set('SessionID', SOCKET.id);
    Popup.create(`Logged in. Welcome ${data.user.username}!`);
    this.user = data.user;
    this.loggedIn = true;
    POSTS.refreshList();
    this.createAccountSection();
    sw.goto('Root', 'Home');
    btnTGL.Login.off();
    btnTGL.Account.on();
    btnTGL.Logout.on();
    if (data.user.admin) {
      btnTGL.Admin.on();
      ADMIN.loadTagsList();
    }
  }

  logout() {
    if (!this.loggedIn) return;
    let username = this.user.username;
    let sessionID = SOCKET.id;
    SOCKET.emit('Logout', {username, sessionID});
  }
  onLogout(data) {
    if (!data.success) {
      Popup.create(`Could not log out. ${data.reason}`);
      return;
    }
    this.user = {};
    this.loggedIn = false;
    sw.goto('Root', 'Home');
    Popup.create(`Logged out`);
    btnTGL.Login.on();
    btnTGL.Account.off();
    btnTGL.Logout.off();
    btnTGL.Admin.off();
    POSTS.purge();
    READER.purge();
    ADMIN.purge();
    EDITOR.purge();
    this.purge();
    POSTS.refreshList();
  }

  signup() {
    let username = $id('SignupUsername').value;
    let email = $id('SignupEmail').value;
    let password = $id('SignupPassword').value;
    let sessionID = SOCKET.id;
    SOCKET.emit('Signup', {username, email, password, sessionID});
    $id('SignupPassword').value = '';
  }
  onSignup(data) {
    if (!data.success) {
      Popup.create(`Could not sign up (${data.reason})`);
      return;
    }
    Popup.create(`Signed up. Please log in to continue.`);
    $id('SignupUsername').value = '';
    $id('SignupEmail').value = '';
  }

  createAccountSection() {
    let compiler = new ShpCompiler();
    let userData = this.get();
    let content = compiler.compile(`
      $h4 {Your account details}
      $div[.TextContent] {
        $div[.Pair] {
          $div[.Key] {Username}
          $div[.Value] {${userData.username}}
        }
        $div[.Pair] {
          $div[.Key] {E-mail}
          $div[.Value] {${userData.email}}
        }
        $div[.Pair] {
          $div[.Key] {Account created}
          $div[.Value] {${dtostr(userData.joined)}}
        }
      }
    `);
    for (let element of content) $id('SectionAccount').appendChild(element);
  }
}
