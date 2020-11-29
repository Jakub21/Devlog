
class PostsManager {
  constructor() {
    SOCKET.on('GetLatestPosts', (data)=>{this.onGetLatestPosts(data)});
    SOCKET.on('GetUserPosts', (data)=>{this.onGetUserPosts(data)});
    SOCKET.on('GetPostDetails', (data)=>{this.onGetPostDetails(data)});
    SOCKET.on('AddComment', (data)=>{this.onAddComment(data)});
    SOCKET.on('LikePost', (data)=>{this.onLikePost(data)});
    SOCKET.on('LikeComment', (data)=>{this.onLikeComment(data)});
    SOCKET.on('ForceRefresh', (data)=>{this.onForceRefresh(data)});
    $on($id('BtnReaderBack'), 'click', () => {
      sw.back('Posts');
      sw.back('Root');
    });
    this.posts = {};
  }
  get(postID) {
    return this.posts[postID];
  }

  buildPostEntry(postID, target) {
    let {title, timestamp, prompt, tags} = this.get(postID);
    let tagsShp = '';
    for (let tag of tags) tagsShp += `$div[.Tag] {${tag}}`;

    let shp = `$div[.Post data-postid ${postID}] {
      $h4[.Title] {${title}}
      $div[.Dates] {${dtostr(timestamp)}}
      $div[.Prompt] {${prompt}}
      $div[.Tags] {${tagsShp} $div[.Clear]}
    }`;
    let element = new ShpCompiler().compile(shp)[0];
    $on(element, 'click', ()=>{this.getPostDetails(postID, target)});
    return element;
  }
  purge() {
    $empty($id('LatestPosts'));
    $empty($id('LandingPosts'));
  }

  getLatestPosts(page=1) {
    let userID;
    if (USER.get() == undefined) userID = null;
    else userID = USER.get().ID;
    SOCKET.emit('GetLatestPosts', {sessionID:SOCKET.id, userID, page});
  }
  onGetLatestPosts(data) {
    for (let post of data.posts) {
      this.onReceivedPost(post);
    }
    FLAGS.landingPosts = true;
  }
  onReceivedPost(post, prepend=false) {
    post.loadedContent = false;
    this.posts[post.ID] = post;
    if (prepend) { this._prependEntries(post); }
    else { this._appendEntries(post); }
    let landingPosts = $id('LandingPosts').children;
    if (landingPosts.length > CONFIG.homepagePosts) {
      $remove(landingPosts[landingPosts.length-1])
    }
  }
  _prependEntries(post) {
    if (!post.draft) {
      $id('LatestPosts').prepend(this.buildPostEntry(post.ID, 'reader'));
      $id('LandingPosts').prepend(this.buildPostEntry(post.ID, 'reader'));
    }
    $id('AdminPosts').prepend(ADMIN.buildPostEntry(post.ID, 'editor'));
  }
  _appendEntries(post) {
    $id('AdminPosts').appendChild(ADMIN.buildPostEntry(post.ID, 'editor'));
    if (!post.draft) {
      $id('LatestPosts').appendChild(this.buildPostEntry(post.ID, 'reader'));
      if (!FLAGS.landingPosts) {
        $id('LandingPosts').appendChild(this.buildPostEntry(post.ID, 'reader'));
      }
    }
  }

  getPostDetails(postID, target, noNav) {
    let userID;
    if (USER.get() == undefined) userID = null;
    else userID = USER.get().ID;
    SOCKET.emit('GetPostDetails', {sessionID:SOCKET.id, userID,
      postID, target, noNav});
  }
  onGetPostDetails(data) {
    if (!data.success) {
      Popup.create(`Could not get post details (${data.reason})`);
      return;
    }
    let post = this.posts[data.postID];
    post.loadedContent = true;
    post.author = data.author;
    post.commenters = data.commenters;
    post.content = data.content;
    this.posts[data.postID] = post;
    if (data.target == 'reader') {
      READER.openPost(data.postID, data.noNav);
    } else if (data.target == 'editor') {
      EDITOR.openPost(data.postID, data.noNav);
    }
  }

  refreshList() {
    $empty($id('LandingPosts'));
    $empty($id('LatestPosts'));
    $empty($id('AdminPosts'));
    FLAGS.landingPosts = false;
    this.getLatestPosts();
  }
  refreshReaderPost(data) {
    let updatedPost = this.get(data.postID);
    if (updatedPost.loadedContent) {
      let target = undefined;
      if (READER.currentID == data.postID && sw.getPath() == 'Posts.Reader') {
        target = 'reader';
        Popup.create('Loaded updated version of this post.');
      }
      this.getPostDetails(data.postID, target, true);
    }
  }
  onForceRefresh(data) {
    if (data.action == 'update') this.refreshReaderPost(data);
    this.refreshList();
  }

  addComment() {
    //
  }
  onAddComment(data) {
    //
  }

  likePost() {
    //
  }
  onLikePost(data) {
    //
  }

  likeComment() {
    //
  }
  onLikeComment(data) {
    //
  }

}
