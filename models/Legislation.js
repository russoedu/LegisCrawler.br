const Db = require('../helpers/Db');
const debug = require('debug')('model');
// const error = require('../helpers/error');

const collection = 'legislations';

class Legislation {
  constructor(name = null, category = null, link = null, url = null, articles = null) {
    this.name = name;
    this.category = category;
    this.link = link;
    this.url = url;
    this.date = new Date().toLocaleString(
      'pt-BR',
      {
        timeZone: 'America/Sao_Paulo',
      });
    this.articles = articles;
  }

  static find(id) {
    return Db.find(
      collection,
      {
        _id: '',
        name: '',
        link: '',
        category: '',
        url: '',
        date: '',
        articles: '',
      },
      id
    );
  }

  save() {
    debug(this);
    return Db.createOrUpdate(collection, this);
  }
}

module.exports = Legislation;
