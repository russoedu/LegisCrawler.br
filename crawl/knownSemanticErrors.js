module.exports = [
  {
    type: 'Código Penal',
    number: '129',
    fix(tx) {
      return tx.replace('121.Violência Doméstica § 9o', '121.§ 9o');
    },
    // Código Civil - 1620 => Art. 1.620. a 1.629. (Revogados pela Lei nº 12.010, de 2009)
  },
];
