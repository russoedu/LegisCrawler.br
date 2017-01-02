const htmlparser = require('htmlparser2');
const request = require('request-promise-native');
const chalk = require('chalk');
const debug = require('debug')('crawl');
const Category = require('../models/Category');
const Type = require('../models/Type');
const error = require('../helpers/error');
const Fix = require('./Fix');
const Clean = require('./Clean');

/**
 * Check the type of a legislation page
 * @method checkType
 * @private
 * @param {String} checkUrl The url that will be parsed and verified the Type
 * @return {Promise} A Type (DATE or LEGISLATION)
 */
function checkType(checkUrl) {
  // Check if url is an HTML
  const urlSplit = checkUrl.split('/');
  // debug(urlSplit);
  const urlCheckSplit = urlSplit[urlSplit.length - 1].split('.');
  // debug(urlCheckSplit);
  const urlCheck = urlCheckSplit[urlCheckSplit.length - 1].toLowerCase();
  let type = Type.LIST;

  // debug(deep, checkUrl, urlCheck);
  // If the URL is an HTML, resolve with Type LEGISLATION
  if (urlCheck.match(/html?/)) {
    type = Type.LEGISLATION;
  } else if (urlCheck === 'pdf') {
    type = Type.PDF;
  } else if (urlCheck === 'doc') {
    type = Type.DOC;
  }

  // debug(type.name, checkUrl);
  return type;
}

/**
 * Crawl urls for the desired content
 * @module Crawler
 * @class Crawler
 */
class Crawl {
  static getListTitle(listUrl) {
    let processingBC = false;
    let breadCrumb = '';

    return new Promise((resolve, reject) => {
      const requestoptions = {
        url: listUrl,
      // encoding: 'latin1',
      };
      request(requestoptions)
        .then((html) => {
          const parser = new htmlparser.Parser({
            onopentag(tag, attribs) {
              if (tag === 'div' && attribs.id === 'portal-breadcrumbs') {
                processingBC = true;
              }
            },
            ontext(text) {
              if (processingBC) {
                breadCrumb += text;
              }
            },
            onclosetag(tag) {
              if (tag === 'div' && processingBC) {
                processingBC = false;
              }
            },
          }, {
            decodeEntities: true,
          });
          parser.write(html);
          parser.end();
          breadCrumb = Clean.breadCrumb(breadCrumb);
          // debug(breadCrumb);
          // debug(chalk.green('scrapedContent', legislations));
          resolve(breadCrumb);
        })
        .catch((err) => {
          error('InitialPage', 'Could not scrap page', err);
          reject(error);
        });
    });
  }
  /**
   * Crawl Planalto's main page: http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1
   * Capture all links and return the link and the title as a promise
   * @method mainLegislationPage
   * @param {String} crawlUrl Url to be crawled
   * @static
   * @return {Promise} Array of legislations with name and link
   */
  static page(crawlUrl, caller, isFirstPage = false) {
    let processing = false;
    let captureText = false;
    let ignoreCount = 0;
    let useTr = false;
    let tdOdd = true;
    const legislations = [];

    if (!crawlUrl) {
      debug('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      debug('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      debug('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      debug('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      // console.log(caller);
      debug(caller);
      // new Category(caller).save();
      debug('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      debug('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      debug('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      debug('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      debug('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    }

    return new Promise((resolve, reject) => {
      const requestoptions = {
        url: crawlUrl,
      };
      request(requestoptions)
        .then((html) => {
          let url = '';
          let alt = '';
          const parser = new htmlparser.Parser({
            onopentag(tag, attribs) {
              // Check if the page processing is activated
              if (processing === true) {
                // add divs inside the capture div to the ignore counter
                if (tag === 'div') {
                  ignoreCount += 1;
                } else if (tag === 'a' && tdOdd) {
                  url = attribs.href;
                  captureText = true;
                  if (!isFirstPage) {
                    tdOdd = !useTr;
                  }
                } else if (tag === 'tr' && !isFirstPage) {
                  useTr = true;
                  tdOdd = true;
                } else if (tag === 'img') {
                  if (attribs.alt && attribs.alt !== '') {
                    alt = attribs.alt;
                  } else if (attribs.title && attribs.title !== '') {
                    alt = attribs.title;
                  } else {
                    alt = attribs.src;
                  }
                // debug('IMG ALT', alt);
                }
              // Check if the 'content-core' id is found to activate the processing
              } else if (tag === 'div' && attribs.id === 'content-core') {
                // debug(chalk.green(`found tag ${tag} with id ${attribs.id}`));
                processing = true;
              }
            },
            ontext(text) {
              if (processing === true && captureText === true) {
                url = Fix.mainLegislationPage(text, url);
                if (url !== null) {
                  const type = checkType(url);
                  let category = {};
                  let name;
                  const txt = text
                    .replace(/^\s|\s$/gm, '')
                    .replace(/\s{2,100}/gm, '')
                    .replace(/\n*(.)\n*/, '$1');
                  // debug(`>${txt}< ${txt === ''} ${txt === null}`);
                  if (txt === '') {
                    if (alt !== '') {
                      name = alt;
                    } else {
                      name = '?';
                    }
                  } else if (txt === 'Mensagem de veto') {
                    name = null;
                  } else {
                    name = txt;
                  }

                  name = Fix.name(name);
                  url = Fix.url(url, name);
                  // debug(`NAME: ${name}, URL: ${url}`);
                  if (name) {
                    category = new Category({
                      name,
                      url,
                      type,
                    });
                    if (type === Type.LIST) {
                      category.list = [];
                    }

                    legislations.push(category);
                  }
                }
                captureText = false;
              }
            },
            onclosetag(tag) {
              if (tag === 'div' && processing === true) {
                if (ignoreCount === 0) {
                  // debug(chalk.green('finished processing'));
                  processing = false;
                } else if (ignoreCount > 0) {
                  // debug(chalk.yellow(`removed ignore div # ${ignoreCount}`));
                  ignoreCount -= 1;
                }
              }
            },
          }, {
            decodeEntities: true,
          });
          parser.write(html);
          parser.end();

          function respond(data, count) {
            if (isFirstPage) {
              debug('FIRST');
              debug(count);
            }
            if (count === 0) {
              resolve(data);
            }
          }
          // Start processing the lists
          let waitForListCount = isFirstPage ? legislations.length - 1 : legislations.length;
          legislations.forEach((legislation) => {
            const parent = legislation;
            if (legislation.type === 'LIST') {
              const newCaller = {
                caller,
                child: legislation,
              };
              Crawl.page(legislation.url, newCaller)
                .then((list) => {
                  parent.list = list;
                  waitForListCount -= 1;
                  respond(legislations, waitForListCount);
                }, (err) => {
                  error(err);
                })
                .catch((err) => {
                  error(err);
                });
            } else {
              waitForListCount -= 1;
              respond(legislations, waitForListCount);
            }
          });
        })
        .catch((err) => {
          error('getPages', 'Could not scrap page', err);
          reject(error);
        });
    });
  }
/**
 * Check the type of a legislation page
 * @method checkType
 * @static
 * @param {String} checkUrl The url that will be parsed and verified the Type
 * @return {Promise} A Type (DATE or LEGISLATION)
 */
// static getLinks(checkUrl) {
//   if (!checkUrl) {
//     error('NO URL!!!');
//     return new Promise((resolve, reject) => {
//       resolve('');
//     });
//   }
//   return new Promise((resolve, reject) => {
//     // Check if url is an HTML
//     const urlSplit = checkUrl.split('/');
//     // debug(urlSplit);
//     const htmlCheckSplit = urlSplit[urlSplit.length - 1].split('.');
//     // debug(htmlCheckSplit);
//     const htmlCheck = htmlCheckSplit[htmlCheckSplit.length - 1].toLowerCase();
//
//     // If the URL is an HTML, resolve with Type LEGISLATION
//     if (htmlCheck === 'htm' || htmlCheck === 'html') {
//       resolve(Type.LEGISLATION);
//     }
//
//     // Check the other types
//     let processing = false;
//     let ignoreCount = 0;
//     let captureText = false;
//     let url = '';
//     const requestoptions = {
//       url: checkUrl,
//       encoding: 'latin1',
//     };
//     request(requestoptions)
//       .then((html) => {
//         const parser = new htmlparser.Parser({
//           onopentag(tag, attribs) {
//             // Check if the page processing is activated
//             if (processing === true) {
//               // add divs inside the capture div to the ignore counter
//               if (tag === 'div') {
//                 ignoreCount += 1;
//               } else if (tag === 'a') {
//                 url = attribs.href;
//                 captureText = true;
//               }
//             // Check if the 'content-core' id is found to activate the processing
//             } else if (tag === 'div' && attribs.id === 'content-core') {
//               // debug(chalk.green(`found tag ${tag} with id ${attribs.id}`));
//               processing = true;
//             }
//           },
//           ontext(name) {
//             if (processing === true && captureText === true) {
//               // debug(chalk.blue(`captured ${name}, ${url}`));
//             }
//           },
//           onclosetag(tag) {
//             if (tag === 'div' && processing === true) {
//               if (ignoreCount === 0) {
//                 // debug(chalk.green('finished processing'));
//                 processing = false;
//               } else if (ignoreCount > 0) {
//                 // debug(chalk.yellow(`removed ignore div # ${ignoreCount}`));
//                 ignoreCount -= 1;
//               }
//             }
//           },
//         }, {
//           decodeEntities: true,
//         });
//         parser.write(html);
//         parser.end();
//
//         resolve(Type.LIST);
//       })
//       .catch((err) => {
//         error('checkType', `Could not check type of ${url}`, err);
//         reject(error);
//       });
//   });
// }
}

module.exports = Crawl;
