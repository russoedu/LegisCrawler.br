#!/usr/bin/env node
process.env.UV_THREADPOOL_SIZE = 128;

const debug = require('debug')('spider');
const error = require('../helpers/error');
const Db = require('../helpers/Db');
const Category = require('../models/Category');
const Type = require('../models/Type');
const List = require('../models/List');
const Crawl = require('./Crawl');
const SpiderStatus = require('../helpers/SpiderStatus');

const url = 'http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1';
// const url = 'http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1/leis-complementares-1';


Db.connect()
  .then(() => {
    SpiderStatus.start(url);
    return Crawl.page(url, 'home');
  })
  .then((categories) => {
    if (global.error) {
      SpiderStatus.finishAllWithError();
    } else {
      const category = {
        name: 'home',
        type: Type.LIST,
        layout: 'GENERAL_LIST',
        list: categories,
        url,
      };
      // debug(category);
      new Category(category).save();
    }
  })
  .then(() => List.count())
  .then((quantity) => {
    debug(quantity);
    SpiderStatus.finishAll(quantity);
  })
  .then(() => {
    console.log('next final');
  })
  .then(() => {
    Db.close();
  })
  .catch((err) => {
    error('spider', 'general error', err);
  });
