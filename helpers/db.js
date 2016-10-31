const MongoClient = require('mongodb').MongoClient;
const config = require('../config/config');
const colors = require('colors');

function connect() {
  return new Promise((resolve, reject) => {
    MongoClient.connect(config.db.url, (connectionErr, db) => {
      if (connectionErr) {
        console.error(colors.red('Error connecting to DB'));
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
