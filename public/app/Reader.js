
class Reader {
  constructor() {
    this.currentID = undefined;
  }
  purge() {
    $empty($id('SectionReaderContent'));
  }
  openPost(postID, noNav) {
    this.currentID = postID;
    let post = POSTS.get(postID);
    let reader = $id('SectionReaderContent');
    $empty(reader);
    let postNode = this.buildPost(post);
    reader.appendChild(postNode);
    if (noNav) return;
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
      $span[.LastUpdate title 'Last update'] {last ${dtostr(lastUpdate)}}
    }` : '';

    let shp = `$div[.Post] {
      $h2[.Title] {${title}}
      $div[.Dates] {
        $div[.Date title 'Published'] {${dtostr(timestamp)}}
        ${updatesShp}
      }
      $div[.Prompt] {${prompt}}
      $div[.Tags] {${tagsShp} $div[.Clear]}
      $div[.Content] {${content}}
    }`;
    let element = new ShpCompiler().compile(shp)[0];
    for (let img of $tag('img', element)) {
      let location = window.location.href;
      if (img.src.startsWith(location+'@')) {
        let name = img.src.substring(location.length+1);
        img.src = `https://res.cloudinary.com/disk-devlog/image/upload/${name}`;
      }
    }
    return element;
  }
  buildContent(content) {
    return content.content;
  }
}
