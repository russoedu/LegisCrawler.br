const log = require('better-log').setConfig({
  depth: 8,
});
const chalk = require('chalk');

module.exports = function error(type, message, data) {
  log.error(chalk.red(`⛔️   [ERROR] ${type}: ${message}`));
  log.error(chalk.red('#### error message start ####'));
  log.error(data);
  log.error(chalk.red('#### error message end ######'));
  // process.exit();
};
