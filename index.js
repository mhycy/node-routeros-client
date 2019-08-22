const Logger = require('./src/logger.js');
const Utils = require('./src/utils.js');
const CommmandBuilder = require('./src/command-builder.js');
const Client = require('./src/client.js');


function createClient(options) {   
    return new Client(options);
}

module.exports = {
    Logger,
    Utils,
    CommmandBuilder,
    Client,
    
    LogLevel: Logger.LEVEL,
    createClient
};