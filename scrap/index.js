const config = require('../config/config');
const log = require('../helpers/log');
const debug = require('debug')('scrap');
const error = require('../helpers/error');
const chalk = require('chalk');
const Legislation = require('../models/Legislation');
const LegislationGetter = require('./LegislationGetter');

const legislations = config.legislations;

log(chalk.blue(`[START] ${legislations.length} legislations to scrap`));
legislations.forEach((legislation) => {
  log(chalk.yellow(`[START] ${legislation.type}`));

  LegislationGetter.getLegislationText(legislation)
    .then((gottenLegislation) => {
      debug(gottenLegislation);
      log(chalk.green(`[END] ${gottenLegislation.type}`));

      const legis = new Legislation(
          gottenLegislation.type,
          gottenLegislation.url,
          gottenLegislation.data
        );

      legis.create();
    })
    .catch((err) => {
      error('Could not reach legislation', err);
    });
});
