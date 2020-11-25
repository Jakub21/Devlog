
class Admin {
  constructor() {
    SOCKET.on('PublishPost', (data)=>{this.onPublishPost(data)});
    SOCKET.on('EditPost', (data)=>{this.onEditPost(data)});
    SOCKET.on('RemovePost', (data)=>{this.onRemovePost(data)});
    this.setContext(null);
    $on($id('BtnAdminNew'), 'click', () => {
      EDITOR.empty();
      sw.goto('Admin', 'Editor');
      this.setContext('new');
    });
  }
  setContext(type, data={}) {
    this.context = {type, data};
    $id('BtnEditorPublish').innerText = (this.context.type == 'new') ?
      'Publish' : 'Save';
  }

  buildPostEntry(postID) {
    let post = POSTS.get(postID);
    let {title, timestamp, prompt, tags} = post;
    let tagsShp = '';
    for (let tag of tags) tagsShp += `$div[.Tag] {${tag}}`;

    let shp = `$div[.Post] {
      $h4[.Title] {${title}}
      $div[.Date] {${new Date(timestamp).toISOString().substr(0,10)}}
      $div[.Prompt] {${prompt}}
      $div[.Tags] {${tagsShp} $div[.Clear]}
      $div[.Controls] {
        $button[.AdminButton .Remove] {Remove}
        $button[.AdminButton .Edit] {Edit}
      }
    }`;
    let element = new ShpCompiler().compile(shp)[0];
    $on($cn('Remove', element)[0], 'click', () => {
      SOCKET.emit('RemovePost', {sessionID:SOCKET.id, userID:USER.get().ID,
        postID
      });
    });
    $on($cn('Edit', element)[0], 'click', () => {
      this.setContext('edit', {postID});
      POSTS.getPostDetails(postID, 'editor');
    });
    return element;
  }

  publishPost(data) {
    if (this.context.type == 'new') {
      let {title, prompt, tags, content} = data;
      SOCKET.emit('PublishPost', {
        userID: USER.get().ID, sessionID: SOCKET.id,
        title, prompt, tags, content
      });
    } else if (this.context.type == 'edit') {
      let {title, prompt, tags, content} = data;
      SOCKET.emit('EditPost', {
        userID: USER.get().ID, sessionID: SOCKET.id,
        title, prompt, tags, content
      });
    }
  }
  onPublishPost(data) {
    if (!data.success) {
      Popup.create(`Could not publish (${data.reason})`);
      return;
    }
    Popup.create(`Published post "${data.title}"`);
  }
  onEditPost(data) {
    if (!data.success) {
      Popup.create(`Could not edit (${data.reason})`);
      return;
    }
    Popup.create(`Edited post "${data.title}"`);
  }
  onRemovePost(data) {
    if (!data.success) {
      Popup.create(`Could not remove (${data.reason})`);
      return;
    }
    Popup.create(`Removed post "${data.title}"`);
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
