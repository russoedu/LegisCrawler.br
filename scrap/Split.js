const Cleaner = require('./Cleaner');
const debug = require('debug')('split');

class Split {
  /**
   * Split the article text into text and the paragraphs
  * @param  {String} type    The type of the legislation that will be splited
  * @param  {String} text    The article text
  * @return {Object}         Object with text (without the paragraphs) and an array of objects with
  *                          numbers and paragraphs
  * @example
  * {
  *   text: 'O resultado, de que depende a existência do crime, somente é imputável a quem lhe
  *          deu causa.',
  *   paragraphs: [
  *     {
  *       number: '§ 1º',
  *       text: 'A superveniência de causa relativamente independente exclui a imputação quando, por
  *              si só, produziu o resultado; os fatos anteriores, entretanto, imputam-se a quem os
  *              praticou.'
  *     },
  *     {
  *       number: '§ 2º',
  *       text: 'A omissão é penalmente relevante quando o omitente devia e podia agir para evitar o
  *              resultado. O dever de agir incumbe a quem: a) tenha por lei obrigação de cuidado,
  *              proteção ou vigilância; b) de outra forma, assumiu a responsabilidade de impedir o
  *              resultado; c) com seu comportamento anterior, criou o risco da ocorrência do
  *              resultado. '
  *     }
  *   ]
  * }
  */
  static articleParagraphs(type, articleNumber, text) {
    const numReEx = /(\.|:)((\s?§\s\d+(º|o|°)?\.?(\s?-)?[A-z]?\s?)|(\s?Parágrafo\súnico\s?-\s?))/gm;

    let workText = text;
    const testMatches = workText.match(numReEx);
    if (testMatches === null) {
      return null;
    }

    const response = {
      text: '',
      paragraphs: [],
    };

    // debug((`Type: ${type}`.blue));
    // debug(`Matches: ${testMatches} | Count: ${testMatches.length}`.green);
    for (let i = 0; i < testMatches.length; i += 1) {
      // Get only the paragraph numeric part
      workText.match(numReEx);
      const splitedText = numReEx.exec(workText);
      const textSpliter = splitedText[0];
      const cleanPart = `${workText.split(textSpliter)[0]}.`;
      const dirtyPart = workText.split(textSpliter)[1];

      if (dirtyPart) {
          // In the first iteration, the splited part is the article text
        workText = dirtyPart;
        const number = Cleaner.cleanParagraphNumber(textSpliter);
        if (i === 0) {
          // debug(`Art. ${articleNumber}: `.yellow + cleanPart);
          response.text = Cleaner.postCleaning(cleanPart);
          response.number = articleNumber;
          response.paragraphs[i] = {
            number,
            paragraph: Cleaner.postCleaning(dirtyPart),
          };
        } else {
          response.paragraphs[i - 1].paragraph = Cleaner.postCleaning(cleanPart);
          response.paragraphs[i] = {
            number,
          };
          if (i < testMatches.length) {
            response.paragraphs[i].paragraph = Cleaner.postCleaning(dirtyPart);
          }
        }
      }
    }
    debug(response);
    return response;
  }
}

module.exports = Split;
