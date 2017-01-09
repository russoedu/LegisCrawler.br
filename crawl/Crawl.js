const debug = require('debug')('crawl');

const Scrap = require('./Scrap');

const Category = require('../models/Category');

const request = require('../helpers/request');
const error = require('../helpers/error');
const SpiderStatus = require('../helpers/SpiderStatus');

/**
 * Crawl urls for the desired content
 * @module Crawler
 * @class Crawl
 */
class Crawl {
  /**
   * Crawl Planalto's main page: http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1
   * Capture all links and return the link and the title as a promise
   * @method mainLegislationPage
   * @param {String} crawlUrl Url to be crawled
   * @static
   * @return {Promise} Array of legislations with name and link
   */
  static page(crawlUrl, name) {
    debug(name, crawlUrl);
    return new Promise((resolve, reject) => {
      function respond(data, processedListCounter) {
        // debug('respond', processedListCounter, crawlUrl);
        if (processedListCounter === 0) {
          resolve(data);
        }
      }

      request(crawlUrl)
        .then(html => Scrap.categories(html),
          (err) => {
            error('Crawl', `request ${crawlUrl}`, err);
            reject(err);
          })
        .then((categories) => {
          // Start processing the lists
          let processedListCounter = Object.keys(categories).length;
          // If the categories are empty, respond with the empty array
          if (processedListCounter === 0) {
            respond(categories, processedListCounter);
          } else {
            // If there is data, process each one
            Object.keys(categories).forEach((lKey) => {
              const parent = categories[lKey];
              // If the categories type is list, call Crawl.page recursively and respond
              if (categories[lKey].type === 'LIST') {
                Crawl.page(categories[lKey].url, `${name}>${categories[lKey].name}`)
                  .then((list) => {
                    // debug(index, categories.type, list.length);
                    parent.list = list;
                    processedListCounter -= 1;
                    respond(categories, processedListCounter);
                  }, (err) => {
                    error('Crawl', `${name} recursion error`, err);
                  })
                  .catch((err) => {
                    error('Crawl', `${name} recursion error`, err);
                  });
              // If the legislation type is not a list, respond with the categories
              } else {
                const category = categories[lKey];
                debug(category.slug);

                Category.listSave(category)
                  .then((list) => {
                    SpiderStatus.legislationFinish(category.url);
                    category._id = list._id;
                    processedListCounter -= 1;
                    respond(categories, processedListCounter);
                  });
              }
            });
          }
        }, (err) => {
          error('Crawl', 'legislations processing', err);
          reject(err);
        })
        .catch((err) => {
          error('getPages', `Could not reach ${crawlUrl}`, err);
          reject(error);
        });
    });
  }
}

module.exports = Crawl;

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
//         const parser = new htmlparser.Scrap({
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

// function getListTitle(listUrl) {
//   let processingBC = false;
//   let breadCrumb = '';
//
//   return new Promise((resolve, reject) => {
//     const requestoptions = {
//       url: listUrl,
//       // encoding: 'latin1',
//     };
//     request(requestoptions)
//     .then((html) => {
//       const parser = new htmlparser.Scrap({
//         onopentag(tag, attribs) {
//           if (tag === 'div' && attribs.id === 'portal-breadcrumbs') {
//             processingBC = true;
//           }
//         },
//         ontext(text) {
//           if (processingBC) {
//             breadCrumb += text;
//           }
//         },
//         onclosetag(tag) {
//           if (tag === 'div' && processingBC) {
//             processingBC = false;
//           }
//         },
//       }, {
//         decodeEntities: true,
//       });
//       parser.write(html);
//       parser.end();
//       breadCrumb = Clean.breadCrumb(breadCrumb);
//       // debug(breadCrumb);
//       // debug(chalk.green('scrapedContent', legislations));
//       resolve(breadCrumb);
//     })
//     .catch((err) => {
//       error('InitialPage', 'Could not scrap page', err);
//       reject(error);
//     });
//   });
// }
