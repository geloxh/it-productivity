const app = require('./app');
const logger = require('../config/logger');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});

process.on('uncaughtException', (err) => {
    logger.fatal(err, 'Uncaught exception');
});

process.on('unhandledRejection', (err) => {
    logger.fatal(err, 'UNhandled rejection');
    process.exit(1);
});