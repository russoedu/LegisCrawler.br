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

    const data = {};
    let isContent = false;
    let ignoreContent = false;
    let finished = false;
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
              const text = LegislationCleaner.cleanText(dirtyText);

              // Check if text is not empty and if the string begins with 'Art.'
              if (!finished &&
                  text !== '' &&
                  (articleRegEx.test(text) || finishedRegEx.test(text))) {
                // If 'isContent' was already set, it's a new article and we should store (push to
                // data array) this one that is finished and start a new empty article
                if (finishedRegEx.test(text)) {
                  finished = true;
                }
                if (isContent) {
                  article = LegislationCleaner.cleanText(article);
                  const legislationParser = new LegislationParser(legislation.type, article);
                  const content = legislationParser.getStructuredArticle();

                  // We are using an object so when a article is striked (overwritten by a new
                  // article, the old one is overwritten by the new one and we don't need to take
                  // care of it's semantic. Before it's inserted in the DB it's converted to an
                  // array
                  data[content.number] = content.text;
                  article = text;
                } else {
                  // If 'isContent' is not set, it's the first article of the page
                  article += text;
                }
                // From now on, isContent is set as true
                isContent = true;
              } else if (!finished && isContent) {
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

        const dataArray = [];
        const dataKeys = Object.keys(data);
        dataKeys.forEach((key) => {
          dataArray.push({
            number: key,
            article: data[key],
          });
        });
        resolve({
          type: legislation.type,
          url: legislation.url,
          data: dataArray,
        }
        );
      })
      .catch((error) => {
        logger.error(colors.red(error));
        reject(error);
      });
    });
  }
}

module.exports = LegislationGetter;
