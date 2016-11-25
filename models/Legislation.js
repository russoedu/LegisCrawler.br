const Db = require('../helpers/Db');
const debug = require('debug')('model');

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

  static list() {
    return new Promise((resolve, reject) => {
      Db.list().then((result) => {
        resolve(result);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  static find(name) {
    return new Promise((resolve, reject) => {
      Db.find({
        name,
      }).then((result) => {
        debug(result);
        resolve(result);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  create() {
    debug(this);
    return new Promise((resolve, reject) => {
      Db.create(this).then((result) => {
        resolve(result);
      }).catch((error) => {
        reject(error);
      });
    });
  }
}

module.exports = Legislation;
