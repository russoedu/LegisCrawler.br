const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const compress = require('compression');
const chalk = require('chalk');
const morgan = require('morgan');
const config = require('./config/config');
const log = require('./helpers/log');
const router = require('./router');
// const cors = require('cors');

const httpsOptions = {
  key: fs.readFileSync('./config/key.pem'),
  cert: fs.readFileSync('./config/cert.pem'),
};

const app = express();

app
  .use(compress())
  .use(favicon('./public/favicon.ico'))
  .use(morgan(config.logger.express))
  .use(express.static('public'))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }));
  // .use(cors(corsOptions));

http.createServer(app).listen(config.server.port);
https.createServer(httpsOptions, app).listen(config.server.sslPort);

log(chalk.bgBlue(`  Express listening http  on ${config.server.port}       `));
log(chalk.bgBlue(`  Express listening https on ${config.server.sslPort}       `));

router(app);
