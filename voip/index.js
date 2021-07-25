const client = require('ari-client');
const voipConfig = require('../config/voip.config');
const sounds = require('./sounds');
const {speechToTextFromBinaryToBool} = require('../speechToText');
const {Queue} = require('../queue');

const app = voipConfig.appName;
const callerName = voipConfig.callerName;

const queue = new Queue(voipConfig.callLimit);

let ari;

// connect()

/**
 *
 * @returns {Promise<ari>}
 */
async function connect() {
    ari = await client
        .connect(voipConfig.host, voipConfig.user, voipConfig.password);
    await ari.start(app);
    return ari;
}

/**
 *
 * @param number {string}
 * @param hours {number}
 * @param minutes {number}
 * @returns {Promise<*|undefined>}
 */
async function callTo(number, hours = 10, minutes = 50) {
    return queue.enqueue(() => _call(number, hours = 10, minutes = 50));
}

/**
 *
 * @param number {string}
 * @param hours {number}
 * @param minutes {number}
 * @returns {Promise<{result: boolean | null, operator: boolean | null}>}
 */
async function _call(number, hours = 10, minutes = 50) {
    return new Promise((resolve, reject) => {
        let result = null;
        let operator = null;
        let isReturnedResult = false;

        const channel = createChannel(ari);

        callToEndpoint(number, app, callerName);

        function createChannel(ari) {
            const channel = ari.Channel();
            channel.on('StasisStart', stasisStart);
            channel.on('StasisEnd', stasisEnd);
            channel.on('ChannelDestroyed', channelDestroyed);
            return channel;
        }

        function stasisStart(event, channel) {
            console.log(`Трубку подняли - Channel id: ${channel.id}`);

            runDialog();
        }

        function stasisEnd(event, channel) {
            console.log(`Разговор завершен - Channel id: ${channel.id}`);

            ari.channels.get({channelId: channel.id})
                .then(channel => channel.hangup())
                .catch(err => {
                    // console.log(1, err);
                });

            returnResult();
        }

        function channelDestroyed(event, channel) {
            console.log(`Соединение прервано - Channel id: ${channel.id}`);
            returnResult();
        }

        function callToEndpoint(endpoint, app, callerId) {
            channel.originate({
                endpoint,
                app,
                callerId,
                // channelId: '123',
            }, (err, _) => {
                console.log(`Пытаемся дозвониться до ${endpoint} из ${channel?.id}`);
                if (err) {
                    console.log(`Неудалось дозвониться до ${endpoint} из ${channel?.id}`);
                    returnResult();
                }
            });
        }

        /**
         *
         * @param sound {string}
         * @param callbackStarted {Function | null}
         * @param delay {?number}
         * @returns {Promise<{playback}>}
         */
        async function play(sound, callbackStarted, delay = 0) {
            return new Promise((resolve1, reject1) => {
                setTimeout(() => {
                    channel.play({media: sound}, function (err, playback) {
                        if (err) {
                            reject1(err);
                        }
                        if (!playback) {
                            // reject1();
                            return;
                        }
                        playback.on('PlaybackStarted', function (event, playback) {
                            console.log(`Началось воспроизведение звука: ${sound} - Channel Id ${channel.id}`);
                            if (callbackStarted) {
                                callbackStarted(playback);
                            }
                        });

                        playback.on('PlaybackFinished', function (event, playback) {
                            console.log(`Закончилось воспроизведение звука: ${sound} - Channel Id ${channel.id}`);
                            resolve1(playback);
                        });
                    });
                }, delay);
            })
        }

        /**
         *
         * @param beep {boolean}
         * @param callbackStarted {Function | null}
         * @param delay {number}
         * @returns {Promise<{recording}>}
         */
        async function recordingVoice(beep, callbackStarted, delay = 0) {
            return new Promise((resolve1, reject1) => {
                setTimeout(() => {
                    ari.channels.record({
                        channelId: channel.id,
                        beep,
                        format: 'wav',
                        maxDurationSeconds: 3,
                        name: `recordAnswer_${Date.now().toString()}_${getRandomInt(1000000, 9999999)}`,
                    }, (err, liveRecording) => {
                        if (err) {
                            reject1(err);
                            // throw err;
                        }
                        if (!liveRecording) {
                            reject1();
                            return;
                        }

                        liveRecording.on('RecordingStarted', (event, recording) => {
                            console.log(`Начало записи ответа - channel id: ${channel.id}, recordName: ${recording.name}`);
                            if (callbackStarted) {
                                callbackStarted(recording);
                            }
                        });
                        liveRecording.on('RecordingFinished', (event, recording) => {
                            console.log(`Окончание записи ответа - channel id: ${channel.id}, recordName: ${recording.name}`);
                            resolve1(recording);

                            // if (callbackFinished) {
                            //     callbackFinished(recording);
                            // }
                        });
                    });
                }, delay);
            });
        }

        /**
         *
         * @param recording {'recording'}
         * @returns {Promise<boolean | null>}
         */
        async function recordingToTextToBool(recording) {
            return new Promise((resolve1, reject1) => {
                ari.recordings.getStoredFile({recordingName: recording.name})
                    .then(binary => {
                        console.log(`Пытаемся распознать речь - recordName: ${recording.name}`);
                        speechToTextFromBinaryToBool(binary)
                            .then(result => {
                                console.log(`Мы распознали речь - recordName: ${recording.name}, result: ${result}`);
                                resolve1(result);

                                // if (callback) {
                                //     callback(result);
                                // }
                            })
                            .catch(err => {
                                // console.log(1, err)
                                reject1(err);
                            });
                    })
                    .catch(err => {
                        // console.log(2, err)
                        reject1(err);
                    });
            });
        }

        function runDialog() {
            sayGreetingAndAskQuestionMeeting()
                .then(() => {
                    tryGetAnswer(
                        () => {
                            result = true;
                            endingCall();
                        },
                        () => {
                            result = false;
                            askQuestionOperator()
                                .then(() => {
                                    tryGetAnswer(
                                        () => {
                                            operator = true;
                                            transferToOperator();
                                        },
                                        () => {
                                            operator = false;
                                            endingCall();
                                        });
                                })
                                .catch(err => {
                                    // console.log(2, err);
                                });
                        }
                    );
                })
                .catch(err => {
                    // console.log(3, err);
                });

        }

        function sayGreetingAndAskQuestionMeeting(callback) {
            // play(sounds.hello, null, () => {
            //     play(`number:${hours}`, null, () => {
            //         play(`number:${minutes}`, null, () => {
            //             play(sounds.question, null, () => {
            //                 if (callback) {
            //                     callback(null);
            //                 }
            //             }, 100);
            //         }, 100);
            //     }, 300);
            // }, 1000);

            // SHORT
            // return play(sounds.question, null, 1000)
            //     // .then(() => play(`number:${hours}`, null, 300))
            //     // .then(() => play(`number:${minutes}`, null, 100))
            //     // .then(() => play(sounds.question, null, 100))
            //     .catch(err => {
            //         // console.log(4, err);
            //     });

            return play(sounds.hello, null, 1000)
                .then(() => play(`number:${hours}`, null, 300))
                .then(() => play(`number:${minutes}`, null, 100))
                .then(() => play(sounds.question, null, 100))
                .catch(err => {
                    // console.log(4, err);
                });
        }

        function askQuestionOperator() {
            return play(sounds.operator, null, 500);

            // play(sounds.operator, null, () => {
            //     if (callback) {
            //         callback(null);
            //     }
            // }, 500);
        }

        function tryGetAnswer(callbackTrue, callbackFalse) {
            if (!callbackTrue || !callbackFalse) {
                throw new Error('Отсутствуют необходимые параметры');
            }
            recordingVoice(true, null, 500)
                .then((recording) => {
                    recordingToTextToBool(recording)
                        .then(result => {
                            if (result === true) {
                                callbackTrue(null);
                            } else if (result === false) {
                                callbackFalse(null);
                            } else {
                                console.log(`Повторите еще раз свой ответ - channelId: ${channel.id}`);
                                play('sound:confbridge-pin-bad', null, 100)
                                    .then(() => tryGetAnswer(callbackTrue, callbackFalse))
                                    .catch(err => {
                                        // console.log(5, err);
                                    });

                                // play('sound:confbridge-pin-bad', null, () => {
                                //     tryGetAnswer(callbackTrue, callbackFalse);
                                // }, 100);
                            }
                        })
                        .catch(err => {
                            // console.log(6, err);
                        });
                })
                .catch(err => {
                    // console.log(7, err);
                });
            // recordingVoice(true, null, (recording) => {
            //     recordingToTextToBool(
            //         recording,
            //         result => {
            //             if (result === true) {
            //                 if (callbackTrue) {
            //                     callbackTrue(null);
            //                 }
            //             } else if (result === false) {
            //                 if (callbackFalse) {
            //                     callbackFalse(null);
            //                 }
            //             } else {
            //                 console.log(`Повторите еще раз свой ответ - channelId: ${channel.id}`);
            //                 play('sound:confbridge-pin-bad', null, 100)
            //                     .then(() => tryGetAnswer(callbackTrue, callbackFalse));
            //
            //                 // play('sound:confbridge-pin-bad', null, () => {
            //                 //     tryGetAnswer(callbackTrue, callbackFalse);
            //                 // }, 100);
            //             }
            //         });
            // }, 500);
        }

        function endingCall() {
            returnResult();
            play('sound:goodbye', null, 300)
                .then(() => ari.channels.get({channelId: channel.id})
                    .then(channel => channel.hangup()
                        .then(() => console.log(`Здесь программа положила трубку`))
                        .catch(err => {
                            // console.log(8, err);
                        }).catch(err => {
                            // console.log(9, err);
                        })
                    )).catch(err => {
                // console.log(10, err);
            });
            // play('sound:goodbye', null, () => {
            //     console.log(`Программа заканчивает разговор - channelId: ${channel.id}`);
            //     ari.channels.get({channelId: channel.id})
            //         .then(channel => channel.hangup((err) => {
            //             if (err) {
            //                 // throw err;
            //             }
            //             console.log(`Здесь программа положила трубку`);
            //         }));
            // }, 300);
        }

        function transferToOperator() {
            returnResult();
            console.log(`Перевод на оператора - channelId: ${channel.id}`);

            play('sound:hello-world', null, 300)
                .then(() => {
                    console.log(`Типа ответил оператор - channelId: ${channel.id}`);
                    ari.channels.get({channelId: channel.id})
                        .then(channel => channel.hangup()
                            .then(() => console.log(`Здесь программа положила трубку`))
                            .catch(err => {
                                // console.log(11, err);
                            })
                        ).catch(err => {
                        // console.log(12, err);
                    });
                }).catch(err => {
                // console.log(13, err);
            });

            // play('sound:hello-world', null, () => {
            //     console.log(`Типа ответил оператор - channelId: ${channel.id}`);
            //     ari.channels.get({channelId: channel.id})
            //         .then(channel => channel.hangup((err) => {
            //             if (err) {
            //                 // throw err;
            //             }
            //             console.log(`Здесь программа положила трубку`);
            //         }));
            //
            // }, 300)
        }

        function returnResult() {
            if (!isReturnedResult) {
                isReturnedResult = true;
                resolve({result, operator});
            }
        }
    });
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}

module.exports = {connect, callTo};
