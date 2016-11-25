const MongoClient = require('mongodb').MongoClient;
const config = require('../config/config');
const error = require('../helpers/error');
const debug = require('debug')('db');

const sortPortuguese = function sortPortuguese(a, b) {
  debug(a.name);
  debug(b.name);
  return a.name.localeCompare(b.name);
};

function connect() {
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

module.exports = class Db {
  static create(data) {
    return new Promise((resolve, reject) => {
      connect()
        .then((db) => {
          const query = {
            name: data.name,
          };
          const options = {
            upsert: true,
            returnNewDocument: true,
          };

          db.collection('legislations').findOneAndUpdate(
            query,
            data,
            options
          ).then((result) => {
            db.close();
            debug(result);
            resolve(result);
          })
            .catch((err) => {
              error('DB', 'error inserting data', err);
              reject(err);
            });
        }).catch((err) => {
          reject(err);
        });
    });
  }

  static list() {
    return new Promise((resolve, reject) => {
      connect().then((db) => {
        db.collection('legislations')
          .find({}, {
            name: '',
            link: '',
            category: '',
          })
          .toArray()
          .then((data) => {
            debug(data);
            db.close();
            const responseData = [];
            data.forEach((response) => {
              debug(response);
              responseData.push({
                name: response.name,
                link: response.link,
                category: response.category,
              });
            });

            resolve(responseData.sort(sortPortuguese));
          });
      })
        .catch((err) => {
          error(err);
          reject(err);
        });
    });
  }

  static find(query) {
    debug(query);
    return new Promise((resolve, reject) => {
      connect().then((db) => {
        db.collection('legislations').find(query).toArray().then((data) => {
          db.close();
          debug(data);
          const responseData = [];
          data.forEach((response) => {
            debug(response);
            responseData.push({
              category: response.category,
              link: response.link,
              name: response.name,
              url: response.url,
              articles: response.articles,
              date: response.date,
            });
          });
          if (responseData.length === 1) {
            resolve(responseData[0]);
          } else {
            resolve(responseData);
          }
        })
          .catch((err) => {
            error('DB', 'Could not retrieve data', err);
            reject(err);
          });
      }).catch((err) => {
        error('DB', 'Could not stablish DB connection', err);
        reject(err);
      });
    });
  }
}
;
