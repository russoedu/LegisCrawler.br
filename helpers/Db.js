const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const config = require('../config/config');
const error = require('../helpers/error');
const debug = require('debug')('db');

const FILE = 'file';
const MONGO = 'mongo';
const publicFolder = `${__dirname}/../public/v1`;

function connect() {
  return new Promise((resolve, reject) => {
    MongoClient.connect(config.db.url, (connectionErr, db) => {
      if (connectionErr) {
        error('DB', 'Connection could not be established', connectionErr);
        reject(connectionErr);
      } else {
        debug(db);
        resolve(db);
      }
    });
  });
}

function createFile(data, name) {
  return new Promise((resolve, reject) => {
    const file = name;
    debug(data);
    fs.writeFile(`${publicFolder}/${file}.json`, JSON.stringify(data), (err) => {
      if (err) {
        error('DB', 'File could not be saved', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function createMongo(data) {
  return new Promise((resolve, reject) => {
    connect()
      .then((db) => {
        db.collection('legislations').insertOne(data).then((result) => {
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


module.exports = class Db {
  static create(data, name = null) {
    return new Promise((resolve, reject) => {
      let func = {};
      if (config.db.type === FILE) {
        func = createFile;
      } else if (config.db.type === MONGO) {
        func = createMongo;
      } else {
        reject('No db defined');
      }
      func(data, name)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  static find(query) {
    return new Promise((resolve, reject) => {
      if (config.db.type === FILE) {
        // Verify if a specific file was requested
        if (Object.keys(query).length === 0) {
          // Check if the complete file exists
          if (fs.existsSync(`${publicFolder}/complete.json`)) {
            debug('complete exists');
            resolve('complete.json');
          } else {
            debug('complete don\'t exists');
            // Create and serve the complete file
            fs.readdir(publicFolder, (err, files) => {
              if (err) {
                error('DB', 'Could not read folder', err);
                reject(err);
              }
              const resp = [];
              // Read the public folder and join all existing .json files
              files.forEach((fileName) => {
                const file = `${publicFolder}/${fileName}`;
                const jsonRegEx = /\.json/;
                debug(`${file}  ${file.match(jsonRegEx)}`);
                if (file.match(jsonRegEx) !== null) {
                  resp.push(JSON.parse(fs.readFileSync(file)));
                }
                // debug(JSON.parse(fs.readFileSync(file)));
                debug(resp.length);
              });
              // Create the complete.json file
              fs.writeFile(`${publicFolder}/complete.json`, JSON.stringify(resp), (writeErr) => {
                if (writeErr) {
                  error('DB', 'Could not save complete file', writeErr);
                } else {
                  resolve('complete.json');
                }
              });
            });
          }
        } else if (fs.existsSync(`${publicFolder}/${query.type}.json`)) {
          resolve(`${query.type}.json`);
        } else {
          error('DB', 'Could not read file', `${query.type} not found on server`);
          reject({ error: `${query.type} could not be found` });
        }
      } else if (config.db.type === MONGO) {
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
          error('DB', 'Could not retrieve data', err);
          reject(err);
        });
        }).catch((err) => {
          error('DB', 'Could not stablish DB connection', err);
          reject(err);
        });
      } else {
        error('DB', 'No DB defined', config.db.type);
        reject('No db defined');
      }
    });
  }
};
