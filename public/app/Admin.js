
class Admin {
  constructor() {
    SOCKET.on('PublishPost', (data)=>{this.onPublishPost(data)});
    SOCKET.on('UpdatePost', (data)=>{this.onUpdatePost(data)});
    SOCKET.on('RemovePost', (data)=>{this.onRemovePost(data)});
    this.setContext(null);
    $on($id('BtnAdminNew'), 'click', () => {
      EDITOR.empty();
      sw.goto('Admin', 'Editor');
      this.setContext('new');
    });
  }
  purge() {
    $empty($id('SectionEditorPreview'));
    $empty($id('AdminPosts'));
  }
  setContext(type, data={}) {
    this.context = {type, data};
    $id('BtnEditorPublish').innerText = (this.context.type == 'new') ?
      'Publish' : 'Update';
  }

  buildPostEntry(postID) {
    let post = POSTS.get(postID);
    let {title, timestamp, prompt, tags} = post;

    let tagsShp = '';
    for (let tag of tags) tagsShp += `$div[.Tag] {${tag}}`;

    let statusShp = post.draft ?
      `$div[.Published .Draft title 'This post is a draft'] { Draft }` :
      `$div[.Published .Public title 'This post is public'] { Public }`;

    let shp = `$div[.Post data-postid ${postID}] {
      $h4[.Title] {${title}}
      $div[.Dates] {${dtostr(timestamp)}}
      $div[.Prompt] {${prompt}}
      $div[.Tags] {${tagsShp} $div[.Clear]}
      $div[.Controls] {
        $button[.AdminButton .Remove] {Remove}
        $button[.AdminButton .Edit] {Edit}
        ${statusShp}
      }
    }`;
    let element = new ShpCompiler().compile(shp)[0];
    $on($cn('Remove', element)[0], 'click', () => {
      if (confirm('Please confirm you want to delete this post')) {
        this.removePost(postID);
    }});
    $on($cn('Edit', element)[0], 'click', () => {
      this.setContext('update', {postID});
      POSTS.getPostDetails(postID, 'editor');
    });
    return element;
  }

  publishPost(data) {
    if (this.context.type == 'new') {
      let {title, prompt, draft, tags, content} = data;
      SOCKET.emit('PublishPost', {
        userID: USER.get().ID, sessionID: SOCKET.id,
        title, prompt, draft, tags, content
      });
    } else if (this.context.type == 'update') {
      let {title, prompt, draft, tags, content} = data;
      SOCKET.emit('UpdatePost', {
        userID: USER.get().ID, sessionID: SOCKET.id,
        postID:this.context.data.postID,
        title, prompt, draft, tags, content
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
  onUpdatePost(data) {
    if (!data.success) {
      Popup.create(`Could not update (${data.reason})`);
      sw.goto('Admin', 'List');
      return;
    }
    Popup.create(`Updated post "${data.title}"`);
  }

  removePost(postID) {
    SOCKET.emit('RemovePost', {sessionID:SOCKET.id, userID:USER.get().ID,
      postID
    });
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
