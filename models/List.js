const debug = require('debug')('list');
const Db = require('../helpers/Db');
const error = require('../helpers/error');

const collection = 'list';
class List {
  /**
   * Save the category in the DB
   * @method save
   */
  static save(list) {
    debug(list);
    return new Promise((resolve, reject) => {
      // list.date = new Date().toLocaleString('pt-BR', {
      //   timeZone: 'America/Sao_Paulo',
      // });
      Db.createOrUpdate(collection, list)
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

  static list() {
    return Db.find(
      collection,
      {
        _id: '',
        name: '',
        url: '',
        type: '',
        slug: '',
      }
    );
  }
  static count() {
    return Db.count(collection);
  }
}

module.exports = List;
