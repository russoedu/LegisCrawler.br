const debug = require('debug')('name');
/**
 * Class to get the name of a legislation
 * @module Helpers
 * @class DateFormat
 */
class DateFormat {
  static brazil(inputFormat) {
    function pad(s) { return (s < 10) ? `0${s}` : s; }
    const d = new Date(inputFormat);
    return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
  }}

module.exports = DateFormat;
