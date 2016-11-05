/* eslint no-restricted-modules: [0]  */
const fs = require('fs');
const chalk = require('chalk');
const log = require('../helpers/log');
const error = require('../helpers/error');

const env = process.env.LEGISCRAP_ENVIRONMENT;


/**
 * Get the configuration
 * @return {JSON} The configuration JSON
 */
function getConfig() {
  const confFile = `./config/${env}.json`;
  let config = {};

  log(chalk.yellow(`[config.environment] ${env}`));

  try {
    config = JSON.parse(fs.readFileSync(confFile, 'utf8'));
    config.env = env;
  } catch (err) {
    error(`Could not read config file from environment ${env}`, err);
    return {};
  }

  log(chalk.green('[conf.readConfig]', `config ${env} found`));

  return config;
}

module.exports = getConfig();
