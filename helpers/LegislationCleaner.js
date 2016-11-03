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
  constructor(dirtyText) {
    this.dirtyText = dirtyText;
  }
  cleanText() {
    let text = this.dirtyText;
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
}
module.exports = LegislationCleaner;
