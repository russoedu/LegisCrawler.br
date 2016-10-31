const request = require('request');
const config = require('../config/config');
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
  console.log(legislation.name);
  const requestoptions = {
    url: legislation.url,
    encoding: 'latin1',
  };
  request(requestoptions, (error, response, html) => {
    if (error || response.statusCode !== 200) {
      return false;
    }
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
    legis.create().then((creationResponse) => {
      console.log('SUCCESS');
    }).catch((creationError) => {
      console.error(colors.red(creationError));
    });
    return 0;
  });
});
