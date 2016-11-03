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
    .then((responses) => {
      const responseData = [];
      responses.forEach((response) => {
        responseData.push({
          type: response.type,
          url: response.url,
          data: response.data,
        });
      });
      res.status(200).send(responseData);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
  }

  static findByLegislationType(req, res) {
    const legislation = new Legislation(req.params.type);
    legislation.findByLegislationType()
      .then((response) => {
        const responseData = {
          type: response[0].type,
          url: response[0].url,
          data: response[0].data,
        };
        res.status(200).send(responseData);
      })
      .catch((error) => {
        res.status(500).json(error);
      });
  }
}

module.exports = LegislationController;
