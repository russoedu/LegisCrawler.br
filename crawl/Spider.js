const debug = require('debug')('spider');

const Crawl = require('./Crawl');

const Legislation = require('../models/Legislation');
const PageType = require('../models/PageType');
// const Legislation = require('../models/Legislation');

const error = require('../helpers/error');
const Db = require('../helpers/Db');
const SpiderStatus = require('../helpers/SpiderStatus');

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
    debug(url);
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
