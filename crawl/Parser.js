const debug = require('debug')('parser');
const chalk = require('chalk');
const Cleaner = require('./Cleaner');

class Parser {
  /**
   * Breakes the article into it's number and it's text
   * @param  {String} cleanText    The text already cleanned to be parsed into articles
   * @return {Array}               Array with each article object
   * @example
   * [
   *    {
   *      number: '1º',
   *      article: 'Os menores de 18 anos são penalmente inimputáveis, ficando sujeitos às …'
   *    },
   *    {
   *      number: '10',
   *      article: 'É assegurada a \nparticipação dos trabalhadores e empregadores nos …'
   *    }
   * ]
   */
  static getArticles(cleanText) {
    const articleRegEx = /^(Art.)\s[0-9.?]+([o|º|o.|°])?\s?(-|\.)?(\s|[A-Z]+\.\s)?/gm;
    let text = cleanText;
    const articles = [];
    // Get only the article numeric part
    const articlesMatch = text.match(articleRegEx);
    // debug('articlesMatch', articlesMatch);

    let order = 0;
    articlesMatch.forEach((num, index) => {
      // The first split results in an empty string, so we need to treat it
      // debug('num: ', num);
      const nextNum = articlesMatch[index + 1];
      // debug('nextNum: ', nextNum);
      const number = Cleaner.cleanArticleNumber(num);
      // debug('number: ', number);
      const splitNextNum = text.split(nextNum);
      // const lastOne = articlesMatch.length - 1;
      // const nextNumClean = nextNum ? Cleaner.cleanArticleNumber(nextNum) : '';
      // debug('number:', number, 'nextNumClean:', nextNumClean, 'index:', index,
      //       'lastOne:', lastOne, 'splitNextNum.length', splitNextNum.length);

      text = splitNextNum ? splitNextNum[splitNextNum.length - 1] : '';
      if (index === 0) {
        // const article = Cleaner.postCleaning(splitNextNum[0].split(num)[splitNextNum.length - 1]);
        const article = splitNextNum[0].split(num)[splitNextNum.length - 1];
        articles[order] = {
          number,
          article,
        };
      } else {
        const article = splitNextNum[0] ? splitNextNum[0] : text;
        debug(number, ': ', article);
        articles[order] = {
          number,
          article,
        };
      }
      order += 1;
    });
    // const parsedText = objectToArray(articles, 'article');
    debug(articles);
    return articles;
  }

  /**
   * Some texts don't follow the patterns and need to be treated individually
   * @static
   * @param  {String} legislationName   The name of the legislation
   * @param  {Array} dirtyArticles   Array of articles to be clean
   * @return {Array}        Array of clean articles
   */
  static cleanArticles(legislationName, dirtyArticles) {
    const articles = dirtyArticles;

    articles.forEach((article, index) => {
      articles[index].article = Cleaner.cleanKnownSemanticErrors(legislationName, article);
      articles[index].article = Cleaner.trimAndClean(article.article);
    });

    return articles;
  }
}

module.exports = Parser;
