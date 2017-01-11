const enumify = require('enumify');

class PageType extends enumify.Enum {
  /**
   * Check the type of a legislation page
   * @method type
   * @static
   * @param {String} checkUrl The url that will be parsed and verified the PageType
   * @return {Object} The type of the url
   * @example
   * {
   *  name: 'LEGISLATION',
   *  ordinal: 0
   * }
   * OR
   * {
   *  name: 'PDF',
   *  ordinal: 1
   * }
   * OR
   * {
   *  name: 'DOC',
   *  ordinal: 2
   * }
   * OR
   * {
   *  name: 'LIST',
   *  ordinal: 3
   * }
   */
  static check(checkUrl) {
    // Check if url is an HTML
    const urlSplit = checkUrl.split('/');
    // debug(urlSplit);
    const urlCheckSplit = urlSplit[urlSplit.length - 1].split('.');
    // debug(urlCheckSplit);
    const urlCheck = urlCheckSplit[urlCheckSplit.length - 1].toLowerCase();
    let type = PageType.LIST;

    // debug(deep, checkUrl, urlCheck);
    // If the URL is an HTML, resolve with PageType LEGISLATION
    if (urlCheck.match(/html?/)) {
      type = this.LEGISLATION;
    } else if (urlCheck === 'pdf') {
      type = this.PDF;
    } else if (urlCheck === 'doc') {
      type = this.DOC;
    }

    // debug(type.name, checkUrl);
    return type;
  }
}

PageType.initEnum(['LEGISLATION', 'PDF', 'DOC', 'LIST']);

module.exports = PageType;
