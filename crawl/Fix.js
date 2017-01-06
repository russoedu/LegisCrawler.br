// const debug = require('debug')('fix');
const Type = require('../models/Type');
const Clean = require('./Clean');

class Fix {
  static name(title) {
    let response = Clean.name(title);
    if (title ===
      'http://www4.planalto.gov.br/legislacao/imagens/codigos/copy3_of_CdigodeProcessoCivil2015.png'
    ) {
      response = 'Código de Processo Civil';
    } else if (title === 'Código de Processo Civil') {
      response = null;
    } else if (title === 'Veja aqui todas as leis complementares') {
      response = null;
    }
    return response;
  }

  static url(url, name) {
    let response = url;

    if (name === 'PEC - Propostas de Emenda à Constituição') {
      response = 'http://www4.planalto.gov.br/legislacao/legis-federal/' +
        'pec-propostas-de-emenda-a-constituicao-1';
    } else if (name === 'Projetos de Lei') {
      response = null;
    } else if (url === '' && name === '1.819-1, 30.4.1999') {
      response = 'http://www.planalto.gov.br/ccivil_03/mpv/Antigas/1819-1.htm';
    }
    return response;
  }

  static type(url, name, type) {
    let response = type;

    if (url === 'http://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1/medidas-provisorias/1996-a-1999' && name === 'http://www4.planalto.gov.br/legislacao/imagens/anos/1996a1999.png') {
      response = Type.LEGISLATION;
    }
    return response;
  }
}

module.exports = Fix;
