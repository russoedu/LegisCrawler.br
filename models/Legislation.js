const Db = require('../helpers/Db');
const debug = require('debug')('model');

class Legislation {
  constructor(category = null, link = null, name = null, url = null, data = null) {
    this.category = category;
    this.link = link;
    this.name = name;
    this.url = url;
    this.data = data;
    this.date = new Date().toLocaleString(
      'pt-BR',
      {
        timeZone: 'America/Sao_Paulo',
      });
  }

  static list() {
    return new Promise((resolve, reject) => {
      Db.list().then((data) => {
        resolve(data);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  find() {
    return new Promise((resolve, reject) => {
      Db.find({
        name: this.name,
      }).then((data) => {
        debug(data);
        resolve(data);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  create() {
    debug(this);
    return new Promise((resolve, reject) => {
      Db.create(this).then((data) => {
        resolve(data);
      }).catch((error) => {
        reject(error);
      });
    });
  }
}

module.exports = Legislation;
