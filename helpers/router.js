const express = require('express');
const LegislationController = require('../controllers/LegislationController');

const routerClass = express.Router;

// =========================
// Routes
// =========================
module.exports = function route(app) {
  const routerOptions = {
    // strict: true,
    mergeParams: true,
  };
  const router = routerClass(routerOptions);
  router.get('/', LegislationController.list);
  router.get('/*', LegislationController.list);

  // Set url for API group routes
  app
    .use('/v1', router);
};
