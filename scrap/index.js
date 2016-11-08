const config = require('../config/config');
const log = require('../helpers/log');
const debug = require('debug')('scrap');
const error = require('../helpers/error');
const chalk = require('chalk');
// const Legislation = require('../models/Legislation');
const Scraper = require('./Scraper');

const legislations = config.legislations;
const quantity = legislations.length;
let scraped = 0;

const plural = legislations.length === 1 ? '' : 's';
log(chalk.blue(`🔍   [START] ${quantity} legislation${plural} to organize`));

legislations.forEach((legislation) => {
  log(chalk.yellow(`🚚   [START] ${legislation.type}`));

  Scraper.getLegislationText(legislation)
    .then((gottenLegislation) => {
      scraped += 1;
      debug(gottenLegislation);
      log(chalk.green(`👍  [FINISH] ${legislation.type}`));

      // const legis = new Legislation(
      //     gottenLegislation.type,
      //     gottenLegislation.url,
      //     gottenLegislation.data
      //   );
      //
      // legis.create();
      if (quantity === scraped) {
        log(chalk.bold.cyan('✨  [FINISH] All legislations organized 🏁 '));
      }
    })
    .catch((err) => {
      error('Could not reach legislation', err);
    });
});
