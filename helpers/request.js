const https = require('https');
const http = require('http');
const error = require('./error');

module.exports = function req(url) {
  // return new pending promise
  return new Promise((resolve, reject) => {
    const options = {
      // Add a borwser user agent
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36',
      },
      // Allow unknown certificates, as the HTTPS urls use an unknown certification authority (Autoridade Certificadora da Presidencia da Republica)
      rejectUnauthorized: false,
    };

    // select http or https module, depending on reqested url
    if (typeof url === 'object') {
      Object.keys(url).forEach((i) => {
        options[i] = url[i];
      });
    } else {
      options.url = url;
    }
    const lib = options.url.startsWith('https') ? https : http;
    options.hostname = options.url.replace(/https?:\/\//, '').split('/')[0];
    options.path = options.url.replace(/https?:\/\//, '').replace(options.hostname, '');
    options.timeout = 300 * 1000;

    const request = lib.get(options, (response) => {
      const statusCode = response.statusCode;
      const body = [];

      if (options.encoding) {
        response.setEncoding(options.encoding);
      }
      request.setTimeout(options.timeout, (err) => {
        error('request', 'Connection timed out.', err);
      });

      // handle http errors
      if (statusCode < 200 || statusCode > 299) {
        reject(new Error(`Failed to load page, status code: ${response.statusCode}`));
      }

      // on every content chunk, push it to the data array
      response.on('data', chunk => body.push(chunk));
      // we are done, resolve promise with those joined chunks
      response.on('end', () => resolve(body.join('')));
    });

    // handle connection errors of the request
    request.on('error', (err) => {
      error('request', 'request error', err);
      setTimeout(() => {
        req(url);
      }, 1000);
      // reject(err);
    });
  });
};
