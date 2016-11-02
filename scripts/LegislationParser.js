const logger = require('../helpers/logger');
// const colors = require('colors');

class LegislationParser {
  static parseLegislationText(legislationText) {
    return new Promise((resolve, reject) => {
      // logger.debug(legislationText);
      if (legislationText) {
        resolve(true);
      } else {
        reject(true);
      }
    });
  }
}

module.exports = LegislationParser;
