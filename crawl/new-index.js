const debug = require('debug')('index');
// const cron = require('node-cron');
// const forLimit = require('for-limit');
// const forLimit = require('for-limit');
// const config = require('../config/config');
const error = require('../helpers/error');
const Status = require('../helpers/Status');
const Category = require('../models/Category');
// const Type = require('../models/Type');
// const Scraper = require('./Scraper');
const Crawl = require('./Crawl');
// const Clean = require('./Clean');
// const Parser = require('./Parser');

// function Crawl
// Crawler.getListTitle('http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1');
// Get the legislations from the URLs set in the config
// const category = new Category({
//   name: 'Vade Mecum',
//   // parent: null,
//   url: 'http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1',
//   // level: 0,
//   type: Type.LIST,
// }).save();
//

const url = 'http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1';
// const url = 'http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1/codigos-1';
Crawl.page(url, 'root', true)
  .then((categories) => {
    debug(categories);
    new Category(categories).save();
    Status.finishAll();
  })
  .catch((err) => {
    error(err);
  });

  // function crawl(i, next) {
  //   setTimeout(() => {
  //     Category.findByLevel(i).then((category) => {
  //       Crawl.page(category.url, category.level + 1, category._id);
  //       next();
  //     });
  //   }, 1000);
  // }

  // forLimit(0, 1, 3, crawl);
  // Crawl.page('http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1')
  //   .then((categories) => {
  //     debug(categories);
  //   })
  //   .catch((err) => {
  //     error('Main Page', 'Could not reach legislation', err);
  //   });

  // cron.schedule('0 0 4 1-31 * *', () => {
  //   forLimit(0, quantity, 3, crawl);
  // });
