// https://jsfiddle.net/teropa/bwxwhoqr/1/
const LENGTH_MS = 200;

const REAL_TIME_FREQUENCY = 440;
const ANGULAR_FREQUENCY = REAL_TIME_FREQUENCY * 2 * Math.PI;
const LENGTH = (LENGTH_MS / 1000) * 44100;

let audioContext = new AudioContext();
let myLeftChannelBuffer = audioContext.createBuffer(2, LENGTH, 44100); // 2 channels
let myRightChannelBuffer = audioContext.createBuffer(2, LENGTH, 44100); // 2 channels
let myLeftArray = myLeftChannelBuffer.getChannelData(0);
let myRightArray = myRightChannelBuffer.getChannelData(1);
for (let sampleNumber = 0 ; sampleNumber < LENGTH ; sampleNumber++) {
    myLeftArray[sampleNumber] = generateSample(sampleNumber);
    myRightArray[sampleNumber] = generateSample(sampleNumber);
}

function generateSample(sampleNumber) {
    let currentTime = sampleNumber / 44100;
    let currentAngle = currentTime * ANGULAR_FREQUENCY;
    return Math.sin(currentAngle);
}

function playSound(channel) {
    let src = audioContext.createBufferSource();
    if (channel == 'left') {
        src.buffer = myLeftChannelBuffer;
    } else if (channel == 'right') {
        src.buffer = myRightChannelBuffer;
    }
    src.connect(audioContext.destination);
    src.start();
}

