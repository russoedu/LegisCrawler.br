const debug = require('debug')('clean');

/**
 * @class
 */
class Clean {
  static name(text) {
    debug(text);
    return text
        .trim()
        .replace(/\s\s+/gm, '')
        .replace(/\n+/, ' ');
  }
}
module.exports = Clean;
