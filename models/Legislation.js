const Db = require('../helpers/Db');
const debug = require('debug')('model');
const slug = require('slug');

const error = require('../helpers/error');

const collection = 'legislations';
const listCollection = 'legislationsList';

class Legislation {
  constructor(name = null, url = null, type = null, crawl = null) {
    if (typeof name === 'object') {
      Object.keys(name).forEach((key) => {
        if (key === 'type' || key === 'crawl') {
          this[key] = name[key].name;
        } else {
          this[key] = name[key];
        }
      });
      this.slug = name.slug || slug(this.name.replace(/\./g, '-', '-'), { lower: true });
      debug(this.slug);
    } else {
      this.name = name;
      this.slug = slug(this.name.replace(/\./g, '-', '-'), { lower: true });
      debug(this.slug);
      this.url = url;
      this.type = type.name || type;
      this.crawl = crawl.name || crawl;
    }
    // debug(this);
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
    return Db.list(
      listCollection,
      { type: 'LEGISLATION', crawl: 'ART' }
    );
  }

  static listFind(id) {
    return Db.find(
      listCollection,
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

  static listSave(list) {
    debug(list);
    return new Promise((resolve, reject) =>
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
        })
    );
  }

  static listCount() {
    return Db.count(listCollection, { type: 'LEGISLATION', crawl: 'ART' });
  }
}

module.exports = Legislation;
