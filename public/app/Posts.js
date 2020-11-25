
class PostsManager {
  constructor() {
    SOCKET.on('GetLatestPosts', (data)=>{this.onGetLatestPosts(data)});
    SOCKET.on('GetUserPosts', (data)=>{this.onGetUserPosts(data)});
    SOCKET.on('GetPostDetails', (data)=>{this.onGetPostDetails(data)});
    SOCKET.on('AddComment', (data)=>{this.onAddComment(data)});
    SOCKET.on('LikePost', (data)=>{this.onLikePost(data)});
    SOCKET.on('LikeComment', (data)=>{this.onLikeComment(data)});
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

    let shp = `$div[.Post] {
      $h4[.Title] {${title}}
      $div[.Date] {${new Date(timestamp).toISOString().substr(0,10)}}
      $div[.Prompt] {${prompt}}
      $div[.Tags] {${tagsShp} $div[.Clear]}
    }`;
    let element = new ShpCompiler().compile(shp)[0];
    $on(element, 'click', ()=>{this.getPostDetails(postID, target)});
    return element;
  }
  purge() {
    //
  }

  getLatestPosts(page=1) {
    SOCKET.emit('GetLatestPosts', {sessionID:SOCKET.id, page});
  }
  onGetLatestPosts(data) {
    Popup.create(`Loaded ${data.posts.length} posts`);
    let index = 0;
    for (let post of data.posts) {
      this.posts[post.ID] = post;
      $id('LatestPosts').appendChild(this.buildPostEntry(post.ID, 'reader'));
      if (index < CONFIG.homepagePosts) {
        $id('LandingPosts').appendChild(this.buildPostEntry(post.ID, 'reader'));
      }
      if (!FLAGS.landingPosts && data.page == 1) {
        $id('AdminPosts').appendChild(ADMIN.buildPostEntry(post.ID, 'editor'));
      }
      index += 1;
    }
    FLAGS.landingPosts = true;
  }

  getPostDetails(postID, target) {
    SOCKET.emit('GetPostDetails', {sessionID:SOCKET.id, postID, target});
  }
  onGetPostDetails(data) {
    if (!data.success) {
      Popup.create('This post no longer exists.');
      return;
    }
    let post = this.posts[data.postID];
    post.author = data.author;
    post.commenters = data.commenters;
    post.content = data.content;
    this.posts[data.postID] = post;
    if (data.target == 'reader') {
      READER.openPost(data.postID);
    } else if (data.target == 'editor') {
      EDITOR.openPost(data.postID);
    }
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
