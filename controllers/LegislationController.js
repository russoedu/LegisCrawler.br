const Legislation = require('../models/Legislation.js');
const debug = require('debug')('api');
const error = require('../helpers/error');
const log = require('../helpers/log');

const pvt = {
  readData(req) {
    let hasSlug = false;
    debug(req);
    const base = '_parsedUrl';
    const path = req[base].pathname;
    const data = path.split('/');

    let parent = '';
    let slug = /./;

    data.forEach((value, key) => {
      if (value === 'l') {
        slug = data[key + 1];
        hasSlug = true;
      } else if (!hasSlug && value !== '') {
        parent += `/${value}`;
      }
    });

    if (parent === '') {
      parent = '/';
    }

    const response = {
      search: {
        parent,
      },
      hasSlug,
    };

    if (pvt.hasSlug) {
      response.search.slug = slug;
    }

    debug(response);
    return response;
  },
};

class LegislationController {
  static list(req, res) {
    debug('LegislationController.find()');

    const readData = pvt.readData(req);
    const search = readData.search;
    const hasSlug = readData.hasSlug;

    if (req.query.search) {
      search.type = 'LEGISLATION';
      search.content = new RegExp(`.${req.query.search}.`, 'img');
    }
    log(search);

    let resultData = {};

    if (!hasSlug) {
      resultData = {
        _id: '',
        name: '',
        url: '',
        type: '',
        slug: '',
        parent: '',
      };
    }
    Legislation.list(search, resultData)
      .then((response) => {
        if (!hasSlug) {
          response.forEach((data) => {
            const leg = data;
            delete leg.content;
          });
        }
        res.status(200).send(response);
      })
      .catch((err) => {
        error(req.params.name, 'Could not retrieve data', err);
        res.status(400).json(err);
      });
  }
}

module.exports = LegislationController;
