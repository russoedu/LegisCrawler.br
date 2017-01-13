const Legislation = require('../models/Legislation.js');
const debug = require('debug')('api');
const error = require('../helpers/error');

const pvt = {
  hasSlug: false,

  search(req) {
    const base = '_parsedUrl';
    const path = req[base].pathname;
    const data = path.split('/');
    data.splice(0, 1);

    if (data[data.length - 1] === '') {
      data.splice(data.length - 1, 1);
    }

    let parent = '';
    let slug = /./;

    data.forEach((value, key) => {
      if (value === 'l') {
        slug = data[key + 1];
        pvt.hasSlug = true;
      } else if (!pvt.hasSlug) {
        parent += `/${value}`;
      }
    });

    if (parent === '') {
      parent = '/';
    }

    return { parent, slug };
  }
};

class LegislationController {
  static list(req, res) {
    debug('LegislationController.find()');

    const search = pvt.search(req);

    Legislation.list(search)
      .then((response) => {
        debug(response);
        if (!pvt.hasSlug) {
          response.forEach((data) => {
            const leg = data;
            if (data.type === 'LEGISLATION') {
              delete leg.content;
            }
          });
        }
        res.status(200).send(response);
      })
      .catch((err) => {
        error(req.params.name, 'Could not retrieve data', err);
        res.status(400).json(err);
      });
  }

  static find(req, res) {
    debug(`LegislationController.find(${req.params.id})`);
    Legislation.find(req.params.id)
      .then((response) => {
        debug(response);
        res.status(200).send(response);
      })
      .catch((err) => {
        error(req.params.name, 'Could not retrieve data', err);
        res.status(400).json(err);
      });
  }
}

module.exports = LegislationController;
