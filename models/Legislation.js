const Db = require('../helpers/Db');

class Legislation {
  constructor(
      type = null,
      url = null,
      data = null) {
    this.type = type;
    this.url = url;
    this.data = data;
  }

  static find() {
    return new Promise((resolve, reject) => {
      Db.find({}).then((data) => {
        resolve(data);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  findByLegislationType() {
    return new Promise((resolve, reject) => {
      Db.find({ type: this.type }).then((data) => {
        resolve(data);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  create() {
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
