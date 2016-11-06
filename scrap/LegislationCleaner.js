const debug = require('debug')('scrap-cleaner');
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

  // debug(`dirtyText = "${chalk.yellow(dirtyText)}"
  //               getNumber = "${chalk.green(content)}"`);
  return content;
}
/**
 * Class
 */
class LegislationCleaner {
  /**
   * Pre cleaning function removes all double spaces and text things tha shoudn't be there
   * @static
   * @param  {Strign} dirtyText The full text
   * @return {Strign}           The clean text
   */
  static preCleaning(dirtyText) {
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

  /**
   * Post cleaning function trims the text and add line breaks before items
   * @static
   * @param  {String} originsText The text already cleaned by preCleaning
   * @return {String}             The trimmed text with line breaks on items
   */
  static postCleaning(originsText) {
    const beginningTrimRegEx = /^\s/g;
    const endTrimRegEx = /\s$/g;
    // Capturing groups 1       2    3                   4
    const itemsRegEx = /(:|;|\.)(\s?)([a-z]\)|[A-Z]+\s\-)(\s?)/g;

    let text = originsText;
    text = text
      .replace(beginningTrimRegEx, '')
      .replace(endTrimRegEx, '')
      .replace(itemsRegEx, '$1\n$3$4');

    return text;
  }
  /**
   * Cleans the article number
   * @static
   * @param  {Strign} dirtyText The article text
   * @return {Strign}           The clean article number
   */
  static cleanArticleNumber(dirtyText) {
    // Capturing groups  1      2    3       4
    const numberRegEx = /(\d)\.?(\d*)(o|º|°)?(\-[A-z])?/;
    // #-A => Exclude the thousands separator and the ordinal
    const cleanCapGroups = '$1$2$4';
    // #   => Only the numeric part
    const numberCapGroups = '$1$2';
    // -A  => Only the letter part
    const lettersCapGroups = '$4';

    return getNumber(dirtyText, numberRegEx, cleanCapGroups, numberCapGroups, lettersCapGroups);
  }

  /**
   * Cleans the paragraph number
   * @static
   * @param  {Strign} dirtyText The paragraph text
   * @return {Strign}           The clean paragraph number
   */
  static cleanParagraphNumber(dirtyText) {
    const uniqueParagraphRegEx = /Parágrafo\súnico/;
    const testMatches = dirtyText.match(uniqueParagraphRegEx);
    if (testMatches !== null) {
      return 'Parágrafo único';
    }

    // Capturing groups  1    2       3
    const numberRegEx = /(\d)+(º|o|°)?(\-[A-z])?/;
    // #-A => Exclude the thousands separator and the ordinal
    const cleanCapGroups = '$1$3';
    // #   => Only the numeric part
    const numberCapGroups = '$1';
    // -A  => Only the letter part
    const lettersCapGroups = '$3';

    return getNumber(dirtyText, numberRegEx, cleanCapGroups, numberCapGroups, lettersCapGroups);
  }

  /**
   * Some texts don't follow the patterns and need to be treated individually
   * @static
   * @param  {String} type   The type of legislation
   * @param  {String} number The article number
   * @param  {String} text   The article text
   * @return {String}        The article text corrected
   */
  static cleanKnownSemanticErrors(type, number, text) {
    let fixedText = text;

    knownSemanticErrors.forEach((error) => {
      if (type === error.type && number === error.number) {
        fixedText = error.fix(text);
        debug(`dirtyText = "${chalk.yellow(text)}"\ncleanText = "${chalk.green(fixedText)}"`);
      }
    });
    return fixedText;
  }
}
module.exports = LegislationCleaner;
