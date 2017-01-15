const log = require('../helpers/log');
const chalk = require('chalk');

const Text = require('../helpers/Text');

class ScrapStatus {
  constructor(legislationName, legislationUrl) {
    this.legislationName = legislationName;
    this.legislationUrl = legislationUrl;
  }

  static start(quantity, parralell) {
    global.processed = 0;
    global.toProcess = quantity;
    log(chalk.blue(`🔍  [START]                Scrap ${Text.numberWithComma(quantity)}` +
                   `legislations with ${parralell} parallel connections`));
    process.stdout.write(chalk.green('📏  [PARALLELL]            '));
  }

  static legislationStart(url) {
    global.processed += 1;

    process.stdout.clearLine();

    process.stdout.cursorTo(0);
    process.stdout.write(chalk.green('👷  [WORKING]    '));

    process.stdout.cursorTo(15);
    process.stdout.write(chalk.green(`${Text.spacedNumberWithComma(global.processed)}/` +
                        `${Text.numberWithComma(global.toProcess)} links to scrap`));

    process.stdout.cursorTo(49);
    process.stdout.write(chalk.yellow(` ${url}`));
  }

  static finishAllWithError() {
    log('');
    log(`😪  ${chalk.red('[ERROR] Could not create the legislations')}`);
    log('');
  }
}

module.exports = ScrapStatus;
