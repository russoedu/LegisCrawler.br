const express = require('express');
const pmx = require('pmx').init({
  http: true, // HTTP routes logging (default: true)
  errors: true, // Exceptions loggin (default: true)
  custom_probes: true, // Auto expose JS Loop Latency and HTTP req/s as custom metrics
  network: true, // Network monitoring at the application level
});
const http = require('http');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const compress = require('compression');
const chalk = require('chalk');
const morgan = require('morgan');
const config = require('./config/config');
const log = require('./helpers/log');
const router = require('./helpers/router');
const cors = require('cors');

const corsOptions = {
  origin: '*',
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Content-Length',
    'X-Requested-With',
    'X-HTTP-Method-Override',
  ],
  methods: [
    'GET', 'OPTIONS',
  ],
};

// const httpsOptions = {
//   key: fs.readFileSync('./config/key.pem'),
//   cert: fs.readFileSync('./config/cert.pem'),
// };

const app = express();

app
  .use(compress())
  .use(favicon('./public/favicon.ico'))
  .use(morgan(config.logger.express))
  .use(express.static('public'))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({
    extended: true,
  }))
  .use(cors(corsOptions));

http.createServer(app).listen(config.server.port);

log(chalk.bgBlue(`  Express listening http  on ${config.server.port}       `));

router(app);
