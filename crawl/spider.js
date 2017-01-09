#!/usr/bin/env node
process.env.UV_THREADPOOL_SIZE = 128;

const http = require('http');
const cron = require('node-cron');
const debug = require('debug')('spider');

const Crawl = require('./Crawl');
const Scrap = require('./Scrap');

const Category = require('../models/Category');
const Type = require('../models/Type');
const Legislation = require('../models/Legislation');

const error = require('../helpers/error');
const Db = require('../helpers/Db');
const SpiderStatus = require('../helpers/SpiderStatus');
const log = require('../helpers/log');

// Limit the number of simultaneous connections to avoid http 503 error

const parallel = 5;
const url = 'http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1';
// const url = 'http://www4.planalto.gov.br/legislacao/' +
//             'portal-legis/legislacao-1/leis-complementares-1';

http.globalAgent.maxSockets = parallel;

class Spider {
  static crawlLinks() {
    Db.connect()
    // .then(() => {
    //   SpiderStatus.start(url);
    //   return Crawl.page(url, 'home');
    // })
    // .then((categories) => {
    //   if (global.error) {
    //     SpiderStatus.finishAllWithError();
    //   } else {
    //     const category = {
    //       name: 'home',
    //       type: Type.LIST,
    //       layout: 'GENERAL_LIST',
    //       list: categories,
    //       url,
    //     };
    //     // debug(category);
    //     new Category(category).save();
    //   }
    // })
    .then(() => Legislation.listCount())
    .then((quantity) => {
      debug(quantity);
      SpiderStatus.finishAll(quantity);
    })
    .then(() => Legislation.list())
    .then((legislations) => {
      Scrap.legislations(legislations, parallel);
    })
    .then(() => {
      Db.close();
    })
    .catch((err) => {
      error('spider', 'general error', err);
    });
  }
}
Spider.crawlLinks();

// cron.schedule('0 0 4 1-31 * *', () => {
//   Spider.crawlLinks();
// });
