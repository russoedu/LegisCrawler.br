const Db = require('../helpers/Db');
const debug = require('debug')('DB');
const config = require('../config/config');

class Legislation {
  constructor(
      type = null,
      url = null,
      data = null) {
    this.type = type;
    this.url = url;
    this.data = data;
    this.date = new Date();
  }

  static find() {
    return new Promise((resolve, reject) => {
      Db.find({}, config.db.type).then((data) => {
        resolve(data);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  findByLegislationType() {
    return new Promise((resolve, reject) => {
      Db.find({ type: this.type }, config.db.type).then((data) => {
        debug(data);
        resolve(data);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  create() {
    return new Promise((resolve, reject) => {
      Db.create(this, config.db.type).then((data) => {
        resolve(data);
      }).catch((error) => {
        reject(error);
      });
    });
  }
}

module.exports = Legislation;
