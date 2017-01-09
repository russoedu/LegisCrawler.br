const Db = require('../helpers/Db');
const debug = require('debug')('model');
const error = require('../helpers/error');

const collection = 'legislations';
const listCollection = 'list';

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

  static list() {
    return Db.find(
      listCollection,
      {
        _id: '',
        name: '',
        url: '',
        type: '',
        slug: '',
      }
    );
  }

  static listSave(list) {
    debug(list);
    return new Promise((resolve, reject) => {
      Db.createOrUpdate(listCollection, list)
        .then((res) => {
          if (res.value && res.value._id) {
            this._id = res.value._id;
          }
          debug(this);
          resolve(this);
        })
        .catch((err) => {
          error('List', 'createOrUpdate', err);
          reject(err);
        });
    });
  }

  static listCount() {
    return Db.count(collection);
  }
}

module.exports = Legislation;
