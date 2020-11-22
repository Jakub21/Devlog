
class PostsManager {
  constructor() {
    SOCKET.on('GetLatestPosts', (data)=>{this.onGetLatestPosts(data)});
    SOCKET.on('GetUserPosts', (data)=>{this.onGetUserPosts(data)});
    SOCKET.on('GetPostUsernames', (data)=>{this.onGetPostUsernames(data)});
    SOCKET.on('AddComment', (data)=>{this.onAddComment(data)});
    SOCKET.on('LikePost', (data)=>{this.onLikePost(data)});
    SOCKET.on('LikeComment', (data)=>{this.onLikeComment(data)});
  }

  buildPost(data) {
    let {title, prompt, tags, content} = data;
    let tagsShp = '';
    for (let tag of tags) tagsShp += `$div[.Tag] {${tag}}`;

    let shp = `$div[.Post] {
      $h2[.Title] {${title}}
      $div[.Prompt] {${prompt}}
      $div[.Tags] {${tagsShp}}
      $div[.Content] {${content}}
    }`;
    return new ShpCompiler().compile(shp)[0];
  }
  purge() {
    //
  }

  getLatestPosts() {
    //
  }
  onGetLatestPosts(data) {
    //
  }

  getUserPosts() {
    //
  }
  onGetUserPosts(data) {
    //
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
