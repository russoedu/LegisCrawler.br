#!/usr/bin/env node

const http = require('http');
const cron = require('node-cron');

const Spider = require('./crawl/Spider');
const SpiderStatus = require('./helpers/SpiderStatus');


const url = 'http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1';
// const url = 'http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1/codigos-1';

/**
 * Define if the Spider should create a cron job or run now
 * @property useSchedule
 * @type {Boolean}
 * @default true
 */
let useSchedule = true;

/**
 * Define how many parallel requests and executions should run
 * @property parallel
 * @type {Number}
 * @default 3
 */
global.parallel = 5;

// Read the CLI arguments
process.argv.forEach((arg, index) => {
  if (arg === '--no-schedule') {
    useSchedule = false;
  } else if (arg === '--parallel') {
    global.parallel = Number(process.argv[index + 1]);
  }
});

// Set the number of parallel requests that should be opened
http.globalAgent.maxSockets = global.parallel;
process.env.UV_THREADPOOL_SIZE = 128;
process.setMaxListeners(0);

// Set the cron job if useSchedule was set
if (useSchedule) {
  const hour = 4;
  SpiderStatus.cronSet(hour);
  cron.schedule(`0 0 ${hour} 1-31 * *`, () => {
    Spider.crawlLinks(url);
  });
} else {
  Spider.crawlLinks(url);
}
