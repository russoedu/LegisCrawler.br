const debug = require('debug')('parser');
const chalk = require('chalk');
const Cleaner = require('./Cleaner');
const objectToArray = require('../helpers/objectToArray');


class Parser {
  /**
   * Breakes the article into it's number and it's text
   * @param  {String} cleanText    The text already cleanned to be parsed into articles
   * @return {Array}               Array with each article object
   * @example
   * [
   *    {
   *      number: '1º',
   *      article: 'Os menores de 18 anos são penalmente inimputáveis, ficando sujeitos às normas
   *                estabelecidas na legislação especial.'
   *    },
   *    {
   *      number: '10',
   *      article: 'É assegurada a \nparticipação dos trabalhadores e empregadores nos colegiados
   *                dos órgãos públicos \nem que seus interesses profissionais ou previdenciários
   *                sejam objeto de \ndiscussão e deliberação.\n'
   *    },
   *    {
   *      ...
   *    },
   *    .
   *    .
   *    .
   * ]
   */
  static getArticles(cleanText) {
    const articleRegEx = /^(Art.)\s[0-9.?]+([o|º|o.])?\s?(-|\.)?(\s|[A-Z]+\.\s)?/gm;
    let text = cleanText;
    const articles = {};
    // Get only the article numeric part
    const articleNums = text.match(articleRegEx);

    // debug('articleNums', articleNums);
    // debug('cleanText: ', cleanText);

    articleNums.forEach((num, index) => {
      // The first split results in an empty string, so we need to treat it
      const nextNum = articleNums[index + 1];
      // debug('num: ', num);
      const numClean = Cleaner.cleanArticleNumber(num);
      // debug('nextNum: ', nextNum);
      const splitNextNum = text.split(nextNum);
      // const lastOne = articleNums.length - 1;
      // const nextNumClean = nextNum ? Cleaner.cleanArticleNumber(nextNum) : '';
      // debug('numClean:', numClean, 'nextNumClean:', nextNumClean, 'index:', index,
      //       'lastOne:', lastOne, 'splitNextNum.length', splitNextNum.length);

      text = splitNextNum ? splitNextNum[splitNextNum.length - 1] : '';
      if (index === 0) {
        articles[numClean] = splitNextNum[0].split(num)[splitNextNum.length - 1];
      } else {
        articles[numClean] = splitNextNum[0] ? splitNextNum[0] : text;
      }
    });
    const parsedText = objectToArray(articles);
    // debug(parsedText);
    return parsedText;
  }

  static getStructuredArticles(articles) {
    const numReEx = /(\.|:)((\s?§\s\d+(º|o|°)?\.?(\s?-)?[A-z]?\s?)|(\s?Parágrafo\súnico\s?-\s?))/gm;

    articles.forEach((art, index) => {
      const workText = art.article;
      debug(workText);
      // const testMatches = workText.match(numReEx);
      // if (testMatches === null) {
      //   return null;
      // }
      //
      // const response = {
      //   text: '',
      //   paragraphs: [],
      // };
      //
      // // debug((`Type: ${type}`.blue));
      // // debug(`Matches: ${testMatches} | Count: ${testMatches.length}`.green);
      // for (let i = 0; i < testMatches.length; i += 1) {
      //   // Get only the paragraph numeric part
      //   workText.match(numReEx);
      //   const splitedText = numReEx.exec(workText);
      //   const textSpliter = splitedText[0];
      //   const cleanPart = `${workText.split(textSpliter)[0]}.`;
      //   const dirtyPart = workText.split(textSpliter)[1];
      //
      //   if (dirtyPart) {
      //       // In the first iteration, the splited part is the article text
      //     workText = dirtyPart;
      //     const number = Cleaner.cleanParagraphNumber(textSpliter);
      //     if (i === 0) {
      //       // debug(`Art. ${articleNumber}: `.yellow + cleanPart);
      //       response.text = Cleaner.postCleaning(cleanPart);
      //       response.number = articleNumber;
      //       response.paragraphs[i] = {
      //         number,
      //         paragraph: Cleaner.postCleaning(dirtyPart),
      //       };
      //     } else {
      //       response.paragraphs[i - 1].paragraph = Cleaner.postCleaning(cleanPart);
      //       response.paragraphs[i] = {
      //         number,
      //       };
      //       if (i < testMatches.length) {
      //         response.paragraphs[i].paragraph = Cleaner.postCleaning(dirtyPart);
      //       }
      //     }
      //   }
      // }
      // debug(response);
      // return response;
    });

    // const articleParagraphs = Split.articleParagraphs(this.type, this.number, this.text);
    // debug(articleParagraphs);
    // if (articleParagraphs !== null) {
    //   this.text = articleParagraphs.text;
    //   this.paragraphs = articleParagraphs.paragraphs;
    // }
    // debug(this);
    // return this;
  }
}

module.exports = Parser;
