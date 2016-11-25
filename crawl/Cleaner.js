const debug = require('debug')('cleaner');
const chalk = require('chalk');
const knownSemanticErrors = require('./knownSemanticErrors');

/**
 * Gets an article or paragraph number only
 * @private
 * @param  {String} dirtyText        The full text
 * @param  {Object} regEx            The regular expression with the article or paragraph
 * @param  {String} cleanCapGroups   The capturing groups that exclude the thousands separator and
 *                                   the ordinal chars
 * @param  {String} numberCapGroups  The capturing groups to get only the numeric part
 * @param  {String} lettersCapGroups The capturing groups to get only the text part of the article
 *                                   number
 * @return {String}                  The "number only" of the article or paragraph (it may contain
 *                                   letters – ex: 103-A – and ordinal chars – ex: 1º)
 */
function getNumber(dirtyText, regEx, cleanCapGroups, numberCapGroups, lettersCapGroups) {
  // Extract only the content title that will be used for the cleaning
  let content = regEx.exec(dirtyText)[0];

  // Get only the numeric part of the content
  content = content.replace(regEx, numberCapGroups) < 10 ?
    content.replace(regEx, cleanCapGroups)
      .replace(regEx, `${numberCapGroups}º${lettersCapGroups}`) :
    content.replace(regEx, cleanCapGroups)
      .replace(regEx, `${numberCapGroups}${lettersCapGroups}`);

  return content;
}

Array.prototype.indexOfArticle = function (number) {
  for (let i = 0; i < this.length; i += 1) {
    if (this[i].number === number) {
      return i;
    }
  }
  return -1;
};
/**
 * @class
 */
class Cleaner {
  /**
   * Pre cleaning function removes all double spaces and text things that shoudn't be there
   * @static
   * @param  {Strign} dirtyText The full text
   * @return {Strign}           The clean text
   */
  static cleanScrapedText(dirtyText) {
    // Regular Expressions
    const commentRegEx = /\([^)]*\)/gm;
    const notArticleTitleRegEx = /^[A-Z\sÁÉÍÓÚÀÈÌÒÙÇÃÕÄËÏÖÜÂÊÎÔÛ]+$/gm;
    const tabOrStrangeSpaceRegEx = /\t|\u00A0|\u0096/g;
    const brokenArticleRegEx = /^(rt.\s[0-9]+)/;
    const returnRegEx = /(\n+\s+)|(\r+\s+)|\n+|\r+/g;
    const beginingOfLegislation = /(Art[.\s-]+1[\s\S]+)/gm;
    const endOfLegislation = /^.+,\s[0-9]+\sde\s[A-z]+\sde\s[0-9]+([\n.\s\S]*)/gm;

    let text = dirtyText
      // Clean comments from the text
      .replace(commentRegEx, '')
      // Clean capitalized titles from the text
      .replace(notArticleTitleRegEx, '')
      // Clean tab and strange spaces chars
      .replace(tabOrStrangeSpaceRegEx, ' ')
      // Clean multiple returns and spaces after returns
      .replace(returnRegEx, '\n')
      // Clean everything from the "Place / date" text, that ends the legislation
      .replace(endOfLegislation, '')
      // Used to fix a semantic error that puts a bold in 'A' from 'Art'
      // TODO move this replace to another place
      .replace(brokenArticleRegEx, 'A$1');

    // Clean everything before the first article
    text = text.match(beginingOfLegislation)[0];

    return text;
  }

  /**
   * Post cleaning function trims the text and add line breaks before items
   * @static
   * @param  {String} originsText The text already cleaned by preCleaning
   * @return {String}             The trimmed text with line breaks on items
   */
  static trimAndClean(originalText) {
    let text = originalText;
    debug(text);

    if (text !== undefined) {
      const trimRegEx = /(^\s|\s$)/g;
      const returnRegEx = /(\n(?!§))/g;
      // Capturing groups 1       2    3                  4
      const itemsRegEx = /(:|;|\.)(\s*)([a-z]\)|[A-Z]+\s-)(\s*)/g;
      //                         1    2                3
      const paragraphRegEx = /^(§)\s(\d+)[ºo°]?[.\s]*(-[A-z])?[\s-.]*\s*/gm;
      //                                    1               2
      const uniqueParagraphRegEx = /[\s-\n]*([.:;])?[\s-\n]*(Parágrafo\súnico)[\s-.\n]*/;

      text = text
        .replace(trimRegEx, '')
        .replace(returnRegEx, ' ')
        .replace(itemsRegEx, '$1\n$3$4')
        .replace(paragraphRegEx, Number('$2') < 10 ? '$1 $2º$3: ' : '$1 $2$3: ')
        .replace(uniqueParagraphRegEx, '$1\n$2: ');
    }
    debug(text);
    return text;
  }
  /**
   * Cleans the article number
   * @static
   * @param  {Strign} dirtyText The article text
   * @return {Strign}           The clean article number
   */
  static cleanArticleNumber(dirtyText) {
    // Capturing groups  1      2    3         4
    const numberRegEx = /(\d)\.?(\d*)(o|º|°|°)?(-[A-z])?/;
    // #-A => Exclude the thousands separator and the ordinal
    const cleanCapGroups = '$1$2$4';
    // #   => Only the numeric part
    const numberCapGroups = '$1$2';
    // -A  => Only the letter part
    const lettersCapGroups = '$4';

    return getNumber(dirtyText, numberRegEx, cleanCapGroups, numberCapGroups, lettersCapGroups);
  }

  // /**
  //  * Cleans the paragraph number
  //  * @static
  //  * @param  {Strign} dirtyText The paragraph text
  //  * @return {Strign}           The clean paragraph number
  //  */
  // static cleanParagraphNumber(dirtyText) {
  //   const uniqueParagraphRegEx = /Parágrafo\súnico/;
  //   const testMatches = dirtyText.match(uniqueParagraphRegEx);
  //   if (testMatches !== null) {
  //     return 'Parágrafo único';
  //   }
  //
  //   // Capturing groups  1    2       3
  //   const numberRegEx = /(\d+)(º|o|°)?(-[A-z])?/;
  //   // #-A => Exclude the thousands separator and the ordinal
  //   const cleanCapGroups = '$1$3';
  //   // #   => Only the numeric part
  //   const numberCapGroups = '$1';
  //   // -A  => Only the letter part
  //   const lettersCapGroups = '$3';
  //
  //   return getNumber(dirtyText, numberRegEx, cleanCapGroups, numberCapGroups, lettersCapGroups);
  // }

  /**
   * Some texts don't follow the patterns and need to be treated individually
   * @static
   * @param  {String} legislation   The name of the legislation
   * @param  {String} number The article number
   * @param  {String} text   The article text
   * @return {String}        The article text corrected
   */
  static cleanKnownSemanticErrors(legislationName, article) {
    let cleanArticle = article.article;

    if (knownSemanticErrors[legislationName] !== undefined &&
      knownSemanticErrors[legislationName][article.number] !== undefined) {
      const errorFix = knownSemanticErrors[legislationName][article.number];
      cleanArticle = errorFix(article.article);
    }

    return cleanArticle;
  }
}
module.exports = Cleaner;
