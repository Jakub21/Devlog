
let _mkActiveTgl = (id) => {
  return new DomToggle($id(id), false, {trueClass:'active'});
}

let getStructure = () => { return {
  default: 'Home',
  children: {
    Home: {
      section: $id('SectionLanding'),
      button: $id('BtnHome'),
      toggles: [_mkActiveTgl('BtnHome')],
    },
    Login: {
      section: $id('SectionLogin'),
      button: $id('BtnLogin'),
      toggles: [_mkActiveTgl('BtnLogin')],
    },
    Account: {
      section: $id('SectionAccount'),
      button: $id('BtnAccount'),
      toggles: [_mkActiveTgl('BtnAccount')],
    },
    Posts: {
      section: $id('SectionPosts'),
      button: $id('BtnPosts'),
      toggles: [_mkActiveTgl('BtnPosts')],
      default: 'Latest',
      children: {
        Latest: {
          section: $id('SectionLatest'),
          button: $id('BtnLatest'),
          toggles: [_mkActiveTgl('BtnLatest')],
        },
        Search: {
          section: $id('SectionSearch'),
          button: $id('BtnSearch'),
          toggles: [_mkActiveTgl('BtnSearch')],
        },
        Reader: {
          section: $id('SectionReader'),
          // onlyBack: true, // NOTE
        },
      },
    },
    Admin: {
      section: $id('SectionAdmin'),
      button: $id('BtnAdmin'),
      toggles: [_mkActiveTgl('BtnAdmin')],
      default: 'List',
      children: {
        List: {
          section: $id('SectionList'),
          button: $id('BtnList'),
          toggles: [_mkActiveTgl('BtnList'), menuTGL.Admin],
        },
        Editor: {
          section: $id('SectionEditor'),
          toggles: [btnTGL.EditorPublish, btnTGL.EditorBack],
          default: 'Edit',
          children: {
            Edit: {
              section: $id('SectionEditorEdit'),
              button: $id('BtnEdit'),
              toggles: [_mkActiveTgl('BtnEdit')],
            },
            Preview: {
              section: $id('SectionEditorPreview'),
              button: $id('BtnPreview'),
              toggles: [_mkActiveTgl('BtnPreview')],
              onEnter: ()=>{EDITOR.updatePreview();}
            },
          },
        },
      },
    },
  }
};}
