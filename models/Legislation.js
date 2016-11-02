const Db = require('../helpers/Db');

class Legislation {
  constructor(
      legislationType = null,
      legislationUrl = null,
      legislationData = null) {
    this.legislationType = legislationType;
    this.legislationUrl = legislationUrl;
    this.legislationData = legislationData;
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
      Db.find({ legislationType: this.legislationType }).then((data) => {
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
