// const debug = require('debug')('scrap-cleaner');
// const chalk = require('chalk');

class LegislationCleaner {
  static cleanText(dirtyText) {
    // Regular Expressions
    // Used to fix a semantic error that puts a bold in 'A' from 'Art'
    const brokenArticleRegEx = /^rt.\s[0-9]+/;
    // Used to clean comments from the text
    const commentRegEx = /\(.*\)/;
    // Used to clean the text removing white spaces chars
    const whiteSpacesRegEx = /\n+|\r+|\t+|\u00A0|\u0096|\s/g;
    // Used to clean the text removing double spaces chars
    const doubleSpaceRegEx = /\s\s+/g;
    // Used to clean titles from the text
    const notArticleTitleRegEx = /^[A-Z\sÁÉÍÓÚÀÈÌÒÙÇÃÕÄËÏÖÜÂÊÎÔÛ]+$/;

    let text = dirtyText;
    text = text
      .replace(whiteSpacesRegEx, ' ')
      .replace(doubleSpaceRegEx, ' ')
      .replace(notArticleTitleRegEx, '')
      .replace(commentRegEx, '');

    // Clean text if it is only a space char
    text = text === ' ' ? '' : text;

    if (brokenArticleRegEx.test(text)) {
      text = `A${text}`;
    }
    // debug(`dirtyText = "${chalk.yellow(dirtyText)}"
    //             cleanText = "${chalk.green(text)}"`);
    return text;
  }

  static trim(dirtyText) {
    const beginningTrimRegEx = /^\s/g;
    const endTrimRegEx = /\s$/g;

    let text = dirtyText;
    text = text
      .replace(beginningTrimRegEx)
      .replace(endTrimRegEx);

    return text;
  }

  static cleanArticleNumber(dirtyNumber) {
    const articleNumberRegEx = /(\d\.?\d*)(o|º|°)?(\-[A-z])?/;
    const articleNumberOnlyRegEx = /(\d\.?\d*)/;

    // Extract only the article title
    let article = articleNumberRegEx.exec(dirtyNumber)[0];
    article = article
      // Remove the thousand separator (in Brazil, we use '.' to separate thousands and ',' to
      // decimals)
      .replace('.', '')
      // Remove possible order simbols
      .replace('o', '')
      .replace('o.', '')
      .replace('°', '')
      .replace('º', '');

    // Get only the numeric part of the article
    const articleNum = articleNumberOnlyRegEx.exec(article)[0];

    // Split the number to concatenate again with the order simbol
    const articleSplit = article.split(articleNum);

    // Add the order simbol
    article = articleNum < 10 ? `${articleNum}º` : articleNum;
    // Concatenate with the rest
    article += articleSplit[1];
    // debug(`dirtyNumber = "${chalk.yellow(dirtyNumber)}"
    //             cleanNumber = "${chalk.green(article)}"`);
    return article;
  }

  static cleanParagraphNumber(dirtyNumber) {
    const paragraphNumberRegEx = /\d+(º|o|°)?(\-[A-z])?/;
    const uniqueParagraphRegEx = /Parágrafo\súnico/;
    const paragraphNumberOnlyRegEx = /(\d\.?\d*)/;

    const testMatches = dirtyNumber.match(uniqueParagraphRegEx);
    if (testMatches !== null) {
      return 'Parágrafo único';
    }

    // Extract only the paragraph title
    let paragraph = paragraphNumberRegEx.exec(dirtyNumber)[0];
    paragraph = paragraph
      // Remove the thousand separator (in Brazil, we use '.' to separate thousands and ',' to
      // decimals)
      .replace('.', '')
      // Remove possible order simbols
      .replace('o', '')
      .replace('o.', '')
      .replace('°', '')
      .replace('º', '');

    // Get only the numeric part of the paragraph
    const paragraphNum = paragraphNumberOnlyRegEx.exec(paragraph)[0];

    // Split the number to concatenate again with the order simbol
    const paragraphSplit = paragraph.split(paragraphNum);

    // Add the order simbol
    paragraph = paragraphNum < 10 ? `§ ${paragraphNum}º` : `§ ${paragraphNum}`;
    // Concatenate with the rest
    paragraph += paragraphSplit[1];
    // debug(`dirtyNumber = "${chalk.yellow(dirtyNumber)}"
    //             cleanNumber = "${chalk.green(paragraph)}"`);
    return paragraph;
  }

  static cleanKnownSemanticErrors(type, number, text) {
    let fixedText = text;
    const knownErrors = [
      {
        type: 'Código Penal',
        number: '129',
        fix(tx) {
          return tx.replace('121.Violência Doméstica § 9o', '121.§ 9o');
        },
      },
    ];

    knownErrors.forEach((error) => {
      if (type === error.type && number === error.number) {
        fixedText = error.fix(text);
        // debug(`dirtyText = "${chalk.yellow(text)}"\ncleanText = "${chalk.green(fixedText)}"`);
      }
    });
    return fixedText;
  }
}
module.exports = LegislationCleaner;
