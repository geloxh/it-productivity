require('dotenv').config();
const app = require('./app');
const logger = require('../config/logger');
const connectDB = require('../config/database');

const PORT = process.env.PORT || 3001;

// Connect to database
connectDB();

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

process.on('uncaughtException', (err) => {
  logger.fatal(err, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.fatal(err, 'Unhandled rejection');
  process.exit(1);
});
