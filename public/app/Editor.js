
class Editor {
  constructor() {
    $on($id('BtnEditorBack'), 'click', ()=>{sw.back('Admin');});
    $on($id('BtnEditorPublish'), 'click', ()=>{this.publish();});
    $on($id('BtnEditorCreateTag'), 'click', ()=>{this.createTag();});
  }
  getEditorState() {
    let result = {
      title: $id('EditorTitle').value,
      prompt: $id('EditorPrompt').value,
      content: $id('EditorContent').value.replace('\n\n', ' $br '),
      tags: [],
    };
    let tagLabels = $tag('label', $id('EditorTagList')[0]);
    for (let label of tagLabels) {
      if ($tag('input', label)[0].checked)
        result.tags.push(label.innerText);
    }
    return result;
  }
  publish() {
    ADMIN.publishPost(this.getEditorState());
  }
  updatePreview() {
    let state = this.getEditorState();
    let preview = $id('SectionEditorPreview');
    $empty(preview);

    let postNode = POSTS.buildPost(state);
    preview.appendChild(postNode);
  }
  createTag() {
    //
  }
}
