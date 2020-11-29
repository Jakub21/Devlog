
class Editor {
  constructor() {
    $on($id('BtnEditorBack'), 'click', () => {
      if (confirm('Please confirm you want to exit the editor')) {
        this.empty();
        sw.back('Admin');
    }});
    $on($id('BtnEditorPublish'), 'click', () => {
      if (confirm('Please confirm you want to publish this post')) {
        this.publish();
        sw.back('Admin');
    }});
    $on($id('BtnEditorCreateTag'), 'click', ()=>{this.createTag();});
  }
  purge() {
    this.empty();
    $empty($id('EditorTagList'));
    $empty($id('SectionEditorPreview'));
  }
  getEditorState() {
    return {
      title: $id('EditorTitle').value,
      prompt: $id('EditorPrompt').value,
      draft: $id('EditorDraft').checked,
      content: $id('EditorContent').value,
      tags: this.getTags(),
      // Placeholders
      timestamp: Date.now(),
      lastUpdate: Date.now(),
      updatesCount: 0,
      views: 0,
      author: USER.get().ID,
      likes: [],
      comments: [],
    };
  }
  openPost(postID, noNav) {
    let post = POSTS.get(postID);
    $id('EditorTitle').value = post.title;
    $id('EditorPrompt').value = post.prompt;
    $id('EditorDraft').checked = post.draft;
    $id('EditorContent').value = post.content.content;
    this.setTags(post.tags);
    if (noNav) return;
    sw.goto('Root', 'Admin');
    sw.goto('Admin', 'Editor');
  }
  empty() {
    $id('EditorTitle').value = '';
    $id('EditorPrompt').value = '';
    $id('EditorDraft').checked = false;
    $id('EditorContent').value = '';
    this.setTags([]);
  }
  publish() {
    ADMIN.publishPost(this.getEditorState());
  }
  updatePreview() {
    let state = this.getEditorState();
    let preview = $id('SectionEditorPreview');
    $empty(preview);
    let postNode = READER.buildPost(state);
    preview.appendChild(postNode);
  }

  createTag(overwrite=undefined) {
    let container = $id('EditorTagList');
    let tagName = $cn('TagName', $id('EditorTagCreate'))[0].value;
    if (overwrite != undefined) tagName = overwrite;
    let shp = `$label[.CustomCheckbox] {${tagName} %input[type checkbox] $span}`;
    let element = new ShpCompiler().compile(shp)[0];
    container.appendChild(element);
    return element;
  }
  getTags() {
    let tagLabels = $tag('label', $id('EditorTagList'));
    let tags = [];
    for (let label of tagLabels) {
      if ($tag('input', label)[0].checked)
        tags.push(label.innerText);
    }
    return tags;
  }
  setTags(tags) {
    let tagLabels = $tag('label', $id('EditorTagList'));
    let elements = {};
    for (let label of tagLabels) {
      let element = $tag('input', label)[0];
      element.checked = false;
      elements[label.innerText.trim()] = element;
    }
    for (let tag of tags) {
      if (Object.keys(elements).includes(tag)) elements[tag].checked = true;
      else this.createTag(tag).checked = true;
    }
  }
}
