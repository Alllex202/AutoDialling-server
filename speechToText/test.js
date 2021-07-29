const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const fs = require('fs');
const {watsonStudio} = require('../config/speechToText.config');

const speechToText = new SpeechToTextV1({
    authenticator: new IamAuthenticator({
        apikey: watsonStudio.apikey,
    }),
    serviceUrl: watsonStudio.serviceUrl,
});

// speechToText.listModels()
//     .then(speechModels => {
//         console.log(JSON.stringify(speechModels.result.models, null, 2));
//     })
//     .catch(err => {
//         console.log('error:', err);
//     });

/*
    This code will print the entire response to the console when it
    receives the 'data' event. Some applications will want to write
    out only the transcribed text, to the console or to a file.
    To do this, remove `objectMode: true` from the `params` object.
    Then, uncomment the block of code at Line 30.
*/

// create the stream
const recognizeStream = speechToText.recognizeUsingWebSocket({
    contentType: 'audio/wav',
    objectMode: true,
    model: `en-US_Telephony`,
    interimResults: true,  // По частям
    lowLatency: true,  // По частям (но еще чаще)
    backgroundAudioSuppression: 0.3,  // Подавление шума
});

// pipe in some audio
fs.createReadStream(__dirname + '/resources/voice.wav').pipe(recognizeStream);

/*
// these two lines of code will only work if `objectMode` is `false`
// pipe out the transcription to a file
recognizeStream.pipe(fs.createWriteStream('transcription.txt'));
// get strings instead of Buffers from `data` events
recognizeStream.setEncoding('utf8');
*/

recognizeStream.on('data', function (event) {
    console.log(event.results[0].alternatives[0].transcript);
});
recognizeStream.on('error', function (event) {
    onEvent('Error:', event.raw.data);
});
recognizeStream.on('close', function (event) {
    onEvent('Close:', event);
});

// Displays events on the console.
function onEvent(name, event) {
    console.log(name, JSON.stringify(event, null, 2));
}
//
// // const a = fs.createReadStream(__dirname + '/resources/voice.wav');
// // console.log(a);

// const fs = require("fs");
//
// let readableStream = fs.createReadStream(__dirname + '/resources/voice.wav');
//
// let writeableStream = fs.createWriteStream(__dirname + '/resources/res.txt');
//
// // readableStream.on("data", function(chunk){
// //     console.log(chunk);
// // });
//
// readableStream.pipe(writeableStream);