// const colors = require('colors');
// const logger = require('../helpers/logger');

// Regular Expressions
// Used to fix a semantic error that puts a bold in 'A' from 'Art'
const brokenArticleRegEx = /^rt. [0-9]+/;
// Used to clean comments from the text
const commentRegEx = /\(.*\)/;
// Used to clean the text removing white spaces chars
const whiteSpacesRegEx = /\n+|\r+|\t+|\u00A0|\u0096|\s/g;
// Used to clean the text removing double spaces chars
const doubleSpaceRegEx = /\s\s+/g;
// Used to clean titles from the text
const notArticleTitleRegEx = /^[A-Z ÁÉÍÓÚÀÈÌÒÙÇÃÕÄËÏÖÜÂÊÎÔÛ]+$/;

class LegislationCleaner {
  static cleanText(dirtyText) {
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

    return text;
  }

  static cleanArticleNumber(dirtyTitle) {
    const articleNumberRegEx = /(\d\.?\d*)([o|º])?(\-[A-z])?/;
    const articleNumberOnlyRegEx = /(\d\.?\d*)/;

    // Extract only the article title
    let title = articleNumberRegEx.exec(dirtyTitle)[0];
    title = title
      // Remove the thousand separator (in Brazil, we use '.' to separate thousands and ',' to
      // decimals)
      .replace('.', '')
      // Remove the order simbol
      .replace('o', '')
      // Remove the order simbol
      .replace('o.', '')
      // Remove the order simbol
      .replace('º', '');

    // Get only the numeric part of the title
    const titleNum = articleNumberOnlyRegEx.exec(title)[0];

    // Split the number to concatenate again with the order simbol
    const titleSplit = title.split(titleNum);

    // Add the order simbol
    title = titleNum < 10 ? `${titleNum}º` : titleNum;
    // Concatenate with the rest
    title += titleSplit[1];

    return title;
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
      }
    });
    return fixedText;
  }
}
module.exports = LegislationCleaner;
