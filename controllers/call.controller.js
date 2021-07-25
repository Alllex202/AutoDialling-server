const voip = require('../voip');

module.exports.startCalling = (req, res) => {
    // todo
};

/**
 *
 * @param list {{phoneNumber: string, hours: number, minutes: number}[]}
 */
function callingOnList(list) {
    for (let el of list) {
        call(el.phoneNumber, el.hours, el.minutes)
    }
}

/**
 *
 * @param phoneNumber {string}
 * @param hours {number}
 * @param minutes {number}
 * @param callback {null | function}
 */
function call(phoneNumber, hours, minutes, callback = null) {
    voip
        .callTo(phoneNumber, hours, minutes)
        .then(res => {
            console.log(`RESULT:`, res);
            callback && callback(res);
        });
}
