const debug = require('debug')('parser');
const chalk = require('chalk');
const Split = require('./Split');
const Cleaner = require('./Cleaner');
const objectToArray = require('../helpers/objectToArray');


class Parser {
  constructor(type, text = null) {
    this.type = type;
    this.text = text;
    this.number = null;
    this.paragraphs = [];
  }

  /**
   * Breakes the article into it's number and it's text
   * @param  {String} type    The type of the legislation that will be splited
   * @param  {String} article The article full content
   * @return {Object}         Object with number and text
   * @example
   * {
   *   number: '1º',
   *   text: 'Os menores de 18 anos são penalmente inimputáveis, ficando sujeitos às normas
   *          estabelecidas na legislação especial.'
   * }
   */
  static getArticles(cleanText) {
    const articleRegEx = /^(Art.)\s[0-9.?]+([o|º|o.])?\s?(-|\.)?(\s|[A-Z]+\.\s)?/gm;
    let text = cleanText;
    const articles = {};
    // Get only the article numeric part
    const articleNums = text.match(articleRegEx);
    const lastOne = articleNums.length - 1;
    // const articleSpliter = splitedArticle[0];
    debug(articleNums);
    articleNums.forEach((num, index) => {
      // The first split results in an empty string, so we need to treat it
      const nextNum = articleNums[index + 1];
      const numClean = Cleaner.cleanArticleNumber(num);
      const nextNumClean = nextNum ? Cleaner.cleanArticleNumber(nextNum) : '';
      const splitNextNum = text.split(nextNum);
      debug('numClean:', numClean, 'nextNumClean:', nextNumClean, 'index:', index,
            'lastOne:', lastOne, 'splitNextNum.length', splitNextNum.length);

      text = splitNextNum ? splitNextNum[splitNextNum.length - 1] : '';
      if (index === 0) {
        articles[numClean] = splitNextNum[0].split(num)[splitNextNum.length - 1];
      } else {
        articles[numClean] = splitNextNum[0] ? splitNextNum[0] : text;
      }
    });
    debug(articles);
    const parsedText = objectToArray(articles);
    return parsedText;
  }

  getStructuredArticle() {
    const articleText = Split.articleText(this.type, this.text);
    this.number = articleText.number;
    this.text = articleText.text;

    const articleParagraphs = Split.articleParagraphs(this.type, this.number, this.text);
    debug(articleParagraphs);
    if (articleParagraphs !== null) {
      this.text = articleParagraphs.text;
      this.paragraphs = articleParagraphs.paragraphs;
    }
    debug(this);
    return this;
  }
}

module.exports = Parser;
