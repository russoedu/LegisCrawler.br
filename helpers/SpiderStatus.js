const log = require('../helpers/log');
const chalk = require('chalk');

const Text = require('../helpers/Text');

class SpiderStatus {
  constructor(url, name) {
    this.url = url;
    this.name = name;
  }

  static cronSet(hour) {
    log(chalk.blue(`⏰  [CRON]                 Cron set to process everyday at ${hour}:00 AM`));
  }

  static start(url, parralell) {
    global.processed = 0
    log(chalk.blue(`🕸  [START]                Spider initiated with ${parralell} connections on ${url}`));
    process.stdout.write(chalk.green('👷  [WORKING]    '));
  }

  static legislationFinish(url) {
    let plural = '';
    global.processed += 1;
    if (global.processed === 1) {
      plural = 's';
    }
    process.stdout.clearLine();

    process.stdout.cursorTo(0);
    process.stdout.write(chalk.green('👷  [WORKING]    '));

    process.stdout.cursorTo(15);
    process.stdout.write(chalk.green(`${Text.spacedNumberWithComma(global.processed)} link${plural} crawled`));

    process.stdout.cursorTo(45);
    process.stdout.write(chalk.yellow(` ${url}`));
  }

  static finishAll(legislationsQuantity) {
    // const quantity = legislationsQuantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    log('');
    log(chalk.blue(`🕸  [FINISH]               Captured ${Text.numberWithComma(legislationsQuantity)} pages`));
  }

  static finishAllWithError() {
    log('');
    log(`😪  ${chalk.red('     [ERROR]               Could not crawl pages')}`);
    log('');
  }
}

module.exports = SpiderStatus;
