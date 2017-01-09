/* eslint no-restricted-modules: [0]  */
const fs = require('fs');
const log = require('../helpers/log');
const error = require('../helpers/error');

const env = process.env.LEGISCRAWLERBR_ENVIRONMENT;


/**
 * Get the configuration
 * @return {JSON} The configuration JSON
 */
function getConfig() {
  const confFile = `./config/${env}.json`;
  let config = {};

  try {
    config = JSON.parse(fs.readFileSync(confFile, 'utf8'));
    config.env = env;
  } catch (err) {
    error('Config', `Could not read config file from environment ${env}`, err);
    return {};
  }

  log(`⚙  [conf.readConfig]      config ${env} found`);

  return config;
}

module.exports = getConfig();
