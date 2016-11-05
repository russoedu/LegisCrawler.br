const MongoClient = require('mongodb').MongoClient;
const config = require('../config/config');
const error = require('../helpers/error');
const debug = require('debug')('DB');

function connect() {
  return new Promise((resolve, reject) => {
    MongoClient.connect(config.db.url, (connectionErr, db) => {
      if (connectionErr) {
        error('DB connection could not be established', connectionErr);
        reject(connectionErr);
      } else {
        debug(db);
        resolve(db);
      }
    });
  });
}

module.exports = class Db {
  static create(item) {
    return new Promise((resolve, reject) => {
      connect()
        .then((db) => {
          db.collection('legislations').insertOne(item).then((data) => {
            db.close();
            debug(data);
            resolve(data);
          })
        .catch((err) => {
          error('error inserting data on DB', err);
          reject(err);
        });
        }).catch((err) => {
          reject(err);
        });
    });
  }

  static find(query) {
    return new Promise((resolve, reject) => {
      connect().then((db) => {
        db.collection('legislations').find(query).toArray().then((data) => {
          db.close();
          debug(data);
          resolve(data);
        })
      .catch((err) => {
        error('error retrieving data from DB', err);
        reject(err);
      });
      }).catch((err) => {
        reject(err);
      });
    });
  }
};
