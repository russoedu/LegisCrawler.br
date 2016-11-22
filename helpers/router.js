const express = require('express');
const LegislationController = require('../controllers/LegislationController');

const routerClass = express.Router;
const router = routerClass();

// =========================
// Routes
// =========================
module.exports = function route(app) {
  // Get the list of legislations
  router.get('/', LegislationController.list);

  // Get a legislation
  router.get('/:name', LegislationController.find);

  // Set url for API group routes
  app
    .use('/v1', router);
};
