const LegislationCleaner = require('./LegislationCleaner');

const getPartsFromArticle = function getPartsFromArticle(type, article) {
  const articleDefRegEx = / ?(Art.) [0-9.?]+([o|º|o.])? ?(-|\.)?( |[A-Z]+\. )?/;

  // Get only the article number part
  const splitedArticle = articleDefRegEx.exec(article);
  const spliterTitle = splitedArticle[0];

  const number = LegislationCleaner.cleanArticleNumber(splitedArticle[0]);
  let text = article.split(spliterTitle)[1];

  // There are some semantic errors that don't have any pattern, so we need to fix them manually
  text = LegislationCleaner.cleanKnownSemanticErrors(type, number, text);
  return {
    number,
    text,
  };
};
//
// const splitArticleText(text) {
//
// }

class LegislationParser {
  constructor(type, text = null) {
    this.type = type;
    this.number = null;
    this.text = text;
  }

  getStructuredArticle() {
    const parts = getPartsFromArticle(this.type, this.text);

    this.number = parts.number;
    this.text = parts.text;

    return this;
  }
}

module.exports = LegislationParser;
