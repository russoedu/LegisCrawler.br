const enumify = require('enumify');

class Type extends enumify.Enum {
}

Type.initEnum(['LEGISLATION', 'PDF', 'DOC', 'LIST']);

module.exports = Type;
