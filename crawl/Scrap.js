const debug = require('debug')('scrap');
const htmlparser = require('htmlparser2');
const Clean = require('./Clean');
const Fix = require('./Fix');
const Category = require('../models/Category');
const Type = require('../models/Type');
const Name = require('../helpers/Name');

/**
 * Scrap HTMLs to get specific content
 * @module Crawler
 * @class Scrap
 */
class Scrap {
  /**
   * Scrap Layout.GENERAL_LIST HTML to get it's links and create a Category for each
   * @method generalListCategories
   * @static
   * @param {String} html The HTML that will be scraped
   * @return {Array} Array of 'Category' objects
   */
  static generalListCategories(origin, html) {
    debug('generalListCategories', origin);
    let processing = false;
    let captureText = false;

    const categories = [];
    let name;
    let url;
    let type;
    let category = {};
    const parser = new htmlparser.Parser({
      onopentag(tag, attribs) {
        // Check if the 'content-core' id is found to activate the processing
        if (tag === 'div' && attribs.id === 'content-core' && processing === false) {
          processing = true;
        // Check if the page processing is activated
        } else if (processing) {
          // add divs inside the capture div to the ignore counter
          if (tag === 'a') {
            url = attribs.href;
            captureText = true;
          }
        }
      },
      ontext(text) {
        if (processing === true && captureText) {
          name = Fix.name(text);
          url = Fix.url(url, name);

          if (name && url) {
            type = Fix.type(url, name, Type.check(url));
            category = new Category({
              name,
              url,
              type,
            });
            if (type === Type.LIST) {
              category.list = [];
            }

            categories.push(category);
          }
          captureText = false;
        }
      },
      onclosetag(tag) {
        if (tag === 'div' && processing) {
          processing = false;
        }
      },
    }, {
      decodeEntities: true,
    });
    parser.write(html);
    parser.end();

    return categories;
  }

  /**
   * Scrap Layout.COLUMNS_LIST HTML to get it's links and create a Category for each
   * @method columnsListCategories
   * @static
   * @param {String} html The HTML that will be scraped
   * @return {Array} Array of 'Category' objects
   */
  static columnsListCategories(origin, html) {
    debug('columnsListCategories', origin);
    let processing = false;
    let processingTr = false;
    let processingTd = false;
    let processingA = false;
    let captureText = false;

    const categories = [];
    let name;
    let url;
    let type;
    let category = {};
    const parser = new htmlparser.Parser({
      onopentag(tag, attribs) {
        // Check if the 'content-core' id is found to activate the processing
        if (tag === 'div' && attribs.id === 'content-core' && processing === false) {
          processing = true;
        // Check if the page processing is activated
        } else if (processing) {
          // Reset 'td' and 'a' processign
          if (tag === 'tr') {
            processingTr = true;
            processingTd = false;
            processingA = false;
          } else if (processingTr && tag === 'td') {
            processingTd = true;
          } else if (tag === 'a' && processingA === false && processingTd) {
            url = attribs.href;
            captureText = true;
            processingA = true;
          }
        }
      },
      ontext(text) {
        if (processing === true && captureText === true) {
          name = Fix.name(text);
          url = Fix.url(url, name);

          if (name && url) {
            type = Fix.type(url, name, Type.check(url));
            debug(name, type.name, url);
            category = new Category({
              name,
              url,
              type,
            });
            if (type === Type.LIST) {
              category.list = [];
            }

            categories.push(category);
          }
          captureText = false;
        }
      },
      onclosetag(tag) {
        if (processing) {
          if (tag === 'div') {
            processing = false;
          }
        }
      },
    }, {
      decodeEntities: true,
    });
    parser.write(html);
    parser.end();

    return categories;
  }

  /**
   * Scrap Layout.IMAGES_LIST HTML to get it's links and create a Category for each
   * @method imagesListCategories
   * @static
   * @param {String} html The HTML that will be scraped
   * @return {Array} Array of 'Category' objects
   */
  static imagesListCategories(origin, html) {
    debug('imagesListCategories', origin);
    let processing = false;
    let captureImage = false;

    const categories = [];
    let name;
    let url;
    let type;
    // const category = {};
    const parser = new htmlparser.Parser({
      onopentag(tag, attribs) {
        // Check if the 'content-core' id is found to activate the processing
        if (tag === 'div' && attribs.id === 'content-core' && processing === false) {
          processing = true;
        // Check if the page processing is activated
        } else if (processing) {
          // add divs inside the capture div to the ignore counter
          if (tag === 'a') {
            url = attribs.href;

            captureImage = true;
          } else if (tag === 'img' &&
                captureImage &&
                attribs.src !== 'http://www4.planalto.gov.br/legislacao/imagens/anos/Setas2.png') {
            name = Fix.name(Name.fromImageUrl(attribs.src));
            url = Fix.url(url, name);

            if (name && url) {
              type = Fix.type(url, name, Type.check(url));
              const category = new Category({
                name,
                url,
                type,
              });

              if (type === Type.LIST) {
                category.list = [];
              }

              categories.push(category);
            }
          }
        }
      },
      onclosetag(tag) {
        if (processing) {
          if (tag === 'div') {
            processing = false;
          } else if (tag === 'a') {
            captureImage = false;
          }
        }
      },
    }, {
      decodeEntities: true,
    });
    parser.write(html);
    parser.end();

    return categories;
  }

  /**
   * Check the layout of an HTML
   * @method layout
   * @static
   * @param {String} html The HTML that will be parsed to discover the layout
   * @return {String} The Layout of the HTML ('GENERAL_LIST', 'COLUMNS_LIST'
   *                  or 'IMAGES_LIST')
   */
  static layout(html) {
    // return new Promise((resolve, reject) => {
    let processing = false;
    let ignoreCount = 0;
    let countTds = false;
    let tdCounter = 0;
    let removeTd = true;
    let response = 'IMAGES_LIST';

    const parser = new htmlparser.Parser({
      onopentag(tag, attribs) {
          // Check if the page processing is activated
        if (processing === true) {
            // add divs inside the capture div to the ignore counter
          if (tag === 'div') {
            ignoreCount += 1;
          } else if (tag === 'tr') {
            countTds = true;
          } else if (tag === 'td' && countTds) {
            tdCounter += 1;
          } else if (tag === 'a' && countTds && tdCounter === 3) {
            removeTd = false;
          }
          // Check if the 'content-core' id is found to activate the processing
        } else if (tag === 'div' && attribs.id === 'content-core') {
          processing = true;
        }
      },
      onclosetag(tag) {
        if (processing === true) {
          if (tag === 'div') {
            if (ignoreCount === 0) {
              processing = false;
            } else if (ignoreCount > 0) {
              ignoreCount -= 1;
            }
          } else if (tag === 'tr') {
            if (tdCounter === 2 || (removeTd && tdCounter === 3)) {
              response = 'COLUMNS_LIST';
            } else if (tdCounter === 3) {
              response = 'GENERAL_LIST';
            }
          }
        }
      },
    }, {
      decodeEntities: true,
    });

    parser.write(html);
    parser.end();

    return response;
  }

  /**
   * Breakes the article into it's number and it's text
   * @param  {String} cleanText    The text already cleanned to be parsed into articles
   * @return {Array}               Array with each article object
   * @example
   * [
   *    {
   *      number: '1º',
   *      article: 'Os menores de 18 anos são penalmente inimputáveis, ficando sujeitos às …'
   *    },
   *    {
   *      number: '10',
   *      article: 'É assegurada a \nparticipação dos trabalhadores e empregadores nos …'
   *    }
   * ]
   */
  static getArticles(cleanText) {
    const articleRegEx = /^(Art.)\s[0-9.?]+([o|º|o.|°])?\s?(-|\.)?(\s|[A-Z]+\.\s)?/gm;
    let text = cleanText;
    const articles = [];
    // Get only the article numeric part
    const articlesMatch = text.match(articleRegEx);
    // debug('articlesMatch', articlesMatch);

    let order = 0;
    articlesMatch.forEach((num, index) => {
      // The first split results in an empty string, so we need to treat it
      // debug('num: ', num);
      const nextNum = articlesMatch[index + 1];
      // debug('nextNum: ', nextNum);
      const number = Clean.articleNumber(num);
      // debug('number: ', number);
      const splitNextNum = text.split(nextNum);
      // const lastOne = articlesMatch.length - 1;
      // const nextNumClean = nextNum ? Cleaner.cleanArticleNumber(nextNum) : '';
      // debug('number:', number, 'nextNumClean:', nextNumClean, 'index:', index,
      //       'lastOne:', lastOne, 'splitNextNum.length', splitNextNum.length);

      text = splitNextNum ? splitNextNum[splitNextNum.length - 1] : '';
      if (index === 0) {
        const article = splitNextNum[0].split(num)[splitNextNum.length - 1];
        articles[order] = {
          number,
          article,
        };
      } else {
        const article = splitNextNum[0] ? splitNextNum[0] : text;
        debug(number, ': ', article);
        articles[order] = {
          number,
          article,
        };
      }
      order += 1;
    });
    // const parsedText = objectToArray(articles, 'article');
    debug(articles);
    return articles;
  }

  /**
   * Some texts don't follow the patterns and need to be treated individually
   * @static
   * @param  {String} legislationName   The name of the legislation
   * @param  {Array} dirtyArticles   Array of articles to be clean
   * @return {Array}        Array of clean articles
   */
  static cleanArticles(legislationName, dirtyArticles) {
    const articles = dirtyArticles;

    articles.forEach((article, index) => {
      articles[index].article = Clean.knownSemanticErrors(legislationName, article);
      articles[index].article = Clean.trim(article.article);
    });

    return articles;
  }
}

module.exports = Scrap;
