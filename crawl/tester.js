const request = require('../helpers/request');
const cheerio = require('cheerio');

const getCleanHtml = function getCleanHtml(crawlUrl) {

  request({ url: crawlUrl, encoding: 'latin1' })
    .then((data) => {
      const $ = cheerio.load(data, { decodeEntities: false });
      $('head').remove();
      $('*').each(function remAt() {
        if (!(this.type === 'tag' && this.name === 'a')) {
          this.attribs = {};
        }
      });
      console.log($.html());
    })
    .catch((err) => {
      console.log(err);
    });
};

getCleanHtml('http://www.planalto.gov.br/ccivil_03/Decreto-Lei/Del5452compilado.htm');