const log = require('../helpers/log');
const chalk = require('chalk');

module.exports = function finish(quantity, finished) {
  if (quantity === finished) {
    log('');
    log('✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨');
    log('✨                                                     ✨');
    log(chalk.bold.cyan('✨   [FINISH] All legislations captured and organized  ✨'));
    log('✨                                                     ✨');
    log('✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨');
    log('');
  }
};
