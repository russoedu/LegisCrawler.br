const Legislation = require('../models/Legislation.js');

module.exports = {
  createLegislation(req, res) {
    if (req.get('Content-Type') === 'application/json') {
      const legislation = new Legislation(req.params.legislationName, req.body);
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
  },
  getCompleteLegislation(req, res) {
    const legislation = new Legislation();
    legislation.getAllLegislations((response) => {
      console.log(response);
      res
        .status(200)
        .send(response);
    });
  },
  getLegislationType(req, res) {
    const legislation = new Legislation(req.params.legislationName);
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
  },
};

 // LegisController;
