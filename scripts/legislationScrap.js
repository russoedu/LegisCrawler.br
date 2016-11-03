const config = require('../config/config');
const logger = require('../helpers/logger');
const Legislation = require('../models/Legislation');
const LegislationGetter = require('./LegislationGetter');
// const LegislationParser = require('./LegislationParser');
const colors = require('colors');

const legislations = config.legislations;

logger.info(colors.blue('Legislation Scrap [START]'));
legislations.forEach((legislation) => {
  logger.info(colors.yellow(`Get text from ${legislation.type} [START]`));
  LegislationGetter.getLegislationText(legislation)
    .then((gottenLegislation) => {
      logger.info(colors.green(`Get text from ${gottenLegislation.type} [END]`));
      const legis = new Legislation(
          gottenLegislation.type,
          gottenLegislation.url,
          gottenLegislation.data
        );
      legis.create();
      // logger.info(colors.yellow(`Parse text from ${gottenLegislation.type} [START]`));
      // return LegislationParser.parseLegislationText(gottenLegislation);
    })
    // .then((parsedLegislation) => {
    //   logger.info(colors.green(`Parse text from ${parsedLegislation.type} [END]`));
    //   const legis = new Legislation(
    //     parsedLegislation.type,
    //     parsedLegislation.url,
    //     parsedLegislation.data
    //   );
    //   legis.create();
    // })
    .catch((err) => {
      logger.error(err);
    });
});
