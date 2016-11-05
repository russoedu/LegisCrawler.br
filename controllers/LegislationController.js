const Legislation = require('../models/Legislation.js');
const debug = require('debug')('api');
const error = require('../helpers/error');

class LegislationController {
  static find(req, res) {
    debug('LegislationController.find');
    Legislation.find()
    .then((responses) => {
      const responseData = [];
      responses.forEach((response) => {
        responseData.push({
          type: response.type,
          url: response.url,
          data: response.data,
        });
      });
      debug(responseData);
      res.status(200).send(responseData);
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
        const responseData = {
          type: response[0].type,
          url: response[0].url,
          data: response[0].data,
        };
        debug(responseData);
        res.status(200).send(responseData);
      })
      .catch((err) => {
        error(`Could not retrieve ${req.params.type} data`, err);
        res.status(500).json(err);
      });
  }
}

module.exports = LegislationController;
