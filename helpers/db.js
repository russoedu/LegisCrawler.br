const MongoClient = require('mongodb').MongoClient;
const config = require('../config/config');
const logger = require('../helpers/logger');
const colors = require('colors');

function connect() {
  return new Promise((resolve, reject) => {
    MongoClient.connect(config.db.url, (connectionErr, db) => {
      if (connectionErr) {
        logger.error(colors.red('DB connection'));
        reject(connectionErr);
      } else {
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
            resolve(data);
          })
        .catch((error) => {
          reject(error);
        });
        }).catch((error) => {
          reject(error);
        });
    });
  }

  static find(query) {
    return new Promise((resolve, reject) => {
      connect().then((db) => {
        db.collection('legislations').find(query).toArray().then((data) => {
          db.close();
          resolve(data);
        })
      .catch((error) => {
        reject(error);
      });
      }).catch((error) => {
        reject(error);
      });
    });
  }
};
