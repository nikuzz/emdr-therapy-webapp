// https://jsfiddle.net/teropa/bwxwhoqr/1/
const LENGTH_MS = 200;

const REAL_TIME_FREQUENCY = 440;
const ANGULAR_FREQUENCY = REAL_TIME_FREQUENCY * 2 * Math.PI;
const LENGTH = (LENGTH_MS / 1000) * 44100;

let audioContext = new AudioContext();
let myBuffer = audioContext.createBuffer(1, LENGTH, 44100);
let myArray = myBuffer.getChannelData(0);
for (let sampleNumber = 0 ; sampleNumber < LENGTH ; sampleNumber++) {
    myArray[sampleNumber] = generateSample(sampleNumber);
}

function generateSample(sampleNumber) {
    let currentTime = sampleNumber / 44100;
    let currentAngle = currentTime * ANGULAR_FREQUENCY;
    return Math.sin(currentAngle);
}

function playSound() {
    let src = audioContext.createBufferSource();
    src.buffer = myBuffer;
    src.connect(audioContext.destination);
    src.start();
}

