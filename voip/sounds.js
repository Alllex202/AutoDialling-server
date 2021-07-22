const serverConfig = require('../config/server.config');

module.exports = {
    hello: `sound:http://${serverConfig.hostname}:${serverConfig.port}/hello`,
    signal: `sound:http://${serverConfig.hostname}:${serverConfig.port}/signal`,
    operator: `sound:http://${serverConfig.hostname}:${serverConfig.port}/operator`,
    question: `sound:http://${serverConfig.hostname}:${serverConfig.port}/question`,
};