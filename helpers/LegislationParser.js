const getCleanArticleNumber = function getCleanArticleNumber(dirtyTitle) {
  const articleNumberRegEx = /(\d\.?\d*)([o|º])?(\-[A-z])?/;
  const articleNumberOnlyRegEx = /(\d\.?\d*)/;

  // Extract only the article title
  let title = articleNumberRegEx.exec(dirtyTitle)[0];
  // Remove the thousand separator (in Brazil, we use '.' to separate thousands and ',' to decimals)
  title = title.replace('.', '');
  // Remove the order simbol
  title = title.replace('o', '');
  // Remove the order simbol
  title = title.replace('o.', '');
  // Remove the order simbol
  title = title.replace('º', '');

  // Get only the numeric part of the title
  const titleNum = articleNumberOnlyRegEx.exec(title)[0];

  // Split the number to concatenate again with the order simbol
  const titleSplit = title.split(titleNum);

  // Add the order simbol
  title = titleNum < 10 ? `${titleNum}º` : titleNum;
  // Concatenate with the rest
  title += titleSplit[1];

  return title;
};

const getPartsFromArticle = function getPartsFromArticle(article) {
  const articleDefRegEx = / ?(Art.) [0-9.?]+([o|º|o.])? ?(-|\.)?( |[A-Z]+\. )?/;

  // Get only the article number part
  const splitedArticle = articleDefRegEx.exec(article);
  const spliterTitle = splitedArticle[0];

  const number = getCleanArticleNumber(splitedArticle[0]);
  const text = article.split(spliterTitle)[1];
  return {
    number,
    text,
  };
};

class LegislationParser {
  constructor(text) {
    this.text = text;
  }

  getTextContent() {
    const parts = getPartsFromArticle(this.text);

    this.number = parts.number;
    this.text = parts.text;

    return this;
  }
}

module.exports = LegislationParser;
