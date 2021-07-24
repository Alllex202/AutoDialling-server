const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
// const fs = require("fs");
const {Readable} = require('stream');
const {IamAuthenticator} = require('ibm-watson/auth');

const speechToText = new SpeechToTextV1({
    authenticator: new IamAuthenticator({
        apikey: '8qHBUV5dhxNd7Q4bNHqP5NKP-NOE_lxj3OvQ-bdxdyX-',
    }),
    serviceUrl: 'https://api.eu-gb.speech-to-text.watson.cloud.ibm.com/instances/9f889f5e-08b2-4df0-a27b-264989a4ee92',
});

/**
 *
 * @param binary {BinaryType}
 * @returns {Promise<boolean | null>}
 */
async function speechToTextFromBinaryToBool(binary) {
    return new Promise((resolve, reject) => {

        const recognizeStream = speechToText.recognizeUsingWebSocket({
            contentType: 'audio/wav',
            objectMode: true,
            model: `en-US_Telephony`,
            interimResults: false,  // По частям
            lowLatency: false,  // По частям (но еще чаще)
            backgroundAudioSuppression: 0.3,  // Подавление шума
        });

        recognizeStream.on('data', function (event) {
            const res = event?.results[0]?.alternatives[0]?.transcript;
            console.log(`Распознали речь - ${res}`);
            recognizeStream.removeAllListeners();
            resolve(getBoolResult(res));
        });
        recognizeStream.on('error', function (event) {
            console.log('Error:', event?.raw?.data);
            reject(event?.raw);
        });
        recognizeStream.on('close', function (event) {
            console.log('Close:', event);
        });

        const stream = Readable.from([binary]);

        stream.pipe(recognizeStream);
    });
}

function getBoolResult(result) {
    if (result) {
        const words = result.split(' ');
        for (let word of words) {
            word = word.toLowerCase();
            if (word === 'yes') {
                return true;
            }
            if (word === 'no' || word === 'not') {
                return false;
            }
        }
    }
    return null;
}

function getRandomBool() {
    return Math.random() < 0.5;
}

module.exports.speechToTextFromBinaryToBool = speechToTextFromBinaryToBool;