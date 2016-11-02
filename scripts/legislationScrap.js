const config = require('../config/config');
const logger = require('../helpers/logger');
const Legislation = require('../models/Legislation');
const LegislationGetter = require('./LegislationGetter');
const LegislationParser = require('./LegislationParser');
const colors = require('colors');

const legislations = config.legislations;

logger.info(colors.blue('Legislation Scrap start'));
legislations.forEach((legislation) => {
  logger.info(colors.yellow(`Getting text from ${legislation.type}`));
  LegislationGetter.getLegislationText(legislation)
    .then((getLegislation) => {
      logger.debug(colors.green(getLegislation.legislationUrl));
      const legis = new Legislation(
        getLegislation.legislationType,
        getLegislation.legislationUrl,
        getLegislation.legislationData
      );
      legis
        .create()
        .then((response) => {
          // logger.debug(response);
        });
        // logger.info(colors.yellow(`Parsing text from ${legislation.type}`));
      // LegislationParser.parseLegislationText(legislationContent);
    });
});
