
class PostsManager {
  constructor() {
    SOCKET.on('GetLatestPosts', (data)=>{this.onGetLatestPosts(data)});
    SOCKET.on('GetUserPosts', (data)=>{this.onGetUserPosts(data)});
    SOCKET.on('GetPostUsernames', (data)=>{this.onGetPostUsernames(data)});
    SOCKET.on('AddComment', (data)=>{this.onAddComment(data)});
    SOCKET.on('LikePost', (data)=>{this.onLikePost(data)});
    SOCKET.on('LikeComment', (data)=>{this.onLikeComment(data)});
    $on($id('BtnReaderBack'), 'click', ()=>{
      sw.back('Posts');
      sw.back('Root');
    });
  }

  buildPostEntry(data) {
    let {title, timestamp, prompt, tags} = data;
    let tagsShp = '';
    for (let tag of tags) tagsShp += `$div[.Tag] {${tag}}`;

    let shp = `$div[.Post] {
      $h4[.Title] {${title}}
      $div[.Date] {${new Date(timestamp).toISOString().substr(0,10)}}
      $div[.Prompt] {${prompt}}
      $div[.Tags] {${tagsShp} $div[.Clear]}
    }`;
    return new ShpCompiler().compile(shp)[0];
  }

  buildPost(data) {
    let {title, timestamp, prompt, tags, content} = data;
    let tagsShp = '';
    for (let tag of tags) tagsShp += `$div[.Tag] {${tag}}`;

    let shp = `$div[.Post] {
      $h2[.Title] {${title}}
      $div[.Date] {${new Date(timestamp).toISOString().substr(0,10)}}
      $div[.Prompt] {${prompt}}
      $div[.Tags] {${tagsShp} $div[.Clear]}
      $div[.Content] {${content}}
    }`;
    return new ShpCompiler().compile(shp)[0];
  }
  updateReader(data) {
    let reader = $id('SectionReaderContent');
    $empty(reader);
    let postNode = this.buildPost(data);
    reader.appendChild(postNode);
  }
  purge() {
    //
  }

  getLatestPosts(page=1) {
    SOCKET.emit('GetLatestPosts', {sessionID:SOCKET.id, page});
  }
  onGetLatestPosts(data) {
    Popup.create(`Loaded ${data.posts.length} posts`);
    for (const post of data.posts) {
      for (const parentID of ['LandingPosts', 'AdminPosts', 'LatestPosts']) {
        let element = this.buildPostEntry(post);
        $id(parentID).appendChild(element);
        $on(element, 'click', () => {
          this.updateReader(post);
          sw.goto('Root', 'Posts');
          sw.goto('Posts', 'Reader');
        });
      }
    }
  }

  getPostUsernames() {
    //
  }
  onGetPostUsernames(data) {
    //
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
