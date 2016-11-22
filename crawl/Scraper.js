const htmlparser = require('htmlparser2');
const request = require('request-promise-native');
const error = require('../helpers/error');
const chalk = require('chalk');
const debug = require('debug')('scraper');

class Scraper {
  static scrapPage(legislation) {
    // Used to capture bolds that are not part of articles
    const ignoreTagRegEx = /b|strong|strike/;
    // Used do revert ignore on bold used on some unique paragraphs
    const uniqueParagraphRegEx = /\s?Parágrafo\súnico[\s-]*/;

    let useContent = false;
    let scrapedContent = '';

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
                scrapedContent += dirtyText;
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
          }, {
            decodeEntities: true,
          });
          parser.write(html);
          parser.end();

          debug(chalk.green('scrapedContent', scrapedContent));
          resolve(scrapedContent);
        })
        .catch((err) => {
          error(legislation.name, 'Could not scrap page', err);
          reject(error);
        });
    });
  }
}

module.exports = Scraper;
