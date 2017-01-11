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

// const url = 'http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1';
const url = 'http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1/codigos-1';


class Spider {
  static crawlLinks(parallel) {
    Db.connect()
      .then(() => {
        const category = {
          name: 'home',
          type: PageType.LIST,
          layout: 'GENERAL_LIST',
          path: '/',
          url,
        };
        Legislation.listSave(category);
        return 0;
      })
      .then(() => {
        SpiderStatus.start(url);
        return Crawl.page(url);
      })
      .then(() => {
        if (global.error) {
          SpiderStatus.finishAllWithError();
          return 0;
        }
        return Legislation.listCount();
      })
      .then((quantity) => {
        debug(quantity);
        SpiderStatus.finishAll(quantity);
      })
      .then(() => Legislation.list())
      .then(legislations => Scrap.legislations(legislations, parallel))
      .then(() => {
        Db.close();
      })
      .catch((err) => {
        error('spider', 'general error', err);
      });
  }
}

let useSchedule = true;
let parallel = 3;

process.argv.forEach((arg, index) => {
  if (arg === '--no-schedule') {
    useSchedule = false;
  } else if (arg === '--parallel') {
    parallel = Number(process.argv[index + 1]);
  }
});


http.globalAgent.maxSockets = parallel;
if (useSchedule) {
  const hour = 11;
  SpiderStatus.cronSet(hour);
  cron.schedule(`0 0 ${hour} 1-31 * *`, () => {
    Spider.crawlLinks(parallel);
  });
} else {
  Spider.crawlLinks(parallel);
}
