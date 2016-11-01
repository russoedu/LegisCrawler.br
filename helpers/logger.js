const winston = require('winston');
const config = require('../config/config');

const logger = new (winston.Logger)({
  level: config.logger.winston,
  transports: [
    new (winston.transports.Console)(),
  ],
});

module.exports = logger;
