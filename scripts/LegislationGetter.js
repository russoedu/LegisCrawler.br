const request = require('request-promise-native');
const htmlparser = require('htmlparser2');
const colors = require('colors');
const logger = require('../helpers/logger');


class LegislationGetter {
  static getLegislationText(legislation) {
    const searchTag = 'div';
    const ignoreTag = /strike|del/;
    const searchAttrib = legislation.searchAttrib;
    // const searchAttrib = /art[0-9]+[A-z]*/;

    let legislationData = '';
    let searchTagCount = 0;
    let isArticle = false;
    let ignore = false;
    let article = '';

    return new Promise((resolve, reject) => {
      const requestoptions = {
        url: legislation.url,
        encoding: 'latin1',
      };
      request(requestoptions)
      .then((html) => {
        const parser = new htmlparser.Parser({
          onopentag(tag, attribs) {
            console.log(`>>>${tag}<<<${ignoreTag.test(tag)}`);
            if (tag === searchTag) {
              searchTagCount += 1;
              if (attribs !== undefined &&
                 (attribs.id === searchAttrib)) {
                isArticle = true;
              }
            } else if (ignoreTag.test(tag)) {
              ignore = true;
            }
          },
          ontext(text) {
            if (isArticle && ignore === false) {
              let cleanText = text;
              // Clean the text removing white spaces chars
              cleanText = cleanText.replace(/\n+|\r+|\t+|\u00A0|\u0096/g, ' ');
              // Clean the text removing double spaces chars
              cleanText = cleanText.replace(/\s\s+/g, ' ');
              // Clean the text removing comments
              // cleanText = cleanText.replace(/\([^\)]*\)/, '');

              article += cleanText;
            }
          },
          onclosetag(tag) {
            if (tag === searchTag) {
              searchTagCount -= 1;
              if (searchTagCount === 0 && article !== '') {
                legislationData += article;
                isArticle = false;
                article = '';
              }
            } else if (ignoreTag.test(tag)) {
              ignore = false;
            }
          },
        }, { decodeEntities: true });
        parser.write(html);
        parser.end();

        logger.info(colors.green('SUCCESS retrieving data'));
        resolve({
          legislationType: legislation.type,
          legislationUrl: legislation.url,
          legislationData,
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
