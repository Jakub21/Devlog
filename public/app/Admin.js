
class Admin {
  constructor() {
    SOCKET.on('PublishPost', (data)=>{this.onPublishPost(data)});
    this.setContext(null);
    $on($id('BtnAdminNew'), 'click', () => {
      sw.goto('Admin', 'Editor');
      this.setContext('new');
    });
  }
  setContext(type, data={}) {
    this.context = {type, data};
  }

  publishPost(data) {
    // NOTE: Check for editor context to create or edit
    let {title, prompt, tags, content} = data;
    SOCKET.emit('PublishPost', {
      userID: USER.get().ID, sessionID: SOCKET.id,
      title, prompt, tags, content
    });
  }
  onPublishPost(data) {
    if (!data.success) {
      if (!data.cookies) Popup.create(`Could not publish (${data.reason})`);
      return;
    }
    Popup.create(`Published post "${data.title}"`);
  }

  loadTagsList() {
    SOCKET.emit('LoadTagsList', {
      userID: USER.get().ID, sessionID: SOCKET.id,
    });
  }
  onLoadTagsList(data) {
    let shp = '';
    for (let tag of data.tags) {
      shp += `$label[.CustomCheckbox] {
        ${tag} %input[#AddPostTag_${tag} type checkbox] $span}`;
    }
    let elements = new ShpCompiler().compile(shp);
    let parent = $id('AddPostTags');
    for (let element of elements) parent.appendChild(element);
  }
}
