"use strict";


var simulation;

var isTextInput;

var TextInputBuffer;
var TextOutputBuffer;
var inputBuffer1;
var inputBuffer2;
var originalInputBuffer;
var canalBuffer1;
var errorCanalBuffer;
var decodedOutputBuffer;
var convolutionalEncoder;
var viterbiDecoder;

var convolution;

var interleaver;
var deinterleaver;
var interleaverActivated = true;

var isStarted = false;
var isPaused = false;
var isFinished = false;


/**
 * used to determine if bits input by the user have already reached the output of the decoder 
 */
var userInputBits = false;


var stepper = 0;

/**
 * convolutionOutputLength is an global variable used for proper formatting in the toHTML function
 * it is also used as factor for register length of the the BitRegisters
 */
var convolutionOutputLength = 0;

var simulationSpeedFactor = 1;
var simulationIntervalTime = 500; // ms

function setSimulationInterval() {
    simulation = setInterval(nextStep, simulationIntervalTime * simulationSpeedFactor);
}


function pauseSimulation() {
    if (isStarted && !isPaused) {
        // pause simulation 
        isPaused = true;
        clearInterval(simulation);
    }
}

function resumeSimulation() {
    if (isStarted && isPaused && !isFinished) {
        isPaused = false;
        setSimulationInterval(); // start simulation
    }
}

function resetSimulation() {
    clearInterval(simulation);
    isStarted = false;
    isPaused = false;
    isFinished = false;
}

/**
 * Changes the simulation speed 1 is default speed
 * lower to increase speed
 * higher to slow down speed
 * @param {number} value 
 * @returns {number} updates per second
 */

function changeSpeed(value) {
    simulationSpeedFactor = 1 / value;
    if (!isPaused) {
        pauseSimulation();
        resumeSimulation();
    }
    return value;
}

function endSimulation() {
    pauseSimulation();
    console.log("simulation is done.")
    isFinished = true;
}



function startSimulation() {
    if (!isStarted) {
        stepper = 0;
        isStarted = true;
        isPaused = false;
        userInputBits = false;


        isTextInput = simulationParameters["isTextInput"];

        if (isTextInput) {
            var userText = simulationParameters["inputString"];
            TextInputBuffer = new UserStringRegister(userText);
            TextOutputBuffer = new UserStringRegister("");
        }

        switch (simulationParameters["convolutionalCoder"]) {
            case 2:
                convolution = new Convolution2();
                break;
            case 3:
                convolution = new Convolution3();
                break;
            case 1:
            default:
                convolution = new Convolution1();
                break;
        }
        convolutionOutputLength = convolution.outputLength;

        var inputBits = simulationParameters["inputBits"];
        if (isTextInput) {
            inputBuffer1 = new UserStringRegister(userText);
            inputBuffer2 = new UserStringRegister(userText);

        } else {
            inputBuffer1 = new InfoBitRegister(inputBits);
            inputBuffer2 = new InfoBitRegister(inputBits);
        }

        canalBuffer1 = new BufferBitRegister(10, false);
        errorCanalBuffer = new ErrorCanal(9, simulationParameters["errors"]);

        var blockLength = 12;
        convolutionalEncoder = new ConvolutionalEncoder(convolution, blockLength);
        var trellisLength = blockLength + convolution.constraintLength - 1;
        viterbiDecoder = new ViterbiDecoder(convolution, trellisLength);

        if (isTextInput) {
            decodedOutputBuffer = new UserStringRegister('');
            originalInputBuffer = new UserStringRegister('');
        } else {
            decodedOutputBuffer = new InfoBitRegister('');
            originalInputBuffer = new InfoBitRegister('');
        }

        interleaverActivated = simulationParameters["interleaver"];

        if (interleaverActivated) {
            interleaver = new ConvolutionalInterleaver(10, 2);
            deinterleaver = new ConvolutionalDeinterleaver(10, 2);
        }

        updateText();
        setSimulationInterval(); // start simulation
    }
}


function nextStep() {
    if (isTextInput) {
        var userInput = TextInputBuffer.shiftBitOut();
        TextOutputBuffer.shiftBitIn(userInput);
    }
    // Es sollen nur Bits in den Faltungskodierer geschoben werden, wenn keine Bits im Output Buffer sind
    // und dieser nicht gerade im Tailbit Modus ist.
    if (convolutionalEncoder.outputBufferSize === 0 && !convolutionalEncoder.isInTailBitMode) {
        var userInput = inputBuffer1.shiftBitOut();
        convolutionalEncoder.shiftBitIn(userInput);
    }
    var encoderOutput = convolutionalEncoder.shiftBitOut();

    canalBuffer1.shiftBitIn(encoderOutput);
    var canal1Output = canalBuffer1.shiftBitOut();

    if (interleaverActivated) {

        interleaver.shiftBitIn(canal1Output);
        var interleaverOutput = interleaver.shiftBitOut();

        errorCanalBuffer.shiftBitIn(interleaverOutput);
        var errorCanalOutput = errorCanalBuffer.shiftBitOut();

        deinterleaver.shiftBitIn(errorCanalOutput);
        var deinterleaverOutput = deinterleaver.shiftBitOut();

        viterbiDecoder.shiftBitIn(deinterleaverOutput);

    } else {
        errorCanalBuffer.shiftBitIn(canal1Output);
        var errorCanalOutput = errorCanalBuffer.shiftBitOut();

        viterbiDecoder.shiftBitIn(errorCanalOutput);
    }

    var trellisDecoded = viterbiDecoder.shiftBitOut();
    var decodedOutput = trellisDecoded

    decodedOutputBuffer.shiftBitIn(decodedOutput);

    if (decodedOutput !== undefined) {
        if (decodedOutput.isInfoBit) {
            var originalBit = inputBuffer2.shiftBitOut();
            originalInputBuffer.shiftBitIn(originalBit);
        }
    }
    if (inputBuffer2.isEmpty()) {
        endSimulation();
    }
    updateText();
}


function updateText() {
    inputBuffer1.toHTML("userBitInput");
    convolutionalEncoder.toHTML("convolutionalCode");
    canalBuffer1.toHTML("encodedInput");
    errorCanalBuffer.toHTML("encodedCanalOutput");
    viterbiDecoder.toHTML("trellisDiagram", "trellisCanal");
    decodedOutputBuffer.toHTML("decodedOutput");
    originalInputBuffer.toHTML("originalInput");
    if (interleaverActivated) {
        interleaver.toHTML("interleaverContent");
        deinterleaver.toHTML("deinterleaverContent");
    }
}