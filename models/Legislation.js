const Db = require('../helpers/Db');
const debug = require('debug')('model');
const slug = require('slug');

const error = require('../helpers/error');

const collection = 'legislations';

/**
 * Legislation model
 * @module Models
 * @class Legislation
 */
class Legislation {
  /**
   * Create a new Legislations
   * @constructor
   * @param {Object} legislation Object with legislations properties
   */
  constructor(legislation) {
    Object.keys(legislation).forEach((key) => {
      if (typeof legislation[key].name === 'undefined') {
        debug('direct', legislation[key]);
        this[key] = legislation[key];
      } else {
        debug('name', legislation[key].name);
        this[key] = legislation[key].name;
      }
    });
    this.slug = legislation.slug ||
                slug(this.name.replace(/\./g, '-', '-'), { lower: true });
    debug(this);
  }

  /**
   * Save the legislation on the DB and set the returned _id in it
   * @method save
   * @return {Promise} The Legislation object with the _id
   */
  save() {
    return new Promise((resolve, reject) =>
       Db.createOrUpdate(collection, this)
        .then((res) => {
          if (res.value && res.value._id) {
            this._id = res.value._id;
          }
          debug(this);
          resolve(this);
        })
        .catch((err) => {
          error('List', 'createOrUpdate', err);
          reject(err);
        })
    );
  }

  /**
   * Get all legislations of type 'LEGISLATION' and crawl 'ART', that are, in
   * fact, legislations
   * @method count
   * @static
   * @return {Number} The quantity of legislations
   */
  static count() {
    return Db.count(collection, { type: 'LEGISLATION', crawl: 'ART' });
  }

  /**
   * List all legislations within a search object
   * @method list
   * @static
   * @param {Object} Object with the search
   * @return {Promise} After completion, array of legislations that match the
   *                   search
   * @example
   * const search = {
   *   parent: '/leis-ordinarias/2005'
   * }
   * Legislation.list(search)
   *   .then((legislations) => {
   *     debug(legislations);
   *   });
   */
  static list(search, resultData) {
    return Db.list(collection, search, resultData);
  }
}

module.exports = Legislation;
