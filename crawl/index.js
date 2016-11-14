const config = require('../config/config');
const log = require('../helpers/log');
const error = require('../helpers/error');
const finish = require('../helpers/finish');
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
      debug('cleanText', chalk.blue(scrapedLegislation));
      const cleanText = Cleaner.cleanText(scrapedLegislation);
      debug('cleanText', chalk.red(cleanText));
      log(chalk.green(`✅  [FINISH] Scrap ${legislation.type}`));
      return cleanText;
    })
    .then((cleanText) => {
      log(chalk.yellow(`✂️   [START] Parse ${legislation.type}`));
      // debug(chalk.blue(cleanText));
      const parsedText = Parser.getArticles(cleanText);
      // debug(parsedText);
      log(chalk.green(`✅  [FINISH] Parse ${legislation.type}`));
      return parsedText;
    })
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
      finish(quantity, finished);
    })
    .catch((err) => {
      error(legislation.type, 'Could not reach legislation', err);
    });
});
