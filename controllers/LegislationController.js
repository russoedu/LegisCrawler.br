const Legislation = require('../models/Legislation.js');
const debug = require('debug')('api');
const error = require('../helpers/error');

class LegislationController {
  static list(req, res) {
    debug('LegislationController.find()');
    Legislation.list()
      .then((response) => {
        debug(response);
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
