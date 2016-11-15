const config = require('../config/config');
const error = require('../helpers/error');
const Status = require('../helpers/Status');
const Legislation = require('../models/Legislation');
const Scraper = require('./Scraper');
const Cleaner = require('./Cleaner');
const Parser = require('./Parser');
const debug = require('debug')('index');

const legislations = config.legislations;
const quantity = legislations.length;
let finished = 0;

Status.startAll(quantity);

legislations.forEach((legislation) => {
  const status = new Status(legislation.type);
  status.startProcessComplete();

  status.startProcess('Scrap');
  Scraper
    // Get the legislations from the URLs set in the config
    .scrapPage(legislation)
    .then((scrapedLegislation) => {
      status.finishProcess();
      return scrapedLegislation;
    })
    // Clean the text removing everithing that is not part of an article
    .then((scrapedLegislation) => {
      status.startProcess('Clean');
      const cleanText = Cleaner.cleanText(scrapedLegislation);
      status.finishProcess();
      return cleanText;
    })
    // Parte the content to extract Articles
    .then((cleanText) => {
      status.startProcess('Parse');
      const parsedText = Parser.getArticles(cleanText);
      status.finishProcess();
      return parsedText;
    })
    // Parte the content to atructure it with Paragraphs
    .then((parsedText) => {
      status.startProcess('Structure');
      // const organizedArticles = Parser.getStructuredArticles(parsedText);
      const organizedArticles = parsedText;
      debug(parsedText);
      status.finishProcess();
      return organizedArticles;
    })
    // Save the organized legislation
    .then((organizedArticles) => {
      status.startProcess('Save');
      finished += 1;
      const legis = new Legislation(
          legislation.type,
          legislation.url,
          organizedArticles
        );

      legis.create();
      status.finishProcess();

      status.finishProcessComplete();
      Status.finishAll(quantity, finished);
    })
    .catch((err) => {
      error(legislation.type, 'Could not reach legislation', err);
    });
});
