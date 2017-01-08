const log = require('../helpers/log');
const chalk = require('chalk');


class SpiderStatus {
  constructor(url, name) {
    this.url = url;
    this.name = name;
  }

  static start(url) {
    log(chalk.blue(`🕸  [START] Spider initiated on "${url}"`));
    process.stdout.write(chalk.green('   [PROCESSING] '));
  }

  static legislationFinish() {
    process.stdout.write(chalk.green('.'));
  }

  static finishAll(legislationsQuantity) {
    log('');
    log(chalk.blue(`🕸  [FINISH] Spider finished with ${legislationsQuantity} legislations`));
  }

  static finishAllWithError() {
    log('');
    log(`😪  ${chalk.red('[ERROR] Could not crawl pages')}`);
    log('');
  }
}

module.exports = SpiderStatus;
