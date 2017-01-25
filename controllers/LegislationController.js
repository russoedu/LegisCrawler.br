const debug = require('debug')('api');
const async = require('async');

const Legislation = require('../models/Legislation.js');
const Scrap = require('../crawl/Scrap.js');

const error = require('../helpers/error');
const log = require('../helpers/log');

const pvt = {
  readData(req) {
    debug(req);
    let isLegislation = false;
    const base = '_parsedUrl';
    const path = req[base].pathname;
    const data = path.split('/');

    let parent = '';
    let slug = /./;

    data.forEach((value, key) => {
      if (value === 'l') {
        slug = data[key + 1];
        isLegislation = true;
      } else if (!isLegislation && value !== '') {
        parent += `/${value}`;
      }
    });

    if (parent === '') {
      parent = '/';
    }

    const response = {
      search: {
        parent,
      },
      isLegislation,
    };

    if (isLegislation) {
      response.search.slug = slug;
    }

    debug(response);
    return response;
  },

  allIndexOf(text, searchRegEx) {
    debug(searchRegEx);
    const indices = [];
    let exec = true;
    while (exec) {
      const result = searchRegEx.exec(text);
      if (result !== null) {
        indices.push(result.index);
        debug(result.index, exec);
      } else {
        exec = false;
        debug(result, exec);
      }
    }
    // for (let pos = text.indexOf(search); pos !== -1; pos = text.indexOf(search, pos + 1)) {
    //   indices.push(pos);
    // }
    return indices;
  },

  setSearchMarks(data, search) {
    return new Promise((resolve, reject) => {
      const response = data;
      const marks = [];

      response.content = response.content
                            .replace(/[\n\t\r]+/img, ' ')
                            .replace(/(&nbsp;)+/img, ' ');

      const searchRegEx = new RegExp(`(${search})`, 'img');
      const indices = pvt.allIndexOf(response.content, searchRegEx);
      debug(indices);

      const delta = 30;
      const wordLength = search.length;

      indices.forEach((index) => {
        let begin = 0;
        let end = response.content.length;

        if (index >= begin + delta) {
          begin = index - delta;
        }
        if (index <= end - wordLength - delta) {
          end = index + wordLength + delta;
        }
        let res = response.content.substring(begin, end);
        res = res
              .replace(/>|(<?\/?[A-z]+>)|(<\/?[A-z]+>?)|</img, '')
              .replace(searchRegEx, `<mark id="mark-${index}">$1</mark>`);

        res = `…${res}…`;
        marks.push(res);
      });
      if (marks.length > 0) {
        resolve(marks);
      } else {
        reject();
      }

      debug(response.marks);
    });
  },
};

class LegislationController {
  static list(req, res) {
    debug('LegislationController.find()');

    const readData = pvt.readData(req);
    const search = readData.search;
    const isLegislation = readData.isLegislation;

    const searchQuery = typeof req.query.search === 'undefined' ?
                        false :
                        decodeURIComponent(req.query.search);

    if (searchQuery) {
      search.parent = new RegExp(`${search.parent}.*`, 'img');
      search.type = 'LEGISLATION';
      search.content = new RegExp(`.*${searchQuery}.*`, 'img');
    }

    let resultData = {};

    // Don't send the content string if it's not a legislation (!isLegislation) or search (!searchQuery)

    if (!isLegislation && !searchQuery) {
      resultData = {
        name: '',
        url: '',
        type: '',
        slug: '',
        date: '',
        parent: '',
        breadCrumb: '',
      };
    }

    log(search, resultData, searchQuery);
    let limit = 0;
    if (searchQuery) {
      limit = 300;
    }
    Legislation.list(search, resultData, limit)
      .then((listResponse) => {
        log(listResponse.length);
        // Legislation information
        if (isLegislation && searchQuery) {
          const html = listResponse[0].content;
          const markedHtml = Scrap.htmlMark(html, searchQuery);
          res.status(200).send(markedHtml);
        // Legislation HTML (for the moblet iframe)
        } else if (isLegislation) {
          const html = listResponse[0].content;
          res.status(200).send(html);
        // Search
        } else if (searchQuery) {
          async.forEachLimit(
            listResponse,
            100,
            (response, callback) => {
              const data = response;
              debug(data.name);
              debug(data.name, data._id);
              pvt.setSearchMarks(data, searchQuery)
                .then((marks) => {
                  data.marks = marks;
                  delete data.content;
                  callback();
                });
            },
            (err) => {
              if (err) {
                error(err);
                res.status(500).send();
              } else {
                debug('finish search');
                res.status(200).send(listResponse);
              }
            });
        // List of legislations and lists
        } else {
          res.status(200).send(listResponse);
        }
      })
      .catch((err) => {
        error(req.params.name, 'Could not retrieve data', err);
        res.status(400).json(err);
      });
  }
}

module.exports = LegislationController;
