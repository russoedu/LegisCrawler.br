const express = require('express');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const compress = require('compression');
const chalk = require('chalk');
const config = require('./config/config');
const log = require('./helpers/log');
const router = require('./router');
// const cors = require('cors');

const app = express();

app
  .set('port', config.server.port)
  .use(compress())
  .use(favicon('./public/favicon.ico'))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }));
  // .use(cors(corsOptions));

app.listen(config.server.port, () => {
  log(chalk.blue('[express.server.environment]', config.env));
  log(chalk.blue(`[express.server.port] ${app.get('port')}`));
});

router(app);
