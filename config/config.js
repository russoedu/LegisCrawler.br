/* eslint no-restricted-modules: [0]  */
const fs = require('fs');
const colors = require('colors');
const winston = require('winston');


const env = process.env.LEGISCRAP_ENVIRONMENT;

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
  ],
});
/**
 * Get the configuration
 * @return {JSON} The configuration JSON
 */
function getConfig() {
  const confFile = `./config/${env}.json`;
  let config = {};

  logger.info(colors.yellow(`[config.environment] ${env}`));

  try {
    config = JSON.parse(fs.readFileSync(confFile, 'utf8'));
    config.env = env;
  } catch (e) {
    logger.error(colors.red(`ERROR: [conf.readConfig] ${env} ${e}`));
    return {};
  }

  logger.info(colors.green('[conf.readConfig]', `config ${env} found`));

  return config;
}

module.exports = getConfig();
