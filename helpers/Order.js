const debug = require('debug')('sort');

class Order {
  static portuguese(a, b) {
    debug(a.name);
    debug(b.name);
    return a.name.localeCompare(b.name);
  }
}

module.exports = Order;
