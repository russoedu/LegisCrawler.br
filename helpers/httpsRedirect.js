const config = require('../config/config');
const debug = require('debug')('https');

module.exports = function requireHTTPS(req, res, next) {
  if (!req.secure) {
    debug('insecure access redirect');
    return res.redirect(`https://legiscrawler.com.br:${config.server.sslPort}${req.url}`);
  }
  next();
  return 0;
};
