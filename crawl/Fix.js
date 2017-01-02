class Fix {
  static mainLegislationPage(title, url) {
    let response = '';
    if (title === 'PEC - Propostas de Emenda à Constituição') {
      response = 'http://www4.planalto.gov.br/legislacao/legis-federal/' +
        'pec-propostas-de-emenda-a-constituicao-1';
    } else if (title === 'Projetos de Lei') {
      response = null;
    } else {
      response = url;
    }

    return response;
  }
  static name(title) {
    let response = title;
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

    if (url === '' && name === '1.819-1, 30.4.1999') {
      response = 'http://www.planalto.gov.br/ccivil_03/mpv/Antigas/1819-1.htm';
    }
    return response;
  }
}

module.exports = Fix;
