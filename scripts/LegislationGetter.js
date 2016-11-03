const request = require('request-promise-native');
const htmlparser = require('htmlparser2');
const colors = require('colors');
const LegislationCleaner = require('../helpers/LegislationCleaner');
const LegislationParser = require('../helpers/LegislationParser');
const logger = require('../helpers/logger');


class LegislationGetter {
  static getLegislationText(legislation) {
    // Regular Expressions
    // Used to capture bolds that are not part of articles
    const ignoreTagRegEx = /b|strong/;
    // Used to capture the begining of articles
    const articleRegEx = /Art\. /;
    // Used to check the end of a legislation, when the place and date is displayed
    const finishedRegEx = /[A-Z]+.+, [0-9]+ de [a-z]+ de [0-9]+/;

    const legislationData = [];
    let isContent = false;
    let ignoreContent = false;
    let article = '';

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
              ignoreContent = true;
            }
          },
          ontext(dirtyText) {
            if (!ignoreContent) {
              const cleaner = new LegislationCleaner(dirtyText);
              const text = cleaner.cleanText();

              // Check if text is not empty and if the string begins with 'Art.'
              if (text !== '' && (articleRegEx.test(text) || finishedRegEx.test(text))) {
                // If 'isContent' was already set, it's a new article and we should store (push to
                // legislationData array) this one that is finished and start a new empty article
                if (isContent) {
                  // const legislationParser = new LegislationParser(article);
                  // legislationParser.getTextContent();
                  legislationData.push(article);
                  logger.debug(`article: ${colors.green(`${article}`)}`);
                  article = text;
                } else {
                  // If 'isContent' is not set, it's the first article of the page
                  article += text;
                }
                // From now on, isContent is set as true
                isContent = true;
              } else if (isContent) {
                // Text don't begin with 'Art.' and 'isContent' is set, so, it's a content that
                // belongs to an article that already has part of it's content in 'article' string
                article += text;
              }
            }
          },
          onclosetag(tag) {
            if (ignoreTagRegEx.test(tag)) {
              ignoreContent = false;
            }
          },
        }, { decodeEntities: true });
        parser.write(html);
        parser.end();

        // logger.debug(legislationData);
        resolve({
          type: legislation.type,
          url: legislation.url,
          data: legislationData,
        }
        );
      })
      .catch((error) => {
        logger.info(error);
        reject(error);
      });
    });
  }
}

module.exports = LegislationGetter;
