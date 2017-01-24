const log = require('../helpers/log');
const chalk = require('chalk');

const Text = require('../helpers/Text');
const Elapsy = require('elapsy');

const elapsy = new Elapsy();

class SpiderStatus {
  constructor(url, name) {
    this.url = url;
    this.name = name;
  }

  static cronSet(hour, minute) {
    log(chalk.blue('⏰  [CRON]                 Cron set to process everyday at ' +
      `${hour}:${minute} AM`));
  }

  static requestError(url, err, attempt) {
    if (global.useStdout) {
      process.stdout.write(chalk.red(`\n⛔️  [ERROR]  attempt ${attempt} ${err} for ${url}`));
      elapsy.log();
    } else {
      log(chalk.red(`\n⛔️  [ERROR]  attempt ${attempt} ${err} for ${url} - `) + elapsy.formated());
    }
  }

  static requestRetry(url, attempt) {
    if (global.useStdout) {
      process.stdout.write(chalk.blue(`\n♻️  [RETRY]  attempt ${attempt} for ${url}`));
      elapsy.log();
    } else {
      log(chalk.blue(`\n♻️  [RETRY]  attempt ${attempt} for ${url} `) + elapsy.formated());
    }
  }

  static requestRetrySuccess(url, attempt) {
    if (global.useStdout) {
      process.stdout.write(chalk.green(`\n👍  [SUCCESS]  attempt ${attempt} for ${url}`));
      elapsy.log();
    } else {
      log(chalk.green(`\n👍  [SUCCESS]  attempt ${attempt} for ${url} `) + elapsy.formated());
    }
  }

  static start(url) {
    global.processed = 0;
    log(chalk.blue(`🕸  [START]                Spider initiated with ${global.parallel} ` +
                   `parallel connections on ${url}`));
    if (global.useStdout) {
      process.stdout.write(chalk.green('👷  [WORKING]    '));
    }
  }

  static legislationFinish(url) {
    const workers = ['👷', '👷🏼', '👷🏽', '👷🏾', '👷🏿'];
    const rand = workers[Math.floor(Math.random() * workers.length)];

    let plural = '';
    global.processed += 1;
    if (global.processed !== 1) {
      plural = 's';
    }
    if (global.useStdout) {
      process.stdout.clearLine();

      process.stdout.cursorTo(0);
      process.stdout.write(chalk.green(`${rand}  [WORKING]    `));

      process.stdout.cursorTo(15);
      process.stdout.write(chalk.green(`${Text.spacedNumberWithComma(global.processed)} ` +
      `link${plural} crawled`));

      process.stdout.cursorTo(45);
      process.stdout.write(chalk.yellow(` ${url}`));

      elapsy.log();
    } else {
      log(chalk.green(`${rand}  [WORKING]    ${Text.spacedNumberWithComma(global.processed)} ` +
      `link${plural} crawled `) + chalk.yellow(` ${url} `) + elapsy.formated());
    }
  }

  static finishAll(legislationsQuantity) {
    log('');
    log(chalk.blue('🕸  [FINISH]               Captured ' +
                   `${Text.numberWithComma(legislationsQuantity)} pages`));
  }

  static finishAllWithError() {
    log('');
    log(`😪  ${chalk.red('     [ERROR]               Could not crawl pages')}`);
    log('');
  }
}

module.exports = SpiderStatus;
