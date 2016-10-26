const db = require('../helpers/db');

class Legislation {
  constructor(legislationType = null, legislationData = null) {
    this.legislationType = legislationType;
    this.legislationData = legislationData;
  }

  static getAllLegislations(callback) {
    db.getDocuments(callback);
  }

  getLegislationByName(callback) {
    db.getDocument(this.legislationType, callback);
  }

  createLegislation(callback) {
    db.insertDocument(this, callback);
  }
}

module.exports = Legislation;
