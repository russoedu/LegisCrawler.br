const config = require('../config/config');
const log = require('../helpers/log');
const error = require('../helpers/error');
const chalk = require('chalk');
const debug = require('debug')('index');
// const Legislation = require('../models/Legislation');
const Scraper = require('./Scraper');
const Cleaner = require('./Cleaner');
const Parser = require('./Parser');

const legislations = config.legislations;
const quantity = legislations.length;
let finished = 0;

const plural = legislations.length === 1 ? '' : 's';
log(chalk.blue(`🔍   [START] ${quantity} legislation${plural} to capture and organize`));

legislations.forEach((legislation) => {
  log(chalk.yellow(`🚚   [START] ${legislation.type}`));

  Scraper
    .scrapPage(legislation)
    .then((scrapedLegislation) => {
      const cleanText = Cleaner.cleanText(scrapedLegislation);
      return cleanText;
    })
    .then((cleanText) => {
      // debug(chalk.blue(cleanText));
      const parsedText = Parser.getArticles(cleanText);
      debug(parsedText);
    })
    // Save organized legislation
    .then(() => {
      log(chalk.green(`👍  [FINISH] ${legislation.type}`));
      finished += 1;
      // const legis = new Legislation(
      //     scrapedLegislation.type,
      //     scrapedLegislation.url,
      //     scrapedLegislation.data
      //   );
      //
      // legis.create();
      if (quantity === finished) {
        log(chalk.bold.cyan('✨  [FINISH] All legislations captured and organized ✨  '));
      }
    })
    .catch((err) => {
      error('Could not reach legislation', err);
    });
});
