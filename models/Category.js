const Db = require('../helpers/Db');
const debug = require('debug')('model');

const collection = 'categories';

/**
 * Category Model Class
 * @class Category
 * @module Models
 */
class Category {
  /**
   * Category constructor
   * @method constructor
   * @param {String} [name = null] - The category name
   * @param {String} [url = null] - The category url
   * @constructor
   */
  constructor(name = null, url = null, type = null) {
    if (typeof name === 'object') {
      Object.keys(name).forEach((key) => {
        if (key === 'type') {
          this[key] = name[key].name;
        } else {
          this[key] = name[key];
        }
      });
    } else {
      this.name = name;
      this.url = url;
      this.type = type.name | type;
    }
    this.date = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    });
  }

  /**
   * List all categories
   * @method list
   * @return {Array} Array with categories objects
   * @static
   */
  static list() {
    return Db.list(
      collection,
      {
        _id: '',
        name: '',
        url: '',
        date: '',
      }
    );
  }

  static findByLevel(level = 0) {
    return new Promise((resolve, reject) => {
      Db.find(
        collection,
        level
      ).then((category) => {
        resolve(category);
      })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Save the category in the DB
   * @method save
   */
  save() {
    Db.createOrUpdate(collection, this).then((res) => {
      if (res.value && res.value._id) {
        this._id = res.value._id;
      }
    });
  }
}


module.exports = Category;
