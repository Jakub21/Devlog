POPUP_ID = 0;
POPUP_COUNT = 0;

let Popup = {
  create: (message, duration=3000, parent=undefined) => {
    let id = POPUP_ID;
    POPUP_ID += 1;

    let container = $create('div');
    container.id = `popup_${id}`;
    container.classList.add('popup');

    let text = $create('p');
    text.innerText = message;
    container.appendChild(text);

    let close = $create('div');
    close.classList.add('popupClose');
    close.onclick = () => {Popup.close(id);};
    container.appendChild(close);

    if (parent == undefined) parent = $id('PopupBox');
    parent.appendChild(container);
    setTimeout(Popup.close, duration, id);
  },
  close: (id) => {
    let popup = $id(`popup_${id}`);
    try { popup.parentNode.removeChild(popup); }
    catch (err) { return; }
  }
};
