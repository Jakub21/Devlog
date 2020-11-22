
let Cookie = {
  set: (name, value, hours=2, sameSite='Strict') => {
    let date = new Date();
    date.setTime(date.getTime() + (hours*60*60*1000));
    document.cookie = `${name}=${value};expires=${date.toUTCString()};SameSite=${sameSite};path=/`;
  },
  get: (name) => {
    let cookies = document.cookie.split('; ');
    let retrieved = {};
    cookies.map((x) => {
      let data = x.split('=');
      retrieved[data[0]] = data[1];
    })
    let result = retrieved[name];
    if (result == '') return undefined;
    return result;
  }
};
