#!/usr/bin/env node
process.env.UV_THREADPOOL_SIZE = 128;

const debug = require('debug')('spider');
const error = require('../helpers/error');
const Status = require('../helpers/Status');
const Db = require('../helpers/Db');
const Category = require('../models/Category');
const Type = require('../models/Type');
const List = require('../models/List');
const Crawl = require('./Crawl');
const forLimit = require('for-limit');
const Legislation = require('../models/Legislation');
const Scraper = require('./Scraper');
const Clean = require('./Clean');
const Scrap = require('./Scrap');

// const url = 'http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1';
const url = 'http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1/leis-complementares-1';

Db.connect().then(() => {
  Crawl.page(url, 'home')
  .then((categories) => {
    if (global.error) {
      Status.finishAllWithError();
    } else {
      const category = {
        name: 'home',
        type: Type.LIST,
        layout: 'GENERAL_LIST',
        list: categories,
        url,
      };
      new Category(category).save();
    }
  })
  .then(() =>
     List.list().then((legislations) => {
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
             // Scrap the content to extract Articles
             .then((cleanText) => {
               status.startProcess('Scrap');
               const articles = Scrap.getArticles(cleanText);
               // debug(articles);
               status.finishProcess();
               return articles;
             })
             // Clean articles
             .then((articles) => {
               status.startProcess('Clean');
               // debug(articles);

               const cleanArticles = Scrap.cleanArticles(legislation.name, articles);
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
       forLimit(0, quantity, 3, crawl);
     })
  )
  .then(() => {
    Status.finishAll();
    global.db.close();
  })
  .catch((err) => {
    error('spider', 'general error', err);
  });
});
