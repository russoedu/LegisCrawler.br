const db = require('../helpers/db');
const colors = require('colors');

class Legislation {
  constructor(legislationName = null, legislationData = null) {
    this.legislationName = legislationName;
    this.legislationData = legislationData;
  }

  getAllLegislations(callback) {
    callback(this.Model.find({}));
  }

  getLegislationByName(callback) {
    db.getDocument(this.legislationName, callback);
  }

  createLegislation(callback) {
    db.insertDocument(this, callback);
  }
}

module.exports = Legislation;
