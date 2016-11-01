const express = require('express');
const morgan = require('morgan');
// const cors = require('cors');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const compress = require('compression');
const colors = require('colors');

const config = require('./config/config');
const logger = require('./helpers/logger');

const router = require('./router');

const app = express();

app
  .set('port', config.server.port)
  .use(compress())
  .use(favicon('./public/favicon.ico'))
  .use(morgan(config.logger.express))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }));
  // .use(cors(corsOptions));

app.listen(config.server.port, () => {
  logger.info(colors.blue('[express.server.environment]', config.env));
  logger.info(colors.blue(`[express.server.port] ${app.get('port')}`));
});

router(app);
