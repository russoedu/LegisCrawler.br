const debug = require('debug')('index');
const error = require('../helpers/error');
const Status = require('../helpers/Status');
const Category = require('../models/Category');
const Type = require('../models/Type');
const Crawl = require('./Crawl');

const url = 'http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1';

Crawl.page(url)
  .then((categories) => {
    const category = {
      name: 'main',
      type: Type.LIST,
      layout: 'GENERAL_LIST',
      list: categories,
      url,
    };
    debug(category);
    new Category(category).save();
    Status.finishAll();
  })
  .catch((err) => {
    error(err);
  });
