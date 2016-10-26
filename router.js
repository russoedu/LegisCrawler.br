const express = require('express');
const legislation = require('./controllers/legislation');

const routerClass = express.Router;
const router = routerClass();

// =========================
// Routes
// =========================
module.exports = function route(app) {
  router.post('/:legislationName', legislation.createLegislation);
  // Get all legislation data
  router.get('/', legislation.getCompleteLegislation);

  router.get('/:legislationName', legislation.getLegislationType);

  // Set url for API group routes
  app.use('/v1', router);
};
