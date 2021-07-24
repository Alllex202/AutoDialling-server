const voip = require('../voip');

async function callingOnList(list) {
    for (let el of list) {
        await voip
            .callTo(num, 12, 50)
            .then(res => {
                // Запись в БД
            });
    }
}

module.exports.callingOnList = callingOnList;