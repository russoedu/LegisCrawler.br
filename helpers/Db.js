const mongo = require('mongodb');
const config = require('../config/config');
const error = require('../helpers/error');
const Order = require('../helpers/Order');
const debug = require('debug')('db');

function connect() {
  const MongoClient = new mongo.MongoClient();
  return new Promise((resolve, reject) => {
    MongoClient.connect(config.db.url, (connectionErr, db) => {
      if (connectionErr) {
        error('DB', 'Connection could not be established', connectionErr);
        reject(connectionErr);
      } else {
        // debug(db);
        resolve(db);
      }
    });
  });
}

class Db {
  static createOrUpdate(collection, data) {
    return new Promise((resolve, reject) => {
      connect()
        .then((db) => {
          const query = {
            name: data.name,
            level: data.level,
            parent: data.parent,
          };
          const options = {
            upsert: true,
            returnNewDocument: true,
          };

          db.collection(collection).findOneAndUpdate(
            query,
            data,
            options
          )
            .then((result) => {
              debug(result);
              db.close();

              resolve(result);
            })
            .catch((err) => {
              error('DB', 'error inserting data', err);
              reject(err);
              db.close();
            });
        }).catch((err) => {
          reject(err);
        });
    });
  }

  static find(collection, filter, id = false) {
    return new Promise((resolve, reject) => {
      const idObj = id ? new mongo.ObjectID(id) : {};
      connect().then((db) => {
        db.collection(collection)
          .find(
            idObj,
            filter
        )
          .toArray()
          .then((result) => {
            debug(result);
            db.close();

            if (result.length === 1) {
              resolve(result[0]);
            } else {
              resolve(result.sort(Order.portuguese));
            }
          });
      })
        .catch((err) => {
          error(err);
          reject(err);
        });
    });
  }
}

module.exports = Db;
