const fs = require('fs');

class FileStream {
  constructor(filename) {
    this.reinit(filename);
  }
  reinit(filename) {
    this.filename = filename;
    this.stream = fs.createWriteStream(this.filename, {flags:'a'});
  }
  append(content) {
    this.stream.write(content);
  }
  close() {
    this.stream.end();
  }
}

class Logger extends FileStream {
  constructor(config) {
    let {tzOffset, logsDirectory, logsFileTemplate} = config;
    tzOffset *= 60000; // min -> ms
    let date = new Date(Date.now()+tzOffset).toISOString().substring(0, 10);
    super(`${logsDirectory}/${logsFileTemplate.replace("$DATE", date)}`);
    this.date = date;
    this.logsDirectory = logsDirectory;
    this.logsFileTemplate = logsFileTemplate;
    this.tzOffset = tzOffset;
  }
  entry(issuer, message) {
    if (issuer == undefined || message == undefined)
      throw new Error('Can not create an entry with undefined issuer or message');
    let now = new Date(Date.now()+this.tzOffset).toISOString();
    let date = now.substring(0, 10);
    if (date != this.date) {
      this.close();
      this.reinit(`${this.logsDirectory}/${this.logsFileTemplate.replace("$DATE", date)}`);
    }
    let time = now.substring(11, 19);
    let text = `@${time} [${issuer}] ${message}`;
    console.log(text);
    this.append(text+'\n');
  }
  newSession(config) {
    this.append('\n\n');
    let version = `${global.config.version} ${global.config.release}`;
    this.entry('Main', `Server started (v${version})`);
  }
}
module.exports = Logger;
