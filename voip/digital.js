const client = require('ari-client');
const voipConfig = require('../config/voip.config');

client.connect(voipConfig.host, voipConfig.user, voipConfig.password, clientLoaded);

function clientLoaded(err, ari) {

    let closing = false;

    if (err) {
        throw err;
    }

    ari.start("test");

    let localChannel = ari.Channel();
    localChannel.on('StasisStart', (event, chan) => {
        console.log('Трубку подняли');
        console.log(chan.id)

        // recording(chan);

        // call(chan);
    });
    localChannel.on('StasisEnd', (event, chan) => {
        console.log('Трубку повесили');
        ari.stop();
    });
    localChannel.on('ChannelDestroyed', (event, chan) => {
        console.log('Соединение прервано');
        ari.stop();
    });

    localChannel.on('ChannelDtmfReceived', (event, chan) => {
        console.log(`Нажата кнопка: ${event.digit}`);

        // if (event.digit === '0') {
        // }
        // if (event.digit === '7') {
        // }
    });

    callToEndpoint(localChannel, 'PJSIP/2020', "test", 'Test');

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

        ari.stop();
    }

    console.log(2)
}
