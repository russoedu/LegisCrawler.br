const log = require('../helpers/log');
const chalk = require('chalk');

function processedWithCommas() {
  let spaces = '          ';
  let sliceVal = -10;

  if (global.processed > 1000) {
    spaces = '         ';
    sliceVal = -9;
  } else if (global.processed > 10000000) {
    spaces = '        ';
    sliceVal = -8;
  }
  // [PROCESSING]      358 legislations scraped
  const processed = String(spaces + global.processed).slice(sliceVal);
  return processed.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

class SpiderStatus {
  constructor(url, name) {
    this.url = url;
    this.name = name;
  }

  static start(url) {
    log(chalk.blue(`🕸  [START]                Spider initiated on "${url}"`));
    process.stdout.write(chalk.green('   [PROCESSING] '));
  }

  static legislationFinish(url) {
    let plural = '';
    if (typeof global.processed === 'undefined') {
      global.processed = 1;
    } else {
      global.processed += 1;
      plural = 's';
    }
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(chalk.green('   [PROCESSING] '));
    process.stdout.cursorTo(15);
    process.stdout.write(chalk.green(`${processedWithCommas()} link${plural} crawled\r`));
    process.stdout.cursorTo(46);
    process.stdout.write(chalk.yellow(` ${url}`));
  }

  static finishAll(legislationsQuantity) {
    const quantity = legislationsQuantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    log('');
    log(chalk.blue(`🕸  [FINISH]              Scraped ${quantity} legislations`));
  }

  static finishAllWithError() {
    log('');
    log(`😪  ${chalk.red('[ERROR]            Could not crawl pages')}`);
    log('');
  }
}

module.exports = SpiderStatus;
