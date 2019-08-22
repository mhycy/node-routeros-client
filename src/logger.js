const util = require('util');
const chalk = require('chalk');

const LEVEL = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
}
Object.freeze(LEVEL);

class Logger {
    constructor(name, level = LEVEL.INFO) {
        this.name = name;
        this.level = level;
    }

    formatObject(item) {
        return util.inspect(item, {showHidden: true, depth: null, colors: true, breakLength: Infinity, compact: false});
    }

    error(name, error) {
        if(this.level < LEVEL.ERROR) { return; }

        if(typeof(error) === 'string') {
            error = {
                message: error
            };
        }
        
        if(error.stack) {
            console.debug(chalk.red(`[ERROR] <${this.name}>`), `[${name}] ${error.stack}`);
        } else {
            console.debug(chalk.red(`[ERROR] <${this.name}>`), `[${name}] ${error.message}`);
        }
    }

    warn(name, message) {
        if(this.level < LEVEL.WARN) { return; }
        
        if(typeof message == 'string') {
            console.info(chalk.blue(`[WARN] <${this.name}>`), `[${name}] ${message}`);
        } else {
            console.info(chalk.blue(`[WARN] <${this.name}>`), `[${name}]`);
            if(message) { console.info(message); }
        }
    }

    info(name, message) {
        if(this.level < LEVEL.INFO) { return; }

        if(typeof message == 'string') {
            console.info(chalk.blue(`[INFO] <${this.name}>`), `[${name}] ${message}`);
        } else {
            console.info(chalk.blue(`[INFO] <${this.name}>`), `[${name}]`);
            if(message) { console.info(message); }
        }
    }

    debug(name, message, ...args) {
        if(this.level < LEVEL.DEBUG) { return; }

        if(typeof message === 'string') {
            console.debug(chalk.green(`[DEBUG] <${this.name}>`), `[${name}] ${message}`);
        } else {
            console.debug(chalk.green(`[DEBUG] <${this.name}>`), `[${name}]`);
            if(message) { console.debug(this.formatObject(message)); }
        }

        for(let item of args) {
            if(typeof item != 'string') {
                console.debug(this.formatObject(item));
            } else {
                console.debug(item);
            }
        }
    }
}

function createLogger(name, level = LEVEL.INFO) {
    return new Logger(name, level);
}

module.exports = {
    LEVEL,
    createLogger
}