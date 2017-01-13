#!/usr/bin/env node
process.env.UV_THREADPOOL_SIZE = 128;

const http = require('http');
const cron = require('node-cron');
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

const url = 'http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1';
// const url = 'http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1/codigos-1';

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
   * @param {Number} parallel The number of parallel requests and executions
   */
  static crawlLinks(parallel) {
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
        SpiderStatus.finishAll(quantity);
        return quantity;
      })
      // Get all legislations from the DB
      .then(() => Legislation.list({ type: 'LEGISLATION', crawl: 'ART' }))
      // Scrap the legislations
      .then(legislations => Scrap.legislations(legislations, parallel))

      // .then(() => Legislation.find('58758c45a08886be2291dde5'))
      // .then(legislations => Scrap.legislations([legislations], parallel))

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
/**
 * Define if the Spider should create a cron job or run now
 * @property useSchedule
 * @type {Boolean}
 * @default true
 */
let useSchedule = true;
/**
 * Define how many parallel requests and executions should run
 * @property parallel
 * @type {Number}
 * @default 3
 */
let parallel = 3;

// Read the CLI arguments
process.argv.forEach((arg, index) => {
  if (arg === '--no-schedule') {
    useSchedule = false;
  } else if (arg === '--parallel') {
    parallel = Number(process.argv[index + 1]);
  }
});

// Set the number of parallel requests that should be opened
http.globalAgent.maxSockets = parallel;

// Set the cron job if useSchedule was set
if (useSchedule) {
  const hour = 11;
  SpiderStatus.cronSet(hour);
  cron.schedule(`0 0 ${hour} 1-31 * *`, () => {
    Spider.crawlLinks(parallel);
  });
} else {
  Spider.crawlLinks(parallel);
}
