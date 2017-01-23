const debug = require('debug')('scrap');
const htmlparser = require('htmlparser2');
const slug = require('slug');
const cheerio = require('cheerio');
const request = require('requestretry');

const Fix = require('./Fix');

const Legislation = require('../models/Legislation');
const Layout = require('../models/Layout');
const PageType = require('../models/PageType');

const Text = require('../helpers/Text');
const error = require('../helpers/error');

const pvt = {
  requestOptions: {
    axAttempts: 1000,
    retryDelay: 60 * 1000,
    fullResponse: false,
    rejectUnauthorized: false,
    retryStrategy: true,
    encoding: 'latin1',
  },

  /**
   * Scrap Layout.GENERAL_LIST HTML to get it's links and create a Legislation for each
   * @method getGeneraCategoriesLinks
   * @private
   * @param {String} html The HTML that will be scraped
   * @return {Array} Array of 'Legislation' objects
   */
  getGeneraCategoriesLinks(html) {
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
            type = Fix.type(url, name, PageType.check(url));
            category = new Legislation({
              name,
              url,
              type,
              slug: slug(name.replace(/\./g, '-', '-'), { lower: true }),
            });

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
   * Scrap Layout.COLUMNS_LIST HTML to get it's links and create a Legislation for each
   * @method getColumnCategoriesLinks
   * @private
   * @param {String} html The HTML that will be scraped
   * @return {Array} Array of 'Legislation' objects
   */
  getColumnCategoriesLinks(html) {
    debug('getColumnCategoriesLinks');
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
            type = Fix.type(url, name, PageType.check(url));
            category = new Legislation({
              name,
              url,
              type,
              slug: slug(name.replace(/\./g, '-', '-'), { lower: true }),
            });

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
   * Scrap Layout.IMAGES_LIST HTML to get it's links and create a Legislation for each
   * @method getImageCategoriesLinks
   * @private
   * @param {String} html The HTML that will be scraped
   * @return {Array} Array of 'Legislation' objects
   */
  getImageCategoriesLinks(html) {
    debug('getImageCategoriesLinks');
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
            name = Fix.name(Text.fromImageUrl(attribs.src));
            url = Fix.url(url, name);

            if (name && url) {
              type = Fix.type(url, name, PageType.check(url));
              const category = new Legislation({
                name,
                url,
                type,
                slug: slug(name.replace(/\./g, '-', '-'), { lower: true }),
              });

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
};
/**
 * Scrap HTMLs to get specific content
 * @module Crawler
 * @class Scrap
 */
class Scrap {
  /**
   * @constructor
   * @param {String} html The HTML used in the class
   */
  constructor(html) {
    this.html = html;
  }

  /**
   * @method legislation
   * @static
   * @param {Object} leg Legislation object
   * @return {Promise} Promise with the same legislation object with the clean html on content attribute
   */
  static legislation(leg) {
    const legislation = leg;
    return new Promise((resolve, reject) => {
      // ScrapStatus.legislationStart(legislation.url);
      pvt.requestOptions.url = legislation.url;
      request(pvt.requestOptions)
        .then((data) => {
          const $ = cheerio.load(data, { decodeEntities: false });
          const $head = $('head');
          // Remove all head content
          $head.empty();


          // Remove all attributes
          $('*').each(function removeAttributes() {
            this.attribs = {};
            if (!(this.type === 'tag' && this.name === 'font')) {
              console.log(this);
            }
          });

          // Add legislation.css to the head
          $head.append('<link rel="stylesheet" type="text/css" href="/legislation.css" />');

          return $.html().replace(/[\n\t\r]/mgi, '');
        })
        .then((content) => {
          legislation.content = content;
          resolve(legislation);
        })
        .catch((err) => {
          error(legislation.name, legislation.url, 'Could not reach legislation', err);
          reject(err);
        });
    });
  }

  static compiledUrl(crawlUrl) {
    let processing = false;
    let url;
    let response = crawlUrl;

    pvt.requestOptions.url = crawlUrl;

    const parser = new htmlparser.Parser({
      onopentag(tag, attribs) {
          // Check if the page processing is activated
        if (tag === 'a') {
          processing = true;
          url = attribs.href;
        }
      },
      ontext(text) {
        if (processing && text.match(/texto[\n\s.]*compilado/gmi)) {
          response = url;
        }
      },
      onclosetag(tag) {
        if (processing === true && tag === 'a') {
          processing = false;
        }
      },
    }, {
      decodeEntities: true,
    });

    return new Promise((resolve) => {
      request(pvt.requestOptions)
        .then((crawlHtml) => {
          parser.write(crawlHtml);
          parser.end();

          if (!response.match(/http/)) {
            response = crawlUrl.replace(/(https?:\/\/.*\/)(.*)/, `$1${response}`);
            debug(crawlUrl, response);
          }
          resolve(response);
        });
    });
  }

  /**
  * Scrap the categories links from the html and return a list o
  * @method categories
  * @return {Object} Object with Categories objects
  * @example
  * {
  *   constituicao: {
  *     name: 'Constituição',
  *     url: 'http://www.planalto.gov.br/ccivil_03/Constituicao/Constituicao.htm',
  *     type: 'LEGISLATION',
  *     slug: 'constituicao'
  *   },
  *   'medidas-provisorias': {
  *     name: 'Medidas Provisórias',
  *     url: 'http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1/medidas-provisorias',
  *     type: 'LIST',
  *     slug: 'medidas-provisorias'
  *   },
  *   'mensagens-de-veto-total': {
  *     name: 'Mensagens de Veto Total',
  *     url: 'http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1/mensagem-de-veto-total',
  *     type: 'LIST',
  *     slug: 'mensagens-de-veto-total'
  *   }
  * }
  */
  categories() {
    const layout = this.layout();
    let categories = {};

    // Verify the type of layout to use the correct scraper
    if (layout === Layout.GENERAL_LIST) {
      categories = pvt.getGeneraCategoriesLinks(this.html);
    } else if (layout === Layout.IMAGES_LIST) {
      categories = pvt.getImageCategoriesLinks(this.html);
    } else if (layout === Layout.COLUMNS_LIST) {
      categories = pvt.getColumnCategoriesLinks(this.html);
    } else {
      error('Crawl', 'no layout found', this.html);
    }
    return categories;
  }

  /**
   * Check the layout of the HTML
   * @method layout
   * @return {Object} The Layout of the HTML (GENERAL_LIST, COLUMNS_LIST
   *                  or IMAGES_LIST)
   */
  layout() {
    let processing = false;
    let ignoreCount = 0;
    let countTds = false;
    let tdCounter = 0;
    let removeTd = true;
    let response = Layout.IMAGES_LIST;

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
              response = Layout.COLUMNS_LIST;
            } else if (tdCounter === 3) {
              response = Layout.GENERAL_LIST;
            }
          }
        }
      },
    }, {
      decodeEntities: true,
    });

    parser.write(this.html);
    parser.end();

    return response;
  }
}

module.exports = Scrap;
