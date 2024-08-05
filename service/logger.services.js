const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { createLogger, format, transports } = require('winston');
const morgan = require('morgan');

// Ensure the logs directory exists
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Generate log filename based on current date and time
const generateLogFilename = () => {
  const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
  return path.join(logDir, `${timestamp}.log`);
};

// Create a winston logger
const logger = createLogger({
    level: 'debug', // Set the minimum log level to 'debug'
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
        )
      }),
      // new transports.File({ filename: generateLogFilename() })
    ]
  });

// Morgan middleware function to use winston for logging HTTP requests
const morganMiddleware = morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
});

module.exports = {
  logger,
  morganMiddleware
};