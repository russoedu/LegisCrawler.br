const debug = require('debug')('parser');
const Split = require('./Split');

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
    const res = {};
    // Get only the article numeric part
    const articleNums = text.match(articleRegEx);
    // const articleSpliter = splitedArticle[0];
    debug(articleNums);
    articleNums.forEach((num) => {
      // debug(text);
      const splited = text.split(num);
      res[num] = splited[0];
      text = splited[1];
      debug(res);
    });
    // const number = LegislationCleaner.cleanArticleNumber(articleSpliter);
    // let text = article.split(articleSpliter)[1];
    //
    // There are some semantic errors that don't have any pattern, so we need to fix them manually
    // text = LegislationCleaner.cleanKnownSemanticErrors(type, number, text);
    // return {
    //   number,
    //   text,
    // };
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
