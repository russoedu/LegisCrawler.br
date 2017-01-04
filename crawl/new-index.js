const debug = require('debug')('index');
const error = require('../helpers/error');
const Status = require('../helpers/Status');
const Category = require('../models/Category');
const Crawl = require('./Crawl');

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
