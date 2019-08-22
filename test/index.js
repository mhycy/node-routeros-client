const Logger = require('../src/logger.js');
const RouterClient = require('../index.js');

const logger = Logger.createLogger("@mhycy/routeros-client/test/index.js", Logger.LEVEL.DEBUG);

const USER = "admin";
const PASSWD = "test";

// connect options
const connectOptions = {
    host: '192.168.1.254',
    // port: 8728,
    // encoding: 'gbk',
    debug: true
};

logger.info("<Params> ConnectOptions", connectOptions);
const client = RouterClient.createClient(connectOptions);

(async function() {
    logger.info(`<Test> Client::Login('${USER}', '${PASSWD}')`);
    await client.login(USER, PASSWD);

    logger.info(`<Test> Client::Command('/login')`);
    await client.command("/login").setAttrs({
        name: USER,
        password: PASSWD
    }).get();
    
    logger.info(`<Test> Client::Command('/interface/print')`);
    await client.command("/interface/print")
            .equal("type", "pppoe-out")
            .get();

    client.close();
})();