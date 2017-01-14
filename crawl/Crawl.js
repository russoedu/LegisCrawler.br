const debug = require('debug')('crawl');
const slug = require('slug');
const async = require('async');

const Scrap = require('./Scrap');

const Legislation = require('../models/Legislation');

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
  static page(crawlUrl, parent = '') {
    debug(parent, crawlUrl);
    return new Promise((resolve, reject) => {
      request(crawlUrl)
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
                  .then((url) => {
                    category.url = url;
                    return Scrap.legislation(category);
                  })
                  .then(legislation => new Legislation(legislation).save())
                  .then((clearMe) => {
                    SpiderStatus.legislationFinish(category.url);
                    clearMe = null;
                    callback();
                    // processedListCounter -= 1;
                    // respond(categories, processedListCounter);
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
