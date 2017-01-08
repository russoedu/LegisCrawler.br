const debug = require('debug')('crawl');
const cron = require('node-cron');
const forLimit = require('for-limit');
const config = require('../config/config');
const error = require('../helpers/error');
const Status = require('../helpers/Status');
const Legislation = require('../models/Legislation');
const Scraper = require('./Scraper');
const Clean = require('./Clean');
const Parser = require('./Parser');

const legislations = config.legislations;
const quantity = legislations.length;


function crawl(i, next) {
  Status.startAll(quantity);
  setTimeout(() => {
    const legislation = legislations[i];

    const status = new Status(legislation.name);
    status.startProcessComplete();

    status.startProcess('Scrap');
    Scraper
      // Get the legislations from the URLs set in the config
      .scrapPage(legislation)
      .then((scrapedText) => {
        status.finishProcess();
        return scrapedText;
      })
      // Clean the text removing everithing that is not part of an article
      .then((scrapedText) => {
        // debug(scrapedText);
        status.startProcess('Clean');
        const cleanText = Clean.cleanScrapedText(scrapedText);
        // debug(cleanText);
        status.finishProcess();
        return cleanText;
      })
      // Parse the content to extract Articles
      .then((cleanText) => {
        status.startProcess('Parse');
        const articles = Parser.getArticles(cleanText);
        // debug(articles);
        status.finishProcess();
        return articles;
      })
      // Clean articles
      .then((articles) => {
        status.startProcess('Clean');
        // debug(articles);

        const cleanArticles = Parser.cleanArticles(legislation.name, articles);
        debug(cleanArticles);
        status.finishProcess();
        return cleanArticles;
      })
      // Save the organized legislation
      .then((cleanArticles) => {
        status.startProcess('Save');
        const legis = new Legislation(
          legislation.name,
          legislation.category,
          legislation.link,
          legislation.url,
          cleanArticles
        );

        // Save the lislation in the DB
        legis.save();
        status.finishProcess();

        status.finishProcessComplete();
      // status.finishAll();
      })
      .then(() => {
        Status.finishAll(quantity, i);
        next();
      })
      .catch((err) => {
        error(legislation.name, 'Could not reach legislation', err);
      });
  }, 10);
}
cron.schedule('0 0 4 1-31 * *', () => {
  forLimit(0, quantity, 3, crawl);
});
