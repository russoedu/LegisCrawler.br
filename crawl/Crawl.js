const debug = require('debug')('crawl');
const slug = require('slug');
const async = require('async');
const Nightmare = require('nightmare');
// const request = require('requestretry');

const Scrap = require('./Scrap');

const Legislation = require('../models/Legislation');

const error = require('../helpers/error');
const SpiderStatus = require('../helpers/SpiderStatus');


function nigtmareRequest(url) {
  return new Promise((resolve, reject) => {
    const nightmare = new Nightmare();
    nightmare
      .useragent('Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36')
      .goto(url)
      .wait('#extra-footer')
      .evaluate(() => document.body.innerHTML)
      .end()
      .then((body) => {
        resolve(body);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
/**
 * Crawl urls for the desired content
 * @module Crawler
 * @class Crawl
 */
class Crawl {
  /**
   * Crawl a start URL and recursively find and capture it's links until a legislation is found
   * @method page
   * @static
   * @param {String} crawlUrl Url to be crawled
   * @param {String} parent The parent(s) slug
   * @param {String} breadCrumb The parent(s) name
   * @return {Promise} Empty promisse after all the recursive calls are finished
   */
  static page(url, parent = '', breadCrumb = '') {
    debug(parent, breadCrumb, url);
    // const requestOptions = {
    //   url,
    //   axAttempts: 100,
    //   retryDelay: 10000,
    //   rejectUnauthorized: false,
    //   fullResponse: false,
    //   retryStrategy: true,
    // };
    return new Promise((resolve, reject) => {
      nigtmareRequest(url)
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
              category.breadCrumb = breadCrumb;

              // If the categories type is list, call Crawl.page recursively and respond
              if (category.type === 'LIST') {
                new Legislation(category).save()
                  .then((list) => {
                    SpiderStatus.legislationFinish(category.url);
                    category._id = list._id;
                    return category;
                  })
                  .then(() => {
                    const bc = breadCrumb === '' ? `${category.name}` : `${breadCrumb}>${category.name}`;
                    Crawl.page(category.url, `${parent}/${catSlug}`, bc)
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
          error('getPages', `Could not reach ${url}`, err);
          reject(error);
        });
    });
  }
}

module.exports = Crawl;
