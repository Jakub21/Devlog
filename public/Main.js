let SOCKET, USER, POSTS, EDITOR;
let sw, btnTGL, menuTGL; // Domi.js switches & toggles

let onDomLoaded = () => {
  SOCKET = io.connect(window.location.href);
  SOCKET.on('Initialize', (data) => {
    for (let elm of $cn('Version')) {
      elm.innerText = `v${data.version} ${data.release}`;
    }
    initDOM();
    init();
  });
}

let initDOM = () => {
  let _mkHideTgl = (id, state=true) => {
    return new DomToggle($id(id), state, {hide:true})
  };
  // header button hide-toggles
  btnTGL = {
    Login: _mkHideTgl('BtnLogin'),
    Account: _mkHideTgl('BtnAccount', false),
    Admin: _mkHideTgl('BtnAdmin', false),
    Logout: _mkHideTgl('BtnLogOut', false),
    EditorPublish: _mkHideTgl('BtnEditorPublish', false),
    EditorBack: _mkHideTgl('BtnEditorBack', false),
  };
  // sub-section menu hide-toggles
  menuTGL = {
    Posts: _mkHideTgl('SectionPostsHeader'),
    Admin: _mkHideTgl('SectionAdminHeader'),
  };
  // remove space from banner
  for (let node of $id('Banner').querySelector('h1').childNodes) {
    if (node.nodeName == '#text') $remove(node);
  }
  // Domi switcher
  sw = new NestedSwitcher(getStructure());
}

let init = () => {
  POSTS = new PostsManager();
  POSTS.getLatestPosts();
  ADMIN = new Admin($id('SectionEditor'));
  EDITOR = new Editor();
  USER = new UserManager();
  USER.cookieLogin();
  console.log('Initialized');
}
