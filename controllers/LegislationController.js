const Legislation = require('../models/Legislation.js');
const debug = require('debug')('api');
const error = require('../helpers/error');

class LegislationController {
  static find(req, res) {
    debug('LegislationController.find');
    Legislation.find()
    .then((response) => {
      debug(typeof response);
      res.status(200).send(response);
    })
    .catch((err) => {
      error(`Could not retrieve ${req.params.type} data`, err);
      res.status(500).json(err);
    });
  }

  static findByLegislationType(req, res) {
    debug(`LegislationController.findByLegislationType(${req.params.type})`);
    const legislation = new Legislation(req.params.type);
    legislation.findByLegislationType()
      .then((response) => {
        debug(response);
        res.status(200).send(response);
      })
      .catch((err) => {
        error(`Could not retrieve ${req.params.type} data`, err);
        res.status(500).json(err);
      });
  }
}

module.exports = LegislationController;
