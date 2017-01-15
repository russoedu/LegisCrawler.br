const debug = require('debug')('sort');

class Order {
  static portuguese(a, b) {
    debug(a.name);
    debug(b.name);
    let response = 0;

    if (a.name === 'Constituição') {
      response = -1;
    } else if (b.name === 'Constituição') {
      response = 1;
    } else {
      response = a.name.localeCompare(b.name);
    }
    return response;
  }
}

module.exports = Order;
