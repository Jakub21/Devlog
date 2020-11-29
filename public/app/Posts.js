
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
      $div[.Dates] {${Reader.dtos(timestamp)}}
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
    SOCKET.emit('GetLatestPosts', {sessionID:SOCKET.id, page});
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
    if (prepend) {
      $id('LatestPosts').prepend(this.buildPostEntry(post.ID, 'reader'));
      $id('AdminPosts').prepend(ADMIN.buildPostEntry(post.ID, 'editor'));
      $id('LandingPosts').prepend(this.buildPostEntry(post.ID, 'reader'));
    } else {
      $id('LatestPosts').appendChild(this.buildPostEntry(post.ID, 'reader'));
      $id('AdminPosts').appendChild(ADMIN.buildPostEntry(post.ID, 'editor'));
      if (!FLAGS.landingPosts) {
        $id('LandingPosts').appendChild(this.buildPostEntry(post.ID, 'reader'));
      }
    }
    let landingPosts = $id('LandingPosts').children;
    if (landingPosts.length > CONFIG.homepagePosts) {
      $remove(landingPosts[landingPosts.length-1])
    }
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
    post.loadedContent = true;
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

  onForceRefresh(data) {
    if (data.action == 'publish') {
      this.onReceivedPost(data.post, true);
    } else if (data.action == 'update') {
      let updatedPost = this.get(data.postID);
      if (updatedPost.loadedContent) {
        let target = undefined;
        if (READER.currentID == data.postID) {
          target = 'reader';
          Popup.create('Loaded updated version of this post.');
        }
        this.getPostDetails(target);
      }
    } else if (data.action == 'remove') {
      let containers = [
        $id('LatestPosts'), $id('AdminPosts'), $id('LandingPosts')];
      for (let container of containers) {
        for (let entry of container.children) {
          if (entry.dataset.postid == data.postID) $remove(entry);
        }
      }
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
