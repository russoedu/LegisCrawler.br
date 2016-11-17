const express = require('express');
const LegislationController = require('./controllers/LegislationController');
const httpsRedirect = require('./helpers/httpsRedirect');

const routerClass = express.Router;
const router = routerClass();

// =========================
// Routes
// =========================
module.exports = function route(app) {
  // Set url for API group routes
  app
  .use(httpsRedirect)
  .use('/v1', router);

  // Get all legislation data
  router.get('/', LegislationController.find);

  router.get('/:type', LegislationController.findByLegislationType);
};
