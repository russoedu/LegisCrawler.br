const request = require('request-promise-native');
const config = require('../config/config');
const logger = require('../helpers/logger');
const htmlparser = require('htmlparser2');
const Legislation = require('../models/Legislation');
const colors = require('colors');

const legislations = config.legislations;
const div = 'div';
const ignoreTag = 'strike';
const searchAttrib = 'art';
const articles = [];

let divCount = 0;
let isArticle = false;
let ignore = false;
let article = '';

legislations.forEach((legislation) => {
  logger.info(legislation.name);
  const requestoptions = {
    url: legislation.url,
    encoding: 'latin1',
  };
  request(requestoptions)
    .then((html) => {
      const parser = new htmlparser.Parser({
        onopentag(tag, attribs) {
          if (tag === div) {
            divCount += 1;
            if (attribs !== undefined && attribs.id === searchAttrib) {
              isArticle = true;
            }
          } else if (tag === ignoreTag) {
            ignore = true;
          }
        },
        ontext(text) {
          if (isArticle && ignore === false) {
            let cleanText = text.replace(/^\s+|\s+$/g, '');
            cleanText = cleanText.replace(/\n+|\r|\t+/g, ' ');
            article += `${cleanText}`;
          }
        },
        onclosetag(tag) {
          if (tag === div) {
            divCount -= 1;
            if (divCount === 0) {
              articles.push(article);
              isArticle = false;
              article = '';
            }
          } else if (tag === ignoreTag) {
            ignore = false;
          }
        },
      }, { decodeEntities: true });
      parser.write(html);
      parser.end();

      const legis = new Legislation(legislation.name, articles);
      legis
        .create()
        .then((creationResponse) => {
          logger.info('SUCCESS');
          logger.info(creationResponse);
        })
        .catch((creationError) => {
          logger.error(colors.red(creationError));
        });
      return 0;
    })
    .catch((error) => {
      logger.info(error);
      return false;
    });
});
