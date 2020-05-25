"use strict";


// Enthält alle Funktionen, die das Interface manipulieren.

var displayTransitionTextBoolean = false;
var isTransitionOutputLabelVisible = false;


function checkSelectedInputMode() {
    if (document.getElementById("textInputOption").checked) selectedTextInputMode();
    if (document.getElementById("bitInputOption").checked) selectedBitInputMode();
}

function selectedTextInputMode() {
    document.getElementById("textInputMode").style.display = "block";
    document.getElementById("bitInputMode").style.display = "none";
}

function selectedBitInputMode() {
    document.getElementById("textInputMode").style.display = "none";
    document.getElementById("bitInputMode").style.display = "block";
}




/**
 * Show the actual simulation and hide the parameter menu
 */
function showSimulation() {
    document.getElementById("simulationView").style.display = "block";
    document.getElementById("propertiesInput").style.display = "none";
    updateRestart();
    if (simulationParameters["interleaver"]) {
        document.getElementById("interleaverSection").style.display = "block";
        document.getElementById("deinterleaverSection").style.display = "block";
    } else {
        document.getElementById("interleaverSection").style.display = "none";
        document.getElementById("deinterleaverSection").style.display = "none";

    }
    hideTransitionText();

}

/**
 * Show the simulation parameter menu
 * and hide the actual simulation 
 */

function showProperties() {
    document.getElementById("simulationView").style.display = "none";
    document.getElementById("propertiesInput").style.display = "block";
}

function generateRandomBitInput() {
    var length = document.getElementById("bitLength").value;
    var string = "";

    for (var i = 0; i < length; i++) {
        var number = Math.round(Math.random());
        string += String(number);
    }
    document.getElementById("bitInput").value = string
}

function isTextInputProperty() {
    return document.getElementById("textInputOption").checked;
}

function getInputStringProperty() {
    return document.getElementById("textInput").value;
}

function getInputBitsProperty() {
    return document.getElementById("bitInput").value;
}

function getErrorProperty() {

    var errorProbGood = 0;
    // THIS VALUE Means when we are in the bad state, 50% of the bits will flip 
    // As written in the paper by Gilbert
    var errorProbBad = 0.5;

    var transProbGoodToBad = 0;
    var transProbBadToGood = 0;

    if (document.getElementById("singleErrorSelection").checked) {
        errorProbGood = parseFloat(document.getElementById("singleErrorProbability").value);
    }
    if (document.getElementById("burstErrorSelection").checked) {
        transProbGoodToBad = parseFloat(document.getElementById("transProb_GoodToBad").value);
        transProbBadToGood = parseFloat(document.getElementById("transProb_BadToGood").value);
    }

    // We want to make sure that these probabilities are numbersand between 0 and 1
    if(transProbGoodToBad >= 0 && transProbGoodToBad <= 1) {} else {transProbGoodToBad = 0}
    if(transProbBadToGood >= 0 && transProbBadToGood <= 1) {} else {transProbBadToGood = 0}
    if(errorProbGood >= 0 && errorProbGood <= 1) {} else {errorProbGood = 0}
    if(errorProbBad >= 0 && errorProbBad <= 1) {} else {errorProbBad = 0.5}


    var errors = {
        "transProb_GoodToBad": transProbGoodToBad,
        "transProb_BadToGood": transProbBadToGood,
        "errorProb_Good": errorProbGood,
        "errorProb_Bad": errorProbBad
    }

    return errors;
}

function getInterleaverProperty() {
    var interleaverActivated = document.getElementById("interleaverSelection").checked;
    return interleaverActivated;
}

function getConvolutionalCoderProperty() {
    return parseInt(document.querySelector('input[name="convolutionCodeTypeSelection"]:checked').value);
}

/**
 * A global variable that stores user preferences about the simulation
 */
var simulationParameters = {};

function storeSimulationParameters() {
    simulationParameters = {}
    simulationParameters["isTextInput"] = isTextInputProperty();
    simulationParameters["inputString"] = getInputStringProperty();
    simulationParameters["inputBits"] = getInputBitsProperty();
    simulationParameters["errors"] = getErrorProperty();
    simulationParameters["interleaver"] = getInterleaverProperty();
    simulationParameters["convolutionalCoder"] = getConvolutionalCoderProperty();
}

function updateSpeed() {
    var speed = document.getElementById("speedRange").value; // ups
    var opPerSecond = changeSpeed(speed);
    document.getElementById("updatesPerSecondSpan").innerHTML = speed;
}

function updatePause() {
    pauseSimulation();
    document.getElementById("pauseDiv").style.display = "none";
    document.getElementById("resumeDiv").style.display = "block";

}

function updateResume() {
    resumeSimulation();
    document.getElementById("pauseDiv").style.display = "block";
    document.getElementById("resumeDiv").style.display = "none";
}

function updateResume() {
    resumeSimulation();
    document.getElementById("pauseDiv").style.display = "block";
    document.getElementById("resumeDiv").style.display = "none";
}


function updateSimulationDone() {
    document.getElementById("pauseDiv").style.display = "none";
    document.getElementById("resumeDiv").style.display = "none";
    pauseSimulation();
}

function updateRestart() {
    document.getElementById("pauseDiv").style.display = "block";
    document.getElementById("resumeDiv").style.display = "none";
    resetSimulation();
    startSimulation();
    if (isTransitionOutputLabelVisible) {
        displayTransitionText();
    }
    else {
        hideTransitionText();
    }
}

function displayTransitionText() {
    var displayTransitionTextDiv = document.getElementById("displayTransitionTextDiv");
    var hideTransitionTextDiv = document.getElementById("hideTransitionTextDiv");

    displayTransitionTextDiv.style.display = "none";
    hideTransitionTextDiv.style.display = "block";

    isTransitionOutputLabelVisible = true;

    // Update Trellis
    viterbiDecoder.trellis.toHTML();

}

function hideTransitionText() {
    var displayTransitionTextDiv = document.getElementById("displayTransitionTextDiv");
    var hideTransitionTextDiv = document.getElementById("hideTransitionTextDiv");

    displayTransitionTextDiv.style.display = "block";
    hideTransitionTextDiv.style.display = "none";

    isTransitionOutputLabelVisible = false;

    // Update Trellis
    viterbiDecoder.trellis.toHTML();


}