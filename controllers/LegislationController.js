const Legislation = require('../models/Legislation.js');

class LegislationController {
  static create(req, res) {
    if (req.get('Content-Type') === 'application/json') {
      const legislation = new Legislation(req.params.legislationType, req.body);
      legislation.create()
        .then((response) => {
          res.status(200).json(response);
        })
        .catch((error) => {
          res.status(500).json(error);
        });
    } else {
      res.status(400).json({ error: 'Content must be a Json' });
    }
  }

  static find(req, res) {
    Legislation.find()
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((error) => {
        res.status(500).json(error);
      });
  }

  static findByLegislationType(req, res) {
    const legislation = new Legislation(req.params.legislationType);
    legislation.findByLegislationType()
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((error) => {
        res.status(500).json(error);
      });
  }
}

module.exports = LegislationController;
