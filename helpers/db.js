const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const config = require('../config/config');
const error = require('../helpers/error');
const debug = require('debug')('DB');

const FILE = 'file';
const MONGO = 'mongo';
const publicFolder = `${__dirname}/../public`;

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
  static create(item, dbType = FILE) {
    return new Promise((resolve, reject) => {
      if (dbType === FILE) {
        const file = item.type;
        fs.writeFile(`${publicFolder}/${file}.json`, JSON.stringify(item), (err) => {
          if (err) {
            error('Error saving file', err);
            reject(err);
          } else {
            resolve();
          }
        });
      } else if (dbType === MONGO) {
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
      } else {
        reject('No db defined');
      }
    });
  }

  static find(query, dbType) {
    return new Promise((resolve, reject) => {
      if (dbType === FILE) {
        if (query.type === undefined) {
          fs.readFile(`${publicFolder}/complete.json`, (completeErr, data) => {
            if (completeErr) {
              error('complete file not found', completeErr);

              fs.readdir(publicFolder, (err, files) => {
                if (err) {
                  error('error reading folder', err);
                  reject(err);
                }
                const resp = [];
                files.forEach((fileName) => {
                  const file = `${publicFolder}/${fileName}`;
                  const jsonRegEx = /\.json/;
                  debug(`${file}  ${file.match(jsonRegEx)}`);
                  if (file.match(jsonRegEx) !== null) {
                    resp.push(JSON.parse(fs.readFileSync(file)));
                  }
                  debug(resp.length);
                });
                debug(`=>>>>>>>>>>>>>>>>>>${resp.length}`);
                // debug(resp);
                fs.writeFile(`${publicFolder}/complete.json`, JSON.stringify(resp), (writeErr) => {
                  if (writeErr) {
                    error('Error saving complete file', writeErr);
                  }
                });
                resolve(resp);
              });
            } else {
              debug(JSON.parse(data));
              resolve(JSON.parse(data));
            }
          });
        } else {
          debug(`${publicFolder}/${query.type}.json`);
          fs.readFile(`${publicFolder}/${query.type}.json`, (err, data) => {
            if (err) {
              error('error reading file', err);
              reject(err);
            }
            debug(JSON.stringify(JSON.parse(data)));
            resolve(JSON.parse(data));
          });
        }
      } else if (dbType === MONGO) {
        connect().then((db) => {
          db.collection('legislations').find(query).toArray().then((data) => {
            db.close();
            debug(data);
            const responseData = [];
            data.forEach((response) => {
              debug(response);
              responseData.push({
                type: response.type,
                url: response.url,
                data: response.data,
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
          error('error retrieving data from DB', err);
          reject(err);
        });
        }).catch((err) => {
          reject(err);
        });
      } else {
        reject('No db defined');
      }
    });
  }
};
