let SOCKET, USER, POSTS, READER, ADMIN, EDITOR;
let sw, btnTGL, menuTGL; // Domi.js switches & toggles
let FLAGS = {
  initialized: false,
  landingPosts: false,
};
let CONFIG = {
  homepagePosts: 3,
};

let onDomLoaded = () => {
  SOCKET = io.connect(window.location.href);
  SOCKET.on('Initialize', (data) => {
    for (let elm of $cn('Version')) {
      elm.innerText = `v${data.version} ${data.release}`;
    }
    if (!FLAGS.initialized) {
      initDOM();
      init();
      FLAGS.initialized = true;
    }
  });
}

let initDOM = () => {
  let _mkHideTgl = (id, state=true, options={}) => {
    if (options.hide == undefined) options.hide = true;
    return new DomToggle($id(id), state, options);
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
    Root: _mkHideTgl('RootHeader', true, {invertHide:true}),
    Posts: _mkHideTgl('SectionPostsHeader'),
    Admin: _mkHideTgl('SectionAdminHeader'),
  };
  // remove space from banner
  for (let node of $id('Banner').querySelector('h1').childNodes) {
    if (node.nodeName == '#text') $remove(node);
  }
  // Domi switcher
  sw = new NestedSwitcher(getStructure());
  setTimeout(()=>{reveal();}, 150);
}

let init = () => {
  POSTS = new PostsManager();
  READER = new Reader();
  ADMIN = new Admin();
  EDITOR = new Editor();
  USER = new UserManager();
  USER.cookieLogin();
  console.log('Initialized');
}

let reveal = () => {
  sw.goto('Root', 'Home');
  $id('Loading').hidden = true;
  $id('Content').hidden = false;
}
