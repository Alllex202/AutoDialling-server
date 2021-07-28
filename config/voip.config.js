module.exports = {
    host: process.env.ASTERISK_HOST || 'http://10.0.0.14:8088/',
    user: process.env.ASTERISK_USER || 'test',
    password: process.env.ASTERISK_PASSWORD || 'test',
    appName: process.env.ASTERISK_APPNAME || 'AutoDialling',
    callerName: process.env.ASTERISK_CALLERNAME || 'TESTER',
    concurrentCallLimit: 1,
    attemptedCalls: 2,
    delaysBetweenCallsSec: 10,
};