const MongoClient = require('mongodb').MongoClient;
const config = require('../config/config');
const colors = require('colors');

const connect = function connect(callback) {
  MongoClient.connect(config.db.url, (connectionErr, db) => {
    if (connectionErr) {
      console.log(colors.red('Error connecting to DB'));
      callback(true, connectionErr);
    } else {
      console.log(colors.green('Connected successfully to DB'));
      callback(false, db);
    }
  });
};

const insert = function insert(document, type, callback) {
  connect((connectionErr, response) => {
    if (connectionErr) {
      callback(true, response);
    } else {
      const db = response;
      const collection = db.collection('legislations');

      collection[type](
        document, (insertionErr, result) => {
          let err = true;
          let res = {};
          if (insertionErr) {
            console.log(colors.red('Error creating document'));
            err = true;
            res = insertionErr;
          } else {
            console.log(colors.green('Success creating document'));
            err = false;
            res = result;
          }
          db.close();
          callback(err, res);
        });
    }
  });
};

const retrieve = function retrieve(query, callback) {
  connect((connectionErr, response) => {
    if (connectionErr) {
      callback(true, response);
    } else {
      const db = response;
      const collection = db.collection('legislations');

      collection.find(query).toArray().then((docs) => {
        callback(false, docs);
        db.close();
      });
    }
  });
};

module.exports = {
  insertDocument(document, callback) {
    insert(document, 'insertOne', callback);
  },

  insertDocuments(document, callback) {
    insert(document, 'insertMany', callback);
  },

  getDocument(legislationType, callback) {
    retrieve({ legislationType }, callback);
  },

  getDocuments(callback) {
    retrieve({}, callback);
  },
};
