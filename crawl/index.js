const config = require('../config/config');
const log = require('../helpers/log');
const error = require('../helpers/error');
const chalk = require('chalk');
const debug = require('debug')('index');
const Legislation = require('../models/Legislation');
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
  log(chalk.yellow(`🌐   [START] Scrap ${legislation.type}`));

  Scraper
    .scrapPage(legislation)
    .then((scrapedLegislation) => {
      const cleanText = Cleaner.cleanText(scrapedLegislation);
      // debug(cleanText);
      log(chalk.green(`✅  [FINISH] Scrap ${legislation.type}`));
      return cleanText;
    })
    .then((cleanText) => {
      log(chalk.yellow(`✂️   [START] Parse ${legislation.type}`));
      // debug(chalk.blue(cleanText));
      const parsedText = Parser.getArticles(cleanText);
      debug(parsedText);
      log(chalk.green(`✅  [FINISH] Parse ${legislation.type}`));
      return parsedText;
    })
    // .then((parsedText) => {
    //
    // })
    // Save organized legislation
    .then((parsedText) => {
      log(chalk.green(`👍  [FINISH] ${legislation.type}`));
      finished += 1;
      const legis = new Legislation(
          legislation.type,
          legislation.url,
          parsedText
        );

      legis.create();
      if (quantity === finished) {
        log(chalk.bold.cyan('✨  [FINISH] All legislations captured and organized ✨  '));
      }
    })
    .catch((err) => {
      error('Could not reach legislation', err);
    });
});
