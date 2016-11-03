const express = require('express');
const LegislationController = require('./controllers/LegislationController');

const routerClass = express.Router;
const router = routerClass();

// =========================
// Routes
// =========================
module.exports = function route(app) {
  router.post('/:type', LegislationController.create);
  // Get all legislation data
  router.get('/', LegislationController.find);

  router.get('/:type', LegislationController.findByLegislationType);

  // Set url for API group routes
  app.use('/v1', router);
};
