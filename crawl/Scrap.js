const debug = require('debug')('scrap');
const forLimit = require('for-limit');
const htmlparser = require('htmlparser2');
const slug = require('slug');
const request = require('request-promise-native');

const Clean = require('./Clean');
const Fix = require('./Fix');

const Category = require('../models/Category');
const Layout = require('../models/Layout');
const Type = require('../models/Type');
const Legislation = require('../models/Legislation');

const Name = require('../helpers/Name');
const error = require('../helpers/error');
// const log = require('../helpers/log');
const ScrapStatus = require('../helpers/ScrapStatus');

const priv = {
  /**
   * Scrap Layout.GENERAL_LIST HTML to get it's links and create a Category for each
   * @method generalListCategories
   * @private
   * @param {String} html The HTML that will be scraped
   * @return {Array} Array of 'Category' objects
   */
  generalListCategories(origin, html) {
    debug('generalListCategories', origin);
    let processing = false;
    let captureText = false;

    const categories = {};
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
              slug: slug(name.replace(/\./g, '-', '-'), { lower: true }),
            });
            if (type === Type.LIST) {
              category.list = {};
            }

            categories[category.slug] = category;
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
  },

  /**
   * Scrap Layout.COLUMNS_LIST HTML to get it's links and create a Category for each
   * @method columnsListCategories
   * @private
   * @param {String} html The HTML that will be scraped
   * @return {Array} Array of 'Category' objects
   */
  columnsListCategories(origin, html) {
    debug('columnsListCategories', origin);
    let processing = false;
    let processingTr = false;
    let processingTd = false;
    let processingA = false;
    let captureText = false;

    const categories = {};
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
              slug: slug(name.replace(/\./g, '-', '-'), { lower: true }),
            });
            if (type === Type.LIST) {
              category.list = {};
            }

            categories[category.slug] = category;
            // categories.push(category);
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
  },

  /**
   * Scrap Layout.IMAGES_LIST HTML to get it's links and create a Category for each
   * @method imagesListCategories
   * @private
   * @param {String} html The HTML that will be scraped
   * @return {Array} Array of 'Category' objects
   */
  imagesListCategories(origin, html) {
    debug('imagesListCategories', origin);
    let processing = false;
    let captureImage = false;

    const categories = {};
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
                slug: slug(name.replace(/\./g, '-', '-'), { lower: true }),
              });

              if (type === Type.LIST) {
                category.list = {};
              }

              categories[category.slug] = category;
              // categories.push(category);
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
  },

  /**
   * Legislations list
   * @private
   * @type {Object}
   */
  legislations: {},

  /**
   * Last legislations index
   * @private
   * @type {Number}
   */
  legislationsLastIndex: 0,

  /**
   * Scrap a page and retrieve it's content
   * @method page
   * @private
   * @param {Object} legislation Legislation object
   */
  page(legislation) {
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
                // debug(`ignored tag: ${tag}`);
                useContent = false;
              }
            },
            ontext(dirtyText) {
              if (useContent || uniqueParagraphRegEx.test(dirtyText)) {
                // debug(`captured ${dirtyText}`);
                scrapedContent += dirtyText;
              } else {
                // debug(`ignored ${dirtyText}`);
              }
            },
            onclosetag(tag) {
              if (ignoreTagRegEx.test(tag)) {
                // debug(`finished ignored tag: ${tag}`);
                useContent = true;
              }
            },
          }, {
            decodeEntities: true,
          });
          parser.write(html);
          parser.end();

          debug('scrapedContent', scrapedContent);
          resolve(scrapedContent);
        })
        .catch((err) => {
          error(legislation.name, 'Could not scrap page', err);
          reject(error);
        });
    });
  },

  /**
   * Breakes the article into it's number and it's text
   * @method getArticles
   * @static
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
  getArticles(cleanText) {
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
  },

  /**
   * @method legislation
   * @private
   * @param {Number} i Iterator
   * @param {function} next forLimit next function
   */
  legislation(i, next) {
    setTimeout(() => {
      const legislation = priv.legislations[i];
      const status = new ScrapStatus(legislation.name, legislation.url);

      status.startProcessComplete();
      status.startProcess('Scrap');

      // TODO Check the type of legislation - some of them don't have articles
      // http://www.planalto.gov.br/ccivil_03/_Ato2004-2006/2004/Msg/VET/VET-2-04.htm
      priv.page(legislation)
        // Get the legislations from the URLs set in the config
        .then((scrapedText) => {
          status.finishProcess();
          return scrapedText;
        })
        // Clean the text removing everithing that is not part of an article
        .then((scrapedText) => {
          // debug(scrapedText);
          status.startProcess('Clean');
          const cleanText = Clean.scrapedText(scrapedText);
          // debug(cleanText);
          status.finishProcess();
          return cleanText;
        })
        // Parse the content to extract Articles
        .then((cleanText) => {
          status.startProcess('Parse');
          const articles = priv.getArticles(cleanText);
          // debug(articles);
          status.finishProcess();
          return articles;
        })
        // Clean articles
        .then((articles) => {
          status.startProcess('Clean');
          // debug(articles);

          const cleanArticles = Clean.articles(legislation.name, articles);
          debug(cleanArticles);
          status.finishProcess();
          return cleanArticles;
        })
        // Save the organized legislation
        .then((cleanArticles) => {
          status.startProcess('Save');
          const legis = new Legislation(
            legislation.name,
            legislation.category,
            legislation.link,
            legislation.url,
            cleanArticles
          );

          // Save the lislation in the DB
          legis.save();
          status.finishProcess();

          status.finishProcessComplete();
        // status.finishAll();
        })
        .then(() => {
          ScrapStatus.finishAll(priv.legislationsLastIndex, i);
          next();
        })
        .catch((err) => {
          error(legislation.name, 'Could not reach legislation', err);
        });
    }, 1000);
  },
};
/**
 * Scrap HTMLs to get specific content
 * @module Crawler
 * @class Scrap
 */
class Scrap {
  /**
   * Scrap a list of legislations and save each on on the legislations DB
   * @param  {Array} legislations Array of legislations objects
   * @param  {Number} parallel    Number of parallel request executions
   * @return {Promise}            Promise with success response after all legislations has been
   *                              scraped
   */
  static legislations(legislations, parallel) {
    priv.legislations = legislations;
    priv.legislationsLastIndex = legislations.length - 1;
    forLimit(0, priv.legislationsLastIndex, parallel, priv.legislation);
  }
  static listCategories(name, html) {
    const layout = Scrap.layout(html);
    let legislations = {};

    // Verify the type of layout to use the correct parser
    if (Layout.enumValueOf(layout) === Layout.GENERAL_LIST) {
      legislations = priv.generalListCategories(name, html);
    } else if (Layout.enumValueOf(layout) === Layout.IMAGES_LIST) {
      legislations = priv.imagesListCategories(name, html);
    } else if (Layout.enumValueOf(layout) === Layout.COLUMNS_LIST) {
      legislations = priv.columnsListCategories(name, html);
    } else {
      error('Crawl', 'no layout found', name);
    }
    return legislations;
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
}

module.exports = Scrap;
