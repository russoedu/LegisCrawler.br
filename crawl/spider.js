const debug = require('debug')('spider');
const error = require('../helpers/error');
const Status = require('../helpers/Status');
const Db = require('../helpers/Db');
const Category = require('../models/Category');
const Type = require('../models/Type');
const Crawl = require('./Crawl');

const url = 'http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1';

Db.connect().then(() => {
  Crawl.page(url, 'home')
  .then((categories) => {
    if (global.error) {
      Status.finishAllWithError();
    } else {
      const category = {
        name: 'home',
        type: Type.LIST,
        layout: 'GENERAL_LIST',
        list: categories,
        url,
      };
      new Category(category).save();
      debug(category.list['leis-ordinarias'].list['1988'].list['7-714-de-29-12-88']);
      Status.finishAll();
    }
  })
  .then(() => {
    global.db.close();
  })
  .catch((err) => {
    error(err);
  });
});
