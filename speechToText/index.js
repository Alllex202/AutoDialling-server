function speechToText(binary) {
    // todo

    // binary to wav
    // fs.writeFileSync('file.wav', binary);

    return getRandomBool();
}

function getRandomBool() {
    return Math.random() < 0.5;
}

module.exports = speechToText;