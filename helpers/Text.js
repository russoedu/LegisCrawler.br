const debug = require('debug')('name');
// const diacriticsMap = require('./diacriticsMap');
/**
 * Transform no accent, dash separated text in the correct legislation name
 * @method correctImageName
 * @param  {String} name The original image file name
 * @return {String}      The legislation name
 * @private
 */
function correctImageName(name) {
  const correctName = name
    .split('.')[0]
    .split('-')
    .join(' ')
    .replace('estatuto', 'Estatuto')
    .replace('crianca', 'criança')
    .replace('indio', 'índio')
    .replace('EstatutodaPessoacomDeficincia', 'Estatuto da pessoa com deficiência')
    .replace('codigo', 'Código')
    .replace('tributario', 'tributário')
    .replace('consolidacao', 'Consolidação')
    .replace('transito', 'trânsito')
    .replace('aguas', 'águas')
    .replace('aeronautica', 'aeronáutica')
    .replace('telecomunicacoes', 'telecomunicações')
    .replace('brasil', 'Brasil')
    .replace('Brasileiro', 'brasileiro');
  return correctName;
}

/**
 * Class to get the name of a legislation
 * @module Crawler
 * @class Text
 */
class Text {

  /**
   * Transform no accent, dash separated text in the correct legislation name
   * @method fromImageUrl
   * @param  {String} imageUrl The original URL of the image
   * @return {String}          The legislation name
   * @static
   */
  static fromImageUrl(imageUrl) {
    const yearRegEx = /^([0-9]+)([A-z]*)([0-9]*).png/;
    const yearBeforeRegEx = /^(Anteriores)(a)([0-9]+).png/;

    let name = imageUrl;

    const splitName = imageUrl.split('/');
    const dirtyName = splitName[splitName.length - 1];

    if (dirtyName.match(yearRegEx)) {
      name = dirtyName.replace(yearRegEx, '$1 $2 $3').trim();
    } else if (dirtyName.match(yearBeforeRegEx)) {
      name = dirtyName.replace(yearBeforeRegEx, '$1 $2 $3').trim();
    } else {
      name = correctImageName(dirtyName);
      debug(name);
    }

    return name;
  }

  static spacedNumberWithComma(number) {
    let spaces = '          ';
    let sliceVal = -10;

    if (global.processed > 1000) {
      spaces = '         ';
      sliceVal = -9;
    } else if (global.processed > 10000000) {
      spaces = '        ';
      sliceVal = -8;
    }
    // [PROCESSING]      358 legislations scraped
    const processed = String(spaces + number).slice(sliceVal);
    return processed.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  static numberWithComma(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // static slug(word) {
  //   return word
  //     .toLowerCase()
  //     .replace(/-+/g, '')
  //     .replace(/\s+/g, '-')
  //     // .replace(/[^a-z0-9-]/g, '');
  //     .replace(/[^\u0000-\u007E]/g, a => diacriticsMap[a] || a);
  // }
}

module.exports = Text;
