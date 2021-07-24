// const client = require('ari-client');
// const sounds = require('./sounds');
// const {speechToTextFromBinary} = require('../speechToText');
//
// class VoIP {
//     /**
//      *
//      * @param voipConfig {{
//      * host: string,
//      * user: string,
//      * password: string,
//      * appName: string,
//      * callerName: string
//      * }}
//      */
//     constructor(voipConfig) {
//         this.config = voipConfig;
//     }
//
//     async connect() {
//         this.ari = await client
//             .connect(this.config.host, this.config.user, this.config.password)
//         await this.ari.start(this.config.appName);
//     }
//
//     async callTo(number, hours = 10, minutes = 50) {
//         return new Promise((resolve, reject) => {
//             const ari = this.ari;
//             let result = null;
//             let operator = null;
//             let callbackDone = false;
//
//             const channel = createChannel(ari);
//
//             callToEndpoint(number, this.config.appName, this.config.callerName);
//
//             function createChannel(ari) {
//                 const channel = ari.Channel();
//                 channel.on('StasisStart', stasisStart);
//                 channel.on('StasisEnd', stasisEnd);
//                 channel.on('ChannelDestroyed', channelDestroyed);
//                 return channel;
//             }
//
//             function stasisStart(event, channel) {
//                 console.log(`Трубку подняли - Channel id: ${channel?.id}`);
//
//                 runDialog();
//             }
//
//             function stasisEnd(event, channel) {
//                 console.log(`Разговор завершен - Channel id: ${channel?.id}`);
//
//                 ari.channels.get({channelId: channel.id})
//                     .then(channel => channel.hangup());
//
//                 runCallbackCall();
//             }
//
//             function channelDestroyed(event, channel) {
//                 console.log(`Соединение прервано - Channel id: ${channel?.id}`);
//                 runCallbackCall();
//             }
//
//             function callToEndpoint(endpoint, app, callerId) {
//                 channel.originate({
//                     endpoint,
//                     app,
//                     callerId,
//                     // channelId: '123',
//                 }, (err, _) => {
//                     console.log(`Пытаемся дозвониться до ${endpoint} из ${channel?.id}`);
//                     if (err) {
//                         console.log(`Неудалось дозвониться до ${endpoint} из ${channel?.id}`);
//                         runCallbackCall();
//                     }
//                 });
//             }
//
//             function play(sound, callbackStarted, callbackFinished, delay = 0) {
//                 setTimeout(() => {
//
//                     channel.play({media: sound}, function (err, playback) {
//                         if (err) {
//                             // throw err;
//                         }
//                         if (!playback) {
//                             return;
//                         }
//                         playback.on('PlaybackStarted', function (event, playback) {
//                             console.log(`Началось воспроизведение звука: ${sound} - Channel Id ${channel?.id}`);
//                             if (callbackStarted) {
//                                 callbackStarted(playback);
//                             }
//                         });
//
//                         playback.on('PlaybackFinished', function (event, playback) {
//                             console.log(`Закончилось воспроизведение звука: ${sound} - Channel Id ${channel?.id}`);
//                             if (callbackFinished) {
//                                 callbackFinished(playback);
//                             }
//                         });
//                     });
//                 }, delay);
//             }
//
//             function recordingVoice(beep, callbackStarted, callbackFinished, delay = 0) {
//                 setTimeout(() => {
//                     ari.channels.record({
//                         channelId: channel.id,
//                         beep,
//                         format: 'wav',
//                         maxDurationSeconds: 3,
//                         name: `recordAnswer_${Date.now().toString()}_${VoIP.getRandomInt(1000000, 9999999)}`,
//                     }, (err, liveRecording) => {
//                         if (err) {
//                             // throw err;
//                         }
//                         if (!liveRecording) {
//                             return;
//                         }
//
//                         liveRecording.on('RecordingStarted', (event, recording) => {
//                             console.log(`Начало записи ответа - channel id: ${channel?.id}, recordName: ${recording?.name}`);
//                             if (callbackStarted) {
//                                 callbackStarted(recording);
//                             }
//                         });
//                         liveRecording.on('RecordingFinished', (event, recording) => {
//                             console.log(`Окончание записи ответа - channel id: ${channel?.id}, recordName: ${recording?.name}`);
//                             if (callbackFinished) {
//                                 callbackFinished(recording);
//                             }
//                         });
//                     });
//                 }, delay);
//             }
//
//             function recordingToText(recording, callback) {
//                 ari.recordings.getStoredFile(
//                     {recordingName: recording.name},
//                     function (err, binary) {
//                         if (err) {
//                             // throw err;
//                         }
//                         console.log(`Пытаемся распознать речь - recordName: ${recording?.name}`);
//                         speechToTextFromBinary(binary)
//                             .then(result => {
//                                 console.log(`Мы распознали речь - recordName: ${recording?.name}, result: ${result}`);
//                                 if (callback) {
//                                     callback(result);
//                                 }
//                             })
//                             .catch(err => {
//
//                             });
//                     }
//                 );
//             }
//
//             function runDialog() {
//                 sayGreetingAndAskQuestionMeeting(() => {
//                     tryGetAnswer(
//                         () => {
//                             result = true;
//                             endingCall();
//                         },
//                         () => {
//                             result = false;
//                             askQuestionOperator(() => {
//                                 tryGetAnswer(
//                                     () => {
//                                         operator = true;
//                                         transferToOperator();
//                                     },
//                                     () => {
//                                         operator = false;
//                                         endingCall();
//                                     });
//                             });
//                         }
//                     );
//                 });
//             }
//
//             function sayGreetingAndAskQuestionMeeting(callback) {
//                 play(sounds.hello, null, () => {
//                     play(`number:${hours}`, null, () => {
//                         play(`number:${minutes}`, null, () => {
//                             play(sounds.question, null, () => {
//                                 if (callback) {
//                                     callback(null);
//                                 }
//                             }, 100);
//                         }, 100);
//                     }, 300);
//                 }, 1000);
//             }
//
//             function askQuestionOperator(callback) {
//                 play(sounds.operator, null, () => {
//                     if (callback) {
//                         callback(null);
//                     }
//                 }, 500);
//             }
//
//             function tryGetAnswer(callbackTrue, callbackFalse) {
//                 recordingVoice(true, null, (recording) => {
//                     recordingToText(
//                         recording,
//                         result => {
//                             if (result === true) {
//                                 if (callbackTrue) {
//                                     callbackTrue(null);
//                                 }
//                             } else if (result === false) {
//                                 if (callbackFalse) {
//                                     callbackFalse(null);
//                                 }
//                             } else {
//                                 console.log(`Повторите еще раз свой ответ - channelId: ${channel.id}`);
//                                 play('sound:confbridge-pin-bad', null, () => {
//                                     tryGetAnswer(callbackTrue, callbackFalse);
//                                 }, 100);
//                             }
//                         });
//                 }, 500);
//             }
//
//             function endingCall() {
//                 runCallbackCall();
//                 play('sound:goodbye', null, () => {
//                     console.log(`Программа заканчивает разговор - channelId: ${channel.id}`);
//                     ari.channels.get({channelId: channel.id})
//                         .then(channel => channel.hangup((err) => {
//                             if (err) {
//                                 // throw err;
//                             }
//                             console.log(`Здесь программа положила трубку`);
//                         }));
//                 }, 300);
//             }
//
//             function transferToOperator() {
//                 runCallbackCall();
//                 console.log(`Перевод на оператора - channelId: ${channel.id}`);
//                 play('sound:hello-world', null, () => {
//                     console.log(`Типа ответил оператор - channelId: ${channel.id}`);
//                     ari.channels.get({channelId: channel.id})
//                         .then(channel => channel.hangup((err) => {
//                             if (err) {
//                                 // throw err;
//                             }
//                             console.log(`Здесь программа положила трубку`);
//                         }));
//
//                 }, 300)
//             }
//
//             function runCallbackCall() {
//                 if (!callbackDone) {
//                     callbackDone = true;
//                     // callbackCall(result, operator);
//                     resolve({result, operator});
//                 }
//             }
//         });
//     }
//
//     private static getRandomInt(min, max) {
//         min = Math.ceil(min);
//         max = Math.floor(max);
//         return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
//     }
//
// }
//
// module.exports.VoIP = VoIP;