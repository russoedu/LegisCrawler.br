const htmlparser = require('htmlparser2');
const request = require('request-promise-native');
const log = require('../helpers/log');
const chalk = require('chalk');
const debug = require('debug')('scraper');

class Scraper {
  static getLegislationText(legislation) {
    log(chalk.yellow(`🔗   [START] Scrap ${legislation.type}`));
    // Used to capture bolds that are not part of articles
    const ignoreTagRegEx = /b|strong/;
    // Used do revert ignore on bold used on some unique paragraphs
    const uniqueParagraphRegEx = /\s?Parágrafo\súnico[\s-]*/;

    let useContent = false;
    let crapedContent = '';

    return new Promise((resolve, reject) => {
      const requestoptions = {
        url: legislation.url,
        encoding: 'latin1',
      };
      request(requestoptions)
      .then((html) => {
        const parser = new htmlparser.Parser({
          onopentag(tag) {
            if (ignoreTagRegEx.test(tag)) {
              debug(chalk.yellow(`ignored tag: ${tag}`));
              useContent = false;
            }
          },
          ontext(dirtyText) {
            if (useContent || uniqueParagraphRegEx.test(dirtyText)) {
              debug(chalk.blue(`captured ${dirtyText}`));
              crapedContent += dirtyText;
            } else {
              debug(chalk.yellow(`ignored ${dirtyText}`));
            }
          },
          onclosetag(tag) {
            if (ignoreTagRegEx.test(tag)) {
              debug(chalk.yellow(`finished ignored tag: ${tag}`));
              useContent = true;
            }
          },
        }, { decodeEntities: true });
        parser.write(html);
        parser.end();

        debug(chalk.green(`crapedContent ${crapedContent}`));
        log(chalk.green(`✅  [FINISH] Scrap ${legislation.type}`));
        resolve(crapedContent);
      })
      .catch((error) => {
        log.error(chalk.red(error));
        reject(error);
      });
    });
  }
}

module.exports = Scraper;
