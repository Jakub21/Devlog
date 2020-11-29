
class Reader {
  constructor() {
    this.currentID = undefined;
  }
  openPost(postID) {
  purge() {
    $empty($id('SectionReaderContent'));
  }
    this.currentID = postID;
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
    let { title, timestamp, prompt, tags,
      updatesCount, lastUpdate, content } = post;
    let tagsShp = '';
    for (let tag of tags) tagsShp += `$div[.Tag] {${tag}}`;

    let updatesShp = updatesCount ? `$div {
      $span[.UpdatesCount title 'Updated times'] {${updatesCount} updates,}
      $span[.LastUpdate title 'Last update'] {last ${Reader.dtos(lastUpdate)}}
    }` : '';

    let shp = `$div[.Post] {
      $h2[.Title] {${title}}
      $div[.Dates] {
        $div[.Date title 'Published'] {${Reader.dtos(timestamp)}}
        ${updatesShp}
      }
      $div[.Prompt] {${prompt}}
      $div[.Tags] {${tagsShp} $div[.Clear]}
      $div[.Content] {${content}}
    }`;
    return new ShpCompiler().compile(shp)[0];
  }
  buildContent(content) {
    return content.content;
  }

  static dtos(timestamp) {
    let dstr = new Date(timestamp).toISOString();
    let date = dstr.substr(0,10).replace('-', '.').replace('-', '.');
    let time = dstr.substr(11, 5);
    return `${date} ${time}`;
  }
}
