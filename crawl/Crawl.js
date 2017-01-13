const debug = require('debug')('crawl');
const slug = require('slug');

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
      let scrap;
      function respond(data, processedListCounter) {
        debug('respond', processedListCounter, crawlUrl);
        if (processedListCounter === 0) {
          resolve(data);
        }
      }

      request(crawlUrl)
        .then((crawlHtml) => {
          scrap = new Scrap(crawlHtml);
          return scrap.categories();
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
              const category = categories[lKey];
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
                        processedListCounter -= 1;
                        respond(categories, processedListCounter);
                      })
                      .catch((err) => {
                        error('Crawl', `${parent}/${catSlug} error`, err);
                      });
                  })
                  .catch((err) => {
                    error('Crawl', `${parent} LIST`, err);
                  });
              // If the legislation type is not a list, respond with the categories
              } else {
                debug(category.slug);
                category.crawl = parent.match(/\/mensagens-de-veto-total/) ? 'TEXT' : 'ART';
                Scrap.getCompiledUrl(category.url)
                  .then((url) => {
                    category.url = url;
                    new Legislation(category).save()
                      .then((list) => {
                        SpiderStatus.legislationFinish(category.url);
                        category._id = list._id;
                        processedListCounter -= 1;
                        respond(categories, processedListCounter);
                      });
                  });
              }
            });
          }
        })
        .catch((err) => {
          error('getPages', `Could not reach ${crawlUrl}`, err);
          reject(error);
        });
    });
  }
}

module.exports = Crawl;
