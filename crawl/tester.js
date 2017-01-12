const htmlparser = require('htmlparser2');
const request = require('../helpers/request');
const Scrap = require('../crawl/Scrap');

const fullCapture = function cap(legislation) {
    let processing = false;
    let useContent = true;
    let scrapedContent = '';

    const requestoptions = {
      url: legislation.url,
      encoding: 'latin1',
    };
    const parser = new htmlparser.Parser({
      onopentag(tag) {
        if (processing && tag === 'strike') {
          useContent = false;
        }
      },
      ontext(text) {
        if (processing && useContent) {
          // debug(`captured ${dirtyText}`);
          scrapedContent += text;
        } else {
          // debug(`ignored ${dirtyText}`);
        }
      },
      onclosetag(tag) {
        if (tag === 'head') {
          processing = true;
        } else if (tag === 'strike') {
          // debug(`finished ignored tag: ${tag}`);
          useContent = true;
        }
      },
    }, { decodeEntities: true });

    return new Promise((resolve, reject) => {
      request(requestoptions)
        .then((html) => {
          parser.write(html);
          parser.end();
          resolve(scrapedContent);
        })
        .catch((err) => {
          error(legislation.name, 'Could not scrap page', err);
          reject(err);
        });
    });
  };
const getCompiledUrl = function getCompiledUrl(crawlUrl) {
  fullCapture({ url: crawlUrl, name: 'Afe' }).then((content) => {
    console.log(content);
  });
};

getCompiledUrl('http://www.planalto.gov.br/ccivil_03/Decreto-Lei/Del5452compilado.htm');