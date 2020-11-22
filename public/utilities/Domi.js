
let $id = (id, from=undefined) => {
  if (from != undefined)
    return from.querySelector(`#${id}`);
  return document.getElementById(id);
}
let $cn = (cn, from=undefined) => {
  if (from != undefined)
    return from.querySelectorAll(`.${cn}`);
  return document.getElementsByClassName(cn);
}
let $tag = (tag, from=undefined) => {
  if (from != undefined)
    return from.querySelectorAll(tag);
  return document.getElementsByTagName(tag);
}
let $qr = (query, from=undefined) => {
  if (from == undefined)
    from = document;
  return from.querySelector(query);
}

let $remove = (elm) => {
  elm.parentNode.removeChild(elm);
};

let $create = (tag, id=undefined) => {
  let elm = document.createElement(tag);
  if (id != undefined) elm.id = id;
  return elm;
}
let $text = (text, id=undefined) => {
  let elm = document.createTextNode(text);
  if (id != undefined) elm.id = id;
  return elm;
}
let $on = (elm, key, cb) => {
  elm.addEventListener(key, cb);
}
let $empty = (elm) => {
  while (elm.lastChild) { elm.removeChild(elm.lastChild); }
}

class DomToggle {
  constructor(element, state=true, options={}) {
    this.element = element;
    this.state = true;
    this.trueClass = options.trueClass;
    this.falseClass = options.falseClass;
    this.hide = options.hide;
    this.enabled = true;
    if (state) {
      if (options.falseClass != undefined)
        this.element.classList.add(options.falseClass);
    } else {
      if (options.trueClass != undefined)
        this.element.classList.add(options.trueClass);
      this.toggle();
    }
  }
  static placeholder() {
    let element = $create('p');
    element.innerText = 'placeholder';
    element.hidden = true;
    return new DomStateToggle(element, false);
  }
  bind(domi, key) {
    domi.kb.bind(key, (evt) => {this.toggle();});
  }
  enable() {
    this.enabled = true;
  }
  disable() {
    this.enabled = false;
  }
  toggle() {
    if (!this.enabled) return;
    this.state = !this.state;
    if (this.trueClass != undefined)
      this.element.classList.toggle(this.trueClass);
    if (this.falseClass != undefined)
      this.element.classList.toggle(this.falseClass);
    if (this.hide) this.element.hidden = !this.state;
  }
  on() {
    if (!this.enabled) return;
    if (this.state) return;
    this.state = true;
    if (this.trueClass != undefined)
      this.element.classList.add(this.trueClass);
    this.element.classList.remove(this.falseClass);
    if (this.hide) this.element.hidden = false;
  }
  off() {
    if (!this.enabled) return;
    if (!this.state) return;
    this.state = false;
    this.element.classList.remove(this.trueClass);
    if (this.falseClass != undefined)
      this.element.classList.add(this.falseClass);
    if (this.hide) this.element.hidden = true;
  }
}

// NOTE: This might have to be expanded but is enough for now
class Keyboard {
  constructor(element) {
    this.element = element;
  }
  bind(key, callback) {
    $on(this.element, 'keydown', (evt) => {
      if (evt.key == key) callback(evt);
    });
  }
}

class NestedSwitcher {
  constructor(structure) {
    this.switchers = {};
    this.swStack = [];
    this.buildStructure(structure);
  }
  goto(switcherID, sectionID) {
    this.switchers[switcherID].goto(sectionID);
  }
  back(switcherID) {
    this.switchers[switcherID].back();
  }
  buildStructure(structure) {
    this.switchers.Root = new Switcher();
    this.swStack.push(this.switchers.Root);
    for (let [ID, section] of Object.entries(structure.children)) {
      this.buildSection(ID, section);
    }
    if (structure.default != undefined) {
      this.switchers.Root.goto(structure.default);
    }
    this.swStack.pop();
  }
  buildSection(ID, data) {
    let swParent = this.swStack[this.swStack.length-1];
    if (data.toggles == undefined) data.toggles = [];
    if (data.onEnter == undefined) data.onEnter = ()=>{};
    if (data.onLeave == undefined) data.onLeave = ()=>{};
    let section = new Section(ID, data.section, data.toggles,
      data.onEnter, data.onLeave);
    swParent.addSection(section);
    if (data.button != undefined) {
      $on(data.button, 'click', ()=>{swParent.goto(ID);});
    }
    if (data.children != undefined) {
      this.switchers[ID] = new Switcher();
      this.swStack.push(this.switchers[ID]);
      for (let [ID, child] of Object.entries(data.children))
        this.buildSection(ID, child);
      if (data.default != undefined) {
        this.switchers[ID].goto(data.default);
      }
      this.swStack.pop();
    }
  }
}

class Switcher {
  constructor() {
    this.current = '';
    this.previous = '';
    this.sections = {};
    this.toggles = {};
  }
  addToggle(name, toggle) {
    this.toggles[name] = toggle;
    toggle.off();
  }
  addSection(section) {
    section.switcher = this;
    section.hide(true);
    this.sections[section.id] = section;
  }
  goto(id) {
    if (this.sections[id] == undefined) {
      console.error(`Can not switch to section "${id}", it does not exist`);
      return;
    }
    if (this.current != '') this.sections[this.current].hide();
    this.sections[id].show();
    this.previous = this.current;
    this.current = id;
  }
  back() {
    if (this.previous == '') return;
    this.goto(this.previous);
  }
}

class Section {
  constructor(id, element, toggles=[], onEnter=undefined, onLeave=undefined) {
    this.id = id;
    this.section = element;
    this.toggles = toggles;
    this.onEnter = onEnter;
    this.onLeave = onLeave;
  }
  show() {
    this.section.hidden = false;
    if (this.onEnter != undefined) this.onEnter();
    for (var toggle of this.toggles) {
      toggle.on();
    }
  }
  hide(auto=false) {
    this.section.hidden = true;
    for (var toggle of this.toggles) {
      toggle.off();
    }
    if (this.onLeave != undefined && !auto) this.onLeave();
  }
}

class AnimatedSwitcher extends Switcher {
  setAnimationData(data) {
    this.anim = data;
    // {leavingCn:className, enteringCn:className, lDelay:ms, eDelay:ms}
  }
  goto(id) {
    let current = this.sections[this.current];
    let next = this.sections[id];
    if (current != undefined) {
      current.section.classList.add(this.anim.leavingCn);
    }
    next.section.classList.add(this.anim.enteringCn);
    setTimeout((id) => {
      let current = this.sections[this.current];
      let next = this.sections[id];
      if (current != undefined) this.sections[this.current].hide();
      next.show();
    }, this.anim.lDelay, id);
    setTimeout((id) => {
      let current = this.sections[this.current];
      let next = this.sections[id];
      next.section.classList.remove(this.anim.enteringCn);
      if (current != undefined)
        current.section.classList.remove(this.anim.leavingCn);
      this.previous = this.current;
      this.current = id;
    }, this.anim.lDelay+this.anim.eDelay, id);
  }
}
