const Legislation = require('../models/Legislation.js');

class LegislationController {
  static createLegislation(req, res) {
    if (req.get('Content-Type') === 'application/json') {
      const legislation = new Legislation(req.params.legislationType, req.body);
      legislation.createLegislation((err, response) => {
        if (err) {
          res
            .status(500)
            .send(response);
        } else {
          res
            .status(200)
            .send(response);
        }
      });
    } else {
      res
        .status(400)
        .send({
          error: 'Content must be a Json',
        });
    }
  }

  static getCompleteLegislation(req, res) {
    Legislation.getAllLegislations((err, response) => {
      if (err) {
        res
          .status(500)
          .send(response);
      } else {
        res
          .status(200)
          .send(response);
      }
    });
  }

  static getLegislationType(req, res) {
    const legislation = new Legislation(req.params.legislationType);
    legislation.getLegislationByName((err, response) => {
      if (err) {
        res
          .status(500)
          .send(response);
      } else {
        res
          .status(200)
          .send(response);
      }
    });
  }
}

module.exports = LegislationController;
