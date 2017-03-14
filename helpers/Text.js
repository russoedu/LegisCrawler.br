const debug = require('debug')('name');
// const diacriticsMap = require('./diacriticsMap');

/**
 * Convert all first letter to uppercase but "da, de and do"
 * @method toTitleCase
 * @private
 * @param  {String} str The text to be converted
 * @return {String}     the converted text
 */
function toTitleCase(str) {
  const glue = ['a', 'e', 'o', 'até', 'da', 'de', 'do', 'das', 'dos', 'com', 'em', 'no', 'na'];
  return str.replace(/(\w)(\w*)/g, (_, i, r) => {
    const j = i.toUpperCase() + (r != null ? r : '');
    return (glue.indexOf(j.toLowerCase()) < 0) ? j : j.toLowerCase();
  });
}

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
    .replace('crianca', 'Criança')
    .replace('indio', 'Índio')
    .replace('EstatutodaPessoacomDeficincia', 'Estatuto da Pessoa com Deficiência')
    .replace('codigo', 'Código')
    .replace('tributario', 'Tributário')
    .replace('consolidacao', 'Consolidação')
    .replace('transito', 'Trânsito')
    .replace('aguas', 'Águas')
    .replace('aeronautica', 'Aeronáutica')
    .replace('telecomunicacoes', 'Telecomunicações')
    .replace('brasil', 'Brasil');

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
    // TODO tudo que não for "de, do, da" deve ter a primeira em caixa alta
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
      name = toTitleCase(dirtyName);
      name = correctImageName(name);
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
}

module.exports = Text;
