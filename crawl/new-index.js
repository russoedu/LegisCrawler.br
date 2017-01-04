const debug = require('debug')('index');
const error = require('../helpers/error');
const Status = require('../helpers/Status');
const Category = require('../models/Category');
const Type = require('../models/Type');
const Crawl = require('./Crawl');

const url = 'http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1';

Crawl.page(url, 'root', true)
  .then((categories) => {
    const category = {
      name: 'main',
      type: Type.LIST,
      list: categories,
      url,
    };
    new Category(category).save();
    Status.finishAll();
  })
  .catch((err) => {
    error(err);
  });
