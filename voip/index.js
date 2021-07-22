const client = require('ari-client');
const voipConfig = require('../config/voip.config');
const sounds = require('./sounds');
const speechToText = require('../speechToText');

const app = "AutoDialling";
const callerName = 'МФЦ';

function callTo(number, hours = 10, minutes = 50) {
    let ari;

    client
        .connect(voipConfig.host, voipConfig.user, voipConfig.password)
        .then(_ari => {
            ari = _ari;
            ari.start(app);

            const channel = createChannel(ari);

            callToEndpoint(channel, number, app, callerName);
        })
        .catch(err => {
            // throw err;
        });

    function createChannel(ari) {
        const channel = ari.Channel();
        channel.on('StasisStart', stasisStart);
        channel.on('StasisEnd', stasisEnd);
        channel.on('ChannelDestroyed', channelDestroyed);
        return channel;
    }

    function stasisStart(event, channel) {
        console.log(`Трубку подняли - Channel id: ${channel.id}`);

        startDialog(channel);
    }

    function stasisEnd(event, channel) {
        console.log(`Разговор завершен - Channel id: ${channel.id}`);

        channel.hangup();
        ari.stop();
    }

    function channelDestroyed(event, channel) {
        console.log(`Соединение прервано - Channel id: ${channel.id}`);

        ari.stop();
    }

    function callToEndpoint(channel, endpoint, app, callerId) {
        channel.originate({
            endpoint,
            app,
            callerId,
            // channelId: '123',
        }, (err, channel) => {
            console.log(`Пытаемся дозвониться до ${endpoint} из ${channel.id}`);
            if (err) {
                // throw err;
            }
        });
    }

    function play(channel, sound, callbackStarted, callbackFinished, delay = 0) {
        setTimeout(() => {
            channel.play({media: sound}, function (err, playback) {
                if (err) {
                    // throw err;
                }
                playback.on('PlaybackStarted', function (event, playback) {
                    console.log(`Началось воспроизведение звука: ${sound} - Channel Id ${channel.id}`);
                    if (callbackStarted) {
                        callbackStarted(playback);
                    }
                });

                playback.on('PlaybackFinished', function (event, playback) {
                    console.log(`Закончилось воспроизведение звука: ${sound} - Channel Id ${channel.id}`);
                    if (callbackFinished) {
                        callbackFinished(playback);
                    }
                });
            });
        }, delay);
    }

    function recordingVoice(channel, beep, callbackStarted, callbackFinished, delay = 0) {
        setTimeout(() => {
            ari.channels.record({
                channelId: channel.id,
                beep,
                format: 'wav',
                maxDurationSeconds: 4,
                name: `recordAnswer_${Date.now().toString()}_${getRandomInt(1000000, 9999999)}`,
            }, (err, liveRecording) => {
                if (err) {
                    // throw err;
                }
                liveRecording.on('RecordingStarted', (event, recording) => {
                    console.log(`Начало записи ответа - channel id: ${channel.id}, recordName: ${recording.name}`);
                    if (callbackStarted) {
                        callbackStarted(recording);
                    }
                });
                liveRecording.on('RecordingFinished', (event, recording) => {
                    console.log(`Окончание записи ответа - channel id: ${channel.id}, recordName: ${recording.name}`);
                    if (callbackFinished) {
                        callbackFinished(recording);
                    }
                });
            });
        }, delay);
    }

    function recordingToText(recording, callbackTrue, callbackFalse, callbackNull) {
        ari.recordings.getStoredFile(
            {recordingName: recording.name},
            function (err, binary) {
                if (err) {
                    // throw err;
                }
                console.log(`Пытаемся распознать речь - recordName: ${recording.name}`);
                const result = speechToText(binary);
                console.log(`Распознавание речи - recordName: ${recording.name}, result: ${result}`);

                if (result === true) {
                    if (callbackTrue) {
                        callbackTrue(null);
                    }
                } else if (result === false) {
                    if (callbackFalse) {
                        callbackFalse(null);
                    }
                } else {
                    if (callbackNull) {
                        callbackNull(null);
                    }
                }
            }
        );
    }

    function startDialog(channel) {
        play(channel, sounds.hello, null, () => {
            play(channel, `number:${hours}`, null, () => {
                play(channel, `number:${minutes}`, null, () => {
                    play(channel, sounds.question, null, () => {
                        recordingVoice(channel, true, null, (recording) => {
                            recordingToText(
                                recording,
                                () => {
                                    play(channel, 'sound:goodbye', null, () => {
                                        console.log(`Программа заканчивает разговор (1) - channelId: ${channel.id}`);
                                        channel.hangup((err) => {
                                            if (err) {
                                                // throw err;
                                            }
                                            console.log(`Здесь должно быть ари стоп (0)`);
                                            ari.stop();
                                        });
                                        console.log(`Здесь должно быть ари стоп (1)`);
                                        ari.stop();
                                    }, 300);
                                },
                                () => {
                                    play(channel, sounds.operator, null, () => {
                                        recordingVoice(channel, true, null, (recording) => {
                                            recordingToText(
                                                recording,
                                                () => {
                                                    console.log(`Перевод на оператора - channelId: ${channel.id}`);
                                                    play(channel, 'sound:hello-world', null, () => {
                                                        console.log(`Типа ответил оператор - channelId: ${channel.id}`);
                                                        channel.hangup((err) => {
                                                            if (err) {
                                                                // throw err;
                                                            }
                                                            console.log(`Здесь должно быть ари стоп (0.1)`);
                                                            ari.stop();
                                                        });
                                                        console.log(`Здесь должно быть ари стоп (2)`);
                                                        ari.stop();
                                                    }, 300)
                                                },
                                                () => {
                                                    play(channel, 'sounds:goodbye', null, () => {
                                                        console.log(`Заканчиваем разговор (2) - channelId: ${channel.id}`);
                                                        channel.hangup((err) => {
                                                            if (err) {
                                                                // throw err;
                                                            }
                                                            console.log(`Здесь должно быть ари стоп (0.2)`);
                                                            ari.stop();
                                                        });
                                                        console.log(`Здесь должно быть ари стоп (3)`);
                                                        ari.stop();
                                                    }, 300);
                                                },
                                                () => {
                                                    console.log(`Повторите свой ответ (2)  - channelId: ${channel.id}`);
                                                    // try recording
                                                });
                                        }, 500);
                                    })
                                },
                                () => {
                                    console.log(`Повторите свой ответ (1)  - channelId: ${channel.id}`);
                                    // try recording
                                });
                        }, 500);
                    }, 100);
                }, 100);
            }, 300);
        }, 1000);

    }

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}

module.exports = callTo;