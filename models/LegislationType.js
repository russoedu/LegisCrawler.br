const enumify = require('enumify');

class LegislationType extends enumify.Enum {}

LegislationType.initEnum(['ART', 'TEXT']);

module.exports = LegislationType;
