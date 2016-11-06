module.exports = [
  {
    type: 'Código Penal',
    number: '129',
    fix(tx) {
      return tx.replace('121.Violência Doméstica § 9o', '121.§ 9o');
    },
  },
];
