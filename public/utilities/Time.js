
let dtostr = (timestamp) => {
  let dstr = new Date(timestamp).toLocaleString('en-GB');
  let date = dstr.substr(0,10).replace('/', '.').replace('/', '.');
  let time = dstr.substr(11, 6);
  return `${date} ${time}`;
}
