const enumify = require('enumify');
const Parse = require('../crawl/Parse');
// const error = require('../helpers/error');
// const debug = require('debug')('layout');

class Layout extends enumify.Enum {
  /**
   * Check the layout of an HTML
   * @method check
   * @static
   * @param {String} html The HTML that will be parsed to discover the layout
   * @return {Object} The Layout object of the HTML
   * @example
   * {
   *  name: 'GENERAL_LIST',
   *  ordinal: 0
   * }
   * OR
   * {
   *  name: 'COLUMNS_LIST',
   *  ordinal: 1
   * }
   * OR
   * {
   *  name: 'DATES_LIST',
   *  ordinal: 2
   * }
   */
  static check(html) {
    const layout = Parse.layout(html);
    return Layout.enumValueOf(layout);
  }
}

Layout.initEnum(['GENERAL_LIST', 'COLUMNS_LIST', 'DATES_LIST']);

module.exports = Layout;
