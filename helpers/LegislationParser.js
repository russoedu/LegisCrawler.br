const logger = require('../helpers/logger');
const colors = require('colors');

const articleDefRegEx = / ?(Art.) [0-9]+([o|º|º|o.])? ?(-|\.)( |[A-Z]+\. )?/;

class LegislationParser {
  constructor(text) {
    this.text = text;
  }
  getTextContent() {
    logger.info(colors.blue(this.text));

    let parsedArticleTitle = articleDefRegEx.exec(this.text);
    parsedArticleTitle = parsedArticleTitle[0];

    // logger.debug(colors.yellow(parsedArticleTitle));

    let textTest = this.text.split(parsedArticleTitle);
    textTest = textTest[1];
    logger.debug(`${colors.yellow(parsedArticleTitle)} => ${textTest}`);
  }
}

module.exports = LegislationParser;
