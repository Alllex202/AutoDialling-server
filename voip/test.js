const client = require('ari-client');
// const util = require('util');
const voipConfig = require('../config/voip.config');
const sounds = require('./sounds');
const fs = require('fs');

client.connect(voipConfig.host, voipConfig.user, voipConfig.password, clientLoaded);

function tryExportRecordFile(err, ari) {
    ari.recordings.getStoredFile(
        {recordingName: 'testRecord1'},
        function (err, binary) {
            if (err) {
                throw err;
            }

            try {
            } catch (e) {
                throw e;
            }
        }
    );
}

function clientLoaded(err, ari) {
    console.log(ari)
    console.log(1)

    let closing = false;

    if (err) {
        throw err;
    }

    ari.start("test");

    // // Create a simple bridge that is controlled by ARI/Stasis
    // let bridge = ari.Bridge();
    // try {
    //     bridge.create({type: "mixing"});
    // } catch(error) {
    //     console.error(error);
    //     this.close();
    // }
    // bridge.on('BridgeDestroyed', (event) => {
    //     this.close();
    // });

    let localChannel = ari.Channel();
    localChannel.on('StasisStart', (event, chan) => {
        console.log('Трубку подняли');
        console.log(chan.id)

        // recording(chan);

        call(chan);
    });
    localChannel.on('StasisEnd', (event, chan) => {
        console.log('Трубку повесили');
        ari.stop();
    });
    localChannel.on('ChannelDestroyed', (event, chan) => {
        console.log('Соединение прервано');
        ari.stop();
    });

    /*
    beep (boolean) - Play beep when recording begins
    channelId (string) - Channel's id
    format (string) - Format to encode audio in
    ifExists (string) - Action to take if a recording with the same name already exists.
    maxDurationSeconds (int) - Maximum duration of the recording, in seconds. 0 for no limit
    maxSilenceSeconds (int) - Maximum duration of silence, in seconds. 0 for no limit
    name (string) - Recording's filename
    terminateOn (string) - DTMF input to terminate recording
     */

    function recording(chan) {
        setTimeout(() => {
            play(chan, sounds.signal,
                () => {
                    ari.channels.record({
                        channelId: chan.id,
                        beep: true,
                        format: 'wav',
                        maxDurationSeconds: 5,
                        name: `testRecord_${Date.now().toString()}`,
                    }, (err, liveRecording) => {
                        if (err) {
                            console.log('errorRecord')
                            throw err;
                        }
                        console.log('live recording')
                        // console.log(liveRecording)
                    });
                }
            );
        }, 500);
    }

    function call(chan) {
        setTimeout(() => {
            play(chan, sounds.hello, () => {
                setTimeout(() => {
                    play(chan, `number:${10}`, () => {
                        setTimeout(() => {
                            play(chan, `number:${50}`, () => {
                                setTimeout(() => {
                                    play(chan, sounds.question, () => {
                                        play(chan, sounds.signal, () => {
                                            localChannel.on('ChannelDtmfReceived', (event, chan) => {
                                                if (event.digit === '0' || '1') {
                                                    if (event.digit === '0') {
                                                        console.log('Клиент не придет!');
                                                    } else if (event.digit === '1') {
                                                        console.log('Клиент придет!');
                                                    }
                                                    localChannel.removeAllListeners('ChannelDtmfReceived');
                                                    setTimeout(() => {
                                                        play(chan, sounds.operator, () => {
                                                            play(chan, sounds.signal, () => {
                                                                localChannel.on('ChannelDtmfReceived', (event, chan) => {
                                                                    if (event.digit === '1') {
                                                                        console.log('Соединение с оператором!');
                                                                        localChannel.removeAllListeners('ChannelDtmfReceived');
                                                                        setTimeout(() => {
                                                                            localChannel.hangup();
                                                                        }, 300);
                                                                    }
                                                                });
                                                            });
                                                        });
                                                    }, 300);
                                                }
                                            });
                                        });
                                    });
                                }, 100);
                            });
                        }, 100);
                    });
                }, 300);
            });
        }, 1000);
    }

    // localChannel.on('ChannelDtmfReceived', (event, chan) => {
    //     console.log(`Нажата кнопка: ${event.digit}`);
    //
    //     const hello = 'sound:hello';
    //     const web = 'sound:https://g711.org/ready/test-1626877025.g722';
    //     const local = 'sound:http://10.0.0.20:3000/';
    //
    //     if (event.digit === '0') {
    //         play(chan, hello);
    //     }
    //     if (event.digit === '7') {
    //         play(chan, local + 7);
    //     }
    // });

    // Воспроизвести
    function play(channel, sound, callback) {
        // const playback = ari.Playback();
        // console.log('playback');
        // console.log(playback.id);
        //
        // playback.on('PlaybackStarted', function (event, playback) {
        //     console.log('PlaybackStarted')
        // });
        //
        // playback.on('PlaybackFinished', function (event, playback) {
        //     if (callback) {
        //         callback(null);
        //     }
        //     console.log('PlaybackFinished')
        // });

        channel.play({media: sound}, function (err, playback) {
            if (err) {
                // console.log(123)
                throw err;
            }
            playback.on('PlaybackStarted', function (event, playback) {
                console.log('PlaybackStarted')
            });

            playback.on('PlaybackFinished', function (event, playback) {
                if (callback) {
                    callback(null);
                }
                console.log('PlaybackFinished')
            });
            // console.log(sound);
        });
    }

    callToEndpoint(localChannel, 'PJSIP/1010', "test", 'Test');

    function callToEndpoint(chan, endpoint, app, callerId) {
        try {
            chan.originate({
                endpoint,
                app,
                callerId,
                // channelId: '123',
            });
        } catch (error) {
            close();
        }
    }

    // // Now we create the External Media channel.
    // let externalChannel = ari.Channel();
    // externalChannel.on('StasisStart', (event, chan) => {
    //     bridge.addChannel({channel: chan.id});
    // });
    // externalChannel.on('StasisEnd', (event, chan) => {
    //     close();
    // });

    /*
     * We give the external channel the address of the listener
     * we already set up and the format it should stream in.
     */
    // try {
    //     let resp = externalChannel.externalMedia({
    //         app: "externalMedia",
    //         external_host: '10.0.0.14:9999'
    //     });
    //     // this.emit('ready');
    // } catch(error) {
    //     close();
    // }


    function close() {
        if (closing) {
            return;
        }
        closing = true;

        if (localChannel) {
            console.log("Hanging up local channel");
            try {
                localChannel.hangup();
            } catch (error) {
            }
            localChannel = null;
        }
        // if (externalChannel) {
        //     console.log("Hanging up external media channel");
        //     try {
        //         externalChannel.hangup();
        //     } catch(error) {
        //     }
        //     externalChannel = null;
        // }
        // if (bridge) {
        //     console.log("Destroying bridge");
        //     try {
        //         bridge.destroy();
        //     } catch(error) {
        //     }
        //     bridge = null;
        // }

        ari.stop();
    }

    console.log(2)
}
