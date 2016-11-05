const debug = require('debug')('scrap-parser');
const Split = require('./Split');

class LegislationParser {
  constructor(type, text = null) {
    this.type = type;
    this.text = text;
    this.number = null;
    this.paragraphs = [];
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

module.exports = LegislationParser;
