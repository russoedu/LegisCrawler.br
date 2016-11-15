const debug = require('debug')('object-to-array');

module.exports = function objectToArray(data, textName) {
  debug(data);
  const dataArray = [];
  const dataKeys = Object.keys(data);
  debug('dataKeys', dataKeys);
  dataKeys.forEach((key) => {
    const content = {};
    content.number = key;
    content[textName] = data[key];
    dataArray.push(content);
  });
  debug(dataArray);
  return dataArray;
};
