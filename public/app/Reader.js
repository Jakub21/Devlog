
class Reader {
  constructor() {
    //
  }
  openPost(postID) {
    let post = POSTS.get(postID);
    let reader = $id('SectionReaderContent');
    $empty(reader);
    let postNode = this.buildPost(post);
    reader.appendChild(postNode);
    sw.goto('Root', 'Posts');
    sw.goto('Posts', 'Reader');
  }
  buildPost(post) {
    if (typeof post.content == 'object') {
      post.content = this.buildContent(post.content);
    }
    let {title, timestamp, prompt, tags, content} = post;
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
  buildContent(content) {
    return content.content;
  }
}
