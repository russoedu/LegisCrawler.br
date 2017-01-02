const log = require('../helpers/log');
const chalk = require('chalk');

function spaces(name) {
  const rest = 80 - name.length;
  let response = '';
  for (let i = 0; i < rest; i += 1) {
    response += ' ';
  }
  return response;
}
function getProcessIcon(process = null) {
  let icon = '';
  switch (process) {
    case 'Scrap':
      icon = '🌐';
      break;
    case 'Clean':
      icon = '🛁';
      break;
    case 'Parse':
      icon = '✂️';
      break;
    case 'Structure':
      icon = '🖇';
      break;
    case 'Save':
      icon = '🗄';
      break;
    default:
      icon = '🚚';
  }
  return icon;
}
class Status {
  constructor(legislationName) {
    this.legislationName = legislationName;
  }

  static startAll(quantity) {
    const plural = quantity === 1 ? '' : 's';
    log(chalk.blue(`🔍   [START] ${quantity} legislation${plural} to capture and organize`));
  }

  startProcess(process = null) {
    this.process = process;
    const processIcon = getProcessIcon(this.process);
    log(chalk.yellow(`${processIcon}   [START] ${this.process} ${this.legislationName}`));
  }
  startProcessComplete() {
    const processIcon = getProcessIcon(this.process);
    const spcs = spaces(this.legislationName);
    log(chalk.black.bgYellow(`${processIcon}   [START] ${this.legislationName}${spcs}`));
  }

  finishProcess() {
    log(chalk.green(`✅  [FINISH] ${this.process} ${this.legislationName}`));
  }

  finishProcessComplete() {
    const spcs = spaces(this.legislationName);
    log(chalk.black.bgGreen.bold(`👍  [FINISH] ${this.legislationName}${spcs}`));
  }
  // static startProcess

  static finishAll() {
    log('');
    log('✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ' +
      '✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨');
    log('✨                                                              ' +
      '                           ✨');
    log('✨                                                              ' +
      '                           ✨');
    log(chalk.bold.cyan('✨                     [FINISH] All legislations' +
      ' captured and organized                    ✨'));
    log('✨                                                              ' +
      '                           ✨');
    log('✨                                                              ' +
      '                           ✨');
    log('✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ' +
      '✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨');
    log('');
  }
}

module.exports = Status;
