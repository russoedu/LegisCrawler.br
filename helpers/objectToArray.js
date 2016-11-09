const debug = require('debug')('object-to-array');

module.exports = function objectToArray(data) {
  debug(data);
  const dataArray = [];
  const dataKeys = Object.keys(data);
  debug('dataKeys', dataKeys);
  dataKeys.forEach((key) => {
    dataArray.push({
      number: key,
      article: data[key],
    });
  });
  debug(dataArray);
  return dataArray;
};
