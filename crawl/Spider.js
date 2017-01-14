const debug = require('debug')('spider');

const Crawl = require('./Crawl');
const Scrap = require('./Scrap');

const Legislation = require('../models/Legislation');
const PageType = require('../models/PageType');
// const Legislation = require('../models/Legislation');

const error = require('../helpers/error');
const Db = require('../helpers/Db');
const SpiderStatus = require('../helpers/SpiderStatus');

// Limit the number of simultaneous connections to avoid http 503 error


/**
 * Web Spider to capture everithing from an URL
 * @module Crawler
 * @class Spider
 */
class Spider {
  /**
   * Capture all links and it's details and content from a single URL
   * @method crawlLinks
   * @static
   */
  static crawlLinks(url) {
    // Create the DB connection
    Db.connect()
      // Create the home category in the DB
      .then(() => {
        const category = {
          name: 'home',
          type: PageType.LIST,
          layout: 'GENERAL_LIST',
          path: '/',
          url,
        };
        new Legislation(category).save().then(() => 0);
      })
      // Start crawling the home
      .then(() => {
        SpiderStatus.start(url);
        return Crawl.page(url);
      })
      // Count the legislations created
      .then(() => {
        const quantity = Legislation.count();
        debug(quantity);
        SpiderStatus.finishAll(quantity);
        return quantity;
      })
      // Get all legislations from the DB
      .then(() => Legislation.list({ type: 'LEGISLATION', crawl: 'ART' }))
      // Scrap the legislations
      .then(legislations => Scrap.legislations(legislations, global.parallel))

      // Close the DB connection
      .then(() => {
        Db.close();
      })
      .catch((err) => {
        Db.close();
        error('spider', 'general error', err);
      });
  }
}

module.exports = Spider;
