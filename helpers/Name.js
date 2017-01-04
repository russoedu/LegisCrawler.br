const debug = require('debug')('name');

class Name {
  static fromImageUrl(imageUrl) {
    let name = imageUrl;

    const splitName = imageUrl.split('/');
    const dirtyName = splitName[splitName.length - 1];

    const yearRegEx = /^([0-9]+)([A-z]*)([0-9]*).png/;
    const yearBeforeRegEx = /^(Anteriores)(a)([0-9]+).png/;

    if (dirtyName.match(yearRegEx)) {
      name = dirtyName.replace(yearRegEx, '$1 $2 $3').trim();
    } else if (dirtyName.match(yearBeforeRegEx)) {
      name = dirtyName.replace(yearBeforeRegEx, '$1 $2 $3').trim();
    } else {
      debug(name);
      name = dirtyName;
      // TODO OCR Needed so we can capture accented content
    }

    debug(name);
    return name;
  }
}

module.exports = Name;
