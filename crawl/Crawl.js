const debug = require('debug')('crawl');
const slug = require('slug');
const async = require('async');

const Scrap = require('./Scrap');

const Legislation = require('../models/Legislation');

const request = require('requestretry');
const error = require('../helpers/error');
const SpiderStatus = require('../helpers/SpiderStatus');

// let processing = 0;
// let process = true;
// const processList = [];

/**
 * Crawl urls for the desired content
 * @module Crawler
 * @class Crawl
 */
class Crawl {
  // /**
  //  * Crawl a start URL and recursively find and capture it's links until a legislation is found
  //  * @method url
  //  * @static
  //  * @param {String} crawlUrl Url to be crawled
  //  * @param {String} parent The parent(s) slug
  //  * @return {Promise} Empty promisse after all the recursive calls are finished
  //  */
  // static url(crawlUrl, parent = '') {
  //   debug(parent, crawlUrl);
  //   processing += 1;
  //   request(crawlUrl)
  //     .then((crawlHtml) => {
  //       const scrap = new Scrap(crawlHtml);
  //       return scrap.categories();
  //     })
  //     .then((cat) => {
  //       const categories = cat;
  //       categories.parent = parent;
  //       processList.push(categories);
  //       processing -= 1;
  //     });
  // }

  /**
   * Crawl a start URL and recursively find and capture it's links until a legislation is found
   * @method page
   * @static
   * @param {String} crawlUrl Url to be crawled
   * @param {String} parent The parent(s) slug
   * @return {Promise} Empty promisse after all the recursive calls are finished
   */
  static page(url, parent = '') {
    debug(parent, url);
    const requestOptions = {
      url,
      axAttempts: 100,
      retryDelay: 10000,
      rejectUnauthorized: false,
      fullResponse: false,
      retryStrategy: true,
    };
    return new Promise((resolve, reject) => {
      request(requestOptions)
        .then((crawlHtml) => {
          const scrap = new Scrap(crawlHtml);
          return scrap.categories();
        })
        .then((categories) => {
          // Process the categories with a limit of 'global.parallell' requests in parallel
          async.forEachLimit(
            categories,
            global.parallel,
            (cat, callback) => {
              const category = cat;
              const catSlug = slug(category.name.replace(/\./g, '-', '-'), { lower: true });
              category.parent = (parent === '') ? '/' : parent;

              // TODO - veto não tem artigo - marcar isso em algum lugar
              // If the categories type is list, call Crawl.page recursively and respond
              if (category.type === 'LIST') {
                new Legislation(category).save()
                  .then((list) => {
                    SpiderStatus.legislationFinish(category.url);
                    category._id = list._id;
                    return category;
                  })
                  .then(() => {
                    Crawl.page(category.url, `${parent}/${catSlug}`)
                      .then(() => {
                        callback();
                        // processedListCounter -= 1;
                        // respond(categories, processedListCounter);
                      })
                      .catch((err) => {
                        callback('Crawl', `${parent}/${catSlug} error`, err);
                      });
                  })
                  .catch((err) => {
                    callback('Crawl', `${parent} LIST`, err);
                  });
              // If the legislation type is not a list, respond with the categories
              } else {
                debug(category.slug);
                Scrap.compiledUrl(category.url)
                  .then((compiledUrl) => {
                    category.url = compiledUrl;
                    return Scrap.legislation(category);
                  })
                  .then(legislation => new Legislation(legislation).save())
                  .then((legis) => {
                    SpiderStatus.legislationFinish(category.url);
                    let clearMe = legis;
                    clearMe = null;
                    return clearMe;
                  })
                  .then(() => {
                    callback();
                  })
                  .catch((err) => {
                    callback('Crawl', `${parent} LIST`, err);
                  });
              }
            },
            (err) => {
              if (err) {
                error(err);
              } else {
                debug('finish categories');
                resolve();
              }
            });
        })
        .catch((err) => {
          error('getPages', `Could not reach ${crawlUrl}`, err);
          reject(error);
        });
    });
  }
}

module.exports = Crawl;

// function processCategories(categories) {
//   return new Promise((resolve, reject) => {
//     async.forEachLimit(
//     categories,
//     1,
//     (cat, callback) => {
//       const category = cat;
//       const catSlug = slug(category.name.replace(/\./g, '-', '-'), { lower: true });
//       category.parent = (categories.parent === '') ? '/' : categories.parent;

//       // TODO - veto não tem artigo - marcar isso em algum lugar
//       // If the categories type is list, call Crawl.page recursively and respond
//       if (category.type === 'LIST') {
//         new Legislation(category).save()
//           .then((list) => {
//             SpiderStatus.legislationFinish(category.url);
//             category._id = list._id;
//             return category;
//           })
//           .then(() => {
//             Crawl.url(category.url, `${categories.parent}/${catSlug}`)
//               .then(() => {
//                 callback();
//               })
//               .catch((err) => {
//                 callback('Crawl', `${categories.parent}/${catSlug} error`, err);
//               });
//           })
//           .catch((err) => {
//             callback('Crawl', `${categories.parent} LIST`, err);
//           });
//       // If the legislation type is not a list, respond with the categories
//       } else {
//         debug(category.slug);
//         Scrap.compiledUrl(category.url)
//           .then((url) => {
//             category.url = url;
//             return Scrap.legislation(category);
//           })
//           .then(legislation => new Legislation(legislation).save())
//           .then((legis) => {
//             SpiderStatus.legislationFinish(category.url);
//             let clearMe = legis;
//             clearMe = null;
//             return clearMe;
//           })
//           .then(() => {
//             callback();
//           })
//           .catch((err) => {
//             callback('Crawl', `${categories.parent} LIST`, err);
//           });
//       }
//     },
//     (err) => {
//       if (err) {
//         error(err);
//       } else {
//         debug('finish categories');
//         resolve();
//       }
//     });
//   });
// }

// function processMinus() {
//   processing -= 1;
// }
//
// // function processTheList() {
// while (process) {
//   if (processing < global.parallel && processList.length > 0) {
//     processing += 1;
//     const categories = processList[0];
//     processList.data.splice(0, 1);
//     processCategories(categories).then(processMinus());
//   }
// }
// }
