const express = require('express');
const LegislationController = require('./controllers/LegislationController');

const routerClass = express.Router;
const router = routerClass();

// =========================
// Routes
// =========================
module.exports = function route(app) {
  router.post('/:legislationType', LegislationController.createLegislation);
  // Get all legislation data
  router.get('/', LegislationController.getCompleteLegislation);

  router.get('/:legislationType', LegislationController.getLegislationType);

  // Set url for API group routes
  app.use('/v1', router);
};
