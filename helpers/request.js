const https = require('https');
const http = require('http');
const error = require('./error');

module.exports = function req(url) {
  // return new pending promise
  return new Promise((resolve, reject) => {
    // select http or https module, depending on reqested url
    const lib = url.startsWith('https') ? https : http;
    const hostname = url.replace(/https?:\/\//, '').split('/')[0];
    const path = url.replace(/https?:\/\//, '').replace(hostname, '');
    const timeout = 120 * 1000;
    const options = {
      hostname,
      path,
      timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36',
      },
    };

    const request = lib.get(options, (response) => {
      const statusCode = response.statusCode;

      // handle http errors
      if (statusCode < 200 || statusCode > 299) {
        reject(new Error(`Failed to load page, status code: ${response.statusCode}`));
      }

      // temporary data holder
      const body = [];
      // on every content chunk, push it to the data array
      response.on('data', chunk => body.push(chunk));
      // we are done, resolve promise with those joined chunks
      response.on('end', () => resolve(body.join('')));
    });

    request.setTimeout(30000, (err) => {
      error('request', 'Connection timed out.', err);
    });
    // handle connection errors of the request
    request.on('error', err => reject(err));
  });
};
