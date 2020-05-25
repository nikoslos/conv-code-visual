"use strict";

/**
 * 
 */
class ViterbiDecoder extends BitRegister {
    /**
     * 
     * @param {Convolution} convolution 
     * @param {number} length This defines how many time steps the viterbi decoder uses for decoding
     */
    constructor(convolution, length) {
        super('0'.repeat(length * convolution.outputLength), false, convolutionOutputLength * length);
        this.length = length;
        this.convolution = convolution;
        this.fsm = new FiniteStateMachine(convolution.func, convolution.constraintLength - convolution.inputLength);
        this.decodedBitString = "";
        this.originalBitString = "";

        // is used to count how many tupel of n bits (Number of bits output by one encoder step) have been shifted into the bitBuffer
        // It's the time index k + 1
        this.recievedCodeBitTupelCounter = 0;

        // branchMetric is a list of branchMetrics for each time step
        this.branchMetricsList = new Array(this.length);

        // we need one more time step for states
        // statesMetricList is a list of stateMetrics for each time step + 1
        this.statesMetricsList = new Array(this.length + 1);

        // This stores all branches survived at one point in time
        this.survivedPaths = new Array(this.length);
    }

    resetViterbiDecoder() {
        this.bitBuffer = convertBitStringToBitArray('0'.repeat(this.length * convolution.outputLength), false);

        var branchMetricListLength = this.branchMetricsList.length
        for (var i = 0; i < branchMetricListLength; i++) {
            this.branchMetricsList[i] = [];
        }

        var statesMetricListLength = this.statesMetricsList.length
        for (var i = 0; i < statesMetricListLength; i++) {
            this.statesMetricsList[i] = [];
        }
    }


    onShiftBitIn() {

        // The numbers of bits, that are output in one encoding step
        var outputLength = this.convolution.outputLength;

        /**
         * Die Bits werden immer bitweise in den inputBuffer des  Dekodierers eingeschoben,
         * Der Dekodierer soll aber immer Tupel von n Bits (Anzahl der Ausgabebits eines Faltungskodieres) bearbeiten.
         * Deswegen prüfen wir ob mindestens n Tupel an Bits bereits im inputBuffer des Dekodierers sind.
         */
        if (this.inputBuffer.length >= outputLength) {
            // One Tupel of n Codebits
            var inputBits = this.inputBuffer.splice(-this.convolution.outputLength).reverse();
            if (this.synchronized === true) {
                // Wir setzen erst jetzt zurück, damit die vollständig dekodierte Bitsequenz länger im Trellis zu sehen ist
                if (this.recievedCodeBitTupelCounter === this.length) {
                    // All Bits in the bitBuffer will be set to EmptyBits
                    this.resetViterbiDecoder();
                    this.recievedCodeBitTupelCounter = 0;
                }
                // Replaces one tupel of n bits at the current k-th time step with the k-th tupel. 
                // The k-th tupel is in the inputBuffer 
                this.bitBuffer.splice(this.recievedCodeBitTupelCounter * outputLength, 0, ...inputBits)


                this.recievedCodeBitTupelCounter++;
                this.decode();
                if (this.recievedCodeBitTupelCounter === this.length) {
                    this.outputBuffer = this.getDecodedBitArray();
                }
            } else {
                // We just throw away the inputBuffer because it will not be used for decoding,
                // since it only contains EmptyBits, which are not used to store actual information.
                this.inputBits = [];
            }
        }
    }

    /**
     * Führt die Dekodierung der aktuell im bitBuffer stehenden Bits aus
     * Die dekodierte Bitkette wird als String im decodedBitString stehen
     * Durch das aufrufen 
     */
    decode() {
        this.viterbiAlgorithm();
    }

    /**
     * Selektiert den Wahrscheinlichsten Pfad
     */
    viterbiAlgorithm() {

        this.calculateBranchMetric();
        this.addCompareStateMetric();
        this.getDecodedBitStringByTraceback();

        this.computeOriginalBitString();

        //this.computeBranchList();
    }

    /**
     * Berechnet die BranchMetric zum aktuellen Zeitpunkt und speichert es in this.branchMetric
     */
    calculateBranchMetric() {
        var timeIndex = this.recievedCodeBitTupelCounter - 1;
        this.branchMetricsList[timeIndex] = this.calculateBranchMetricsAtTime(timeIndex);
    }

    /**
     * 
     * @param {number} timeIndex 
     * @returns {Array<number>}Returns a number array containing the hammingDistances between all k-th transitions (transitions at timeIndex) and the k-th code bit tupel 
     */
    calculateBranchMetricsAtTime(timeIndex) {
        var transitionList = this.fsm.state_transitions;
        // Will contain the hammingDistances of the transitions in the k-th time step.
        var branchMetrics = new Array(transitionList.length);

        var codeBitTupel = this.getCodeBitNumberTupel(timeIndex);

        for (var i = 0; i < branchMetrics.length; i++) {
            var transition = transitionList[i];
            var transitionOutputTupel = transition.output;
            branchMetrics[i] = this.hammingDistance(transitionOutputTupel, codeBitTupel);
        }
        return branchMetrics;
    }

    /** 
     * 
     * @param {number} timeIndex
     * @returns {Array<number>} Returns a number array containing the bit values of the k-th (at timeIndex) code bit tupel
     */
    getCodeBitNumberTupel(timeIndex) {
        var outputLength = this.convolution.outputLength;
        var codeBitTupel = new Array(outputLength);

        // offset from the k-th to the 0-th (first) tupel in the codeSequence
        var indexOffset = timeIndex * outputLength;
        for (var i = 0; i < outputLength; i++) {
            codeBitTupel[i] = this.bitBuffer[indexOffset + i].value;
        }
        return codeBitTupel;
    }

    /**
     * @param {Array<number>} bitSequence1 bitsequence1 number should be 1 or 0. Array should have the same length as bitSequence2!
     * @param {Array<number>} bitSequence2 bitsequence2 number should be 1 or 0. Array should have the same length as bitSequenec1! 
     * @returns {Array<number>} Returns the hamming distance between bitsequence1 and bitsequence2
     */
    hammingDistance(bitSequence1, bitSequence2) {
        var hammingDistance = 0;
        for (var i = 0; i < bitSequence1.length; i++) {
            if (bitSequence1[i] !== bitSequence2[i]) {
                hammingDistance++;
            }
        }
        return hammingDistance;
    }

    addCompareStateMetric() {
        var timeIndex = this.recievedCodeBitTupelCounter - 1;

        var stateTimeIndex = timeIndex + 1;
        var state_transitions = this.fsm.state_transitions;
        var branchMetrics = this.branchMetricsList[timeIndex];

        var statesLength = this.fsm.states.length;

        // initialize the states at state time zero
        if (timeIndex === 0) {
            var firstStatesMetrics = new Array(statesLength);
            for (var i = 0; i < statesLength; i++) {
                var pathMetric = 0;
                if (i !== 0)
                    pathMetric = Infinity;


                firstStatesMetrics[i] = {
                    "previousStateIndex": -1,
                    "pathMetric": pathMetric,
                    "transitionIndex": -1
                }
            }
            this.statesMetricsList[0] = firstStatesMetrics;
        }


        // State metrics for current time step
        var statesMetrics = new Array(statesLength);
        // State metrics of the previous time step
        var previousStatesMetrics = this.statesMetricsList[stateTimeIndex - 1];

        for (var i = 0; i < statesLength; i++) {
            var stateIndex = i;

            // We check the path metric of both preceeding nodes and add the branch metric.
            // And select the one with the smallest pathMetric
            var transitionsLength = state_transitions.length;
            var currentStateMetric = undefined;

            for (var j = 0; j < transitionsLength; j++) {
                var transitionIndex = j;
                var transition = state_transitions[transitionIndex];


                // Find all transitions that end in states[stateIndex]
                if (transition.next_state_index === stateIndex) {
                    // the state index of the state that is connected to state with stateIndex 
                    var previousStateIndex = transition.current_state_index;
                    var previousStateMetric = previousStatesMetrics[previousStateIndex]["pathMetric"];
                    var branchMetric = branchMetrics[transitionIndex];

                    var pathMetric = branchMetric + previousStateMetric;
                    // Wenn bereits ein Zweig zu diesem Knoten berechnet wurde, vergleichen wir beide Pfade 
                    if (currentStateMetric !== undefined) {
                        // compare with other path
                        var alternativeStateMetric = currentStateMetric["pathMetric"];
                        var randomVariable = Math.round(Math.random());
                        // Entweder aktueller Pfad zu diesem Knoten hat kleinere Pfadmetrik als alternative
                        // Oder beide sind gleich groß, dann wählen wir mit einer Wahrscheinlichkeit zu 50% den aktuellen.
                        if (pathMetric < alternativeStateMetric || (pathMetric === alternativeStateMetric && randomVariable === 0)) {
                            currentStateMetric = {
                                "previousStateIndex": previousStateIndex,
                                "pathMetric": pathMetric,
                                "transitionIndex": transitionIndex
                            }
                        }
                    } else {
                        currentStateMetric = {
                            "previousStateIndex": previousStateIndex,
                            "pathMetric": pathMetric,
                            "transitionIndex": transitionIndex
                        }
                    }
                }
            }
            statesMetrics[stateIndex] = currentStateMetric;
        }

        this.statesMetricsList[stateTimeIndex] = statesMetrics
    }

    getDecodedBitStringByTraceback() {
        // We want to decode the correct path
        var statesMetricsList = this.statesMetricsList;


        var currentTupelTime = this.recievedCodeBitTupelCounter;
        // We have a terminated convolutional code, so the last state is definitely 0 
        //var stateIndex = 0;

        // We want to generate a stateSequence for all endStates


        var statesLength = this.fsm.states.length;

        var stateSequences = new Array(this.fsm.states.length);
        for (var i = 0; i < statesLength; i++) {
            var stateIndex = i;
            var sequenceIndex = i;

            // Initialize
            var stateSequence = new Array(currentTupelTime + 1);

            stateSequence[currentTupelTime] = stateIndex;

            // Traceback and find stateSequence from currentStateTime
            for (var j = 0; j < currentTupelTime; j++) {
                var currentTime = currentTupelTime - j;
                var previousTimeIndex = currentTime - 1;
                var previousStateIndex = statesMetricsList[currentTime][stateIndex]["previousStateIndex"];
                stateSequence[previousTimeIndex] = previousStateIndex;

                stateIndex = previousStateIndex;
            }
            stateSequences[sequenceIndex] = stateSequence;
        }

        // stateSequences enthält die kürzeste Zustandssequenz in die jeweiligen Zustände zum aktuellen Zeitschritt
        var survivalPaths = new Array(currentTupelTime)

        // All transitions that have survived at one point in time
        var survivedPaths = this.survivedPaths;

        //var survivalPaths

        for (var i = 0; i < currentTupelTime; i++) {
            var timeIndex = i;
            // Der Vorteil von set ist, dass es dasselbe Objekt nur einmal speichert und nicht mehrmals,
            // wenn man zwei mal 1 hinzufügt, speichert es nur einmal 1
            var transitionSet = new Set();
            var statesLength = stateSequences.length;

            // End in state zero hack hack
            if (currentTupelTime === this.length) statesLength = 1;

            for (var j = 0; j < statesLength; j++) {
                var stateSequence = stateSequences[j];
                var originStateIndex = stateSequence[timeIndex];
                var nextStateIndex = stateSequence[timeIndex + 1];
                var transitionIndex = this.fsm.getTransitionIndexByStateIndexes(originStateIndex, nextStateIndex);
                transitionSet.add(transitionIndex);
            }
            survivalPaths[i] = transitionSet;
            // This stores the transitions of the current tupel time
            if (timeIndex === currentTupelTime - 1) {
                survivedPaths[i] = transitionSet;
            }
        }
        this.survivalPaths = survivalPaths;



        // Wir gehen das set an Übergängen solange durch, bis zum ersten Zeitpunkt an dem es nicht nur einen Übergang gibt 
        this.decodedBitString = ""
        for (var i = 0; i < survivalPaths.length; i++) {
            var transitionSet = survivalPaths[i];
            if (transitionSet.size === 1) {
                transitionSet.forEach((transitionIndex) => {
                    var transition = this.fsm.state_transitions[transitionIndex];
                    this.decodedBitString += transition.input_character;
                })
                continue;
            }
            // We want to break here because the decoder hasn't decided a unambiguous path yet
            break;
        }

        this.stateSequences = stateSequences;
    }

    /**
     * Hier wird die ursprünglich Bitkette berrechnet und in this.originalBitString gespeichert. 
     * Dies ist möglich, da die Bit Klasse in der Variable flipped die Info speichert, ob es gekippt ist.
     */
    computeOriginalBitString() {
        var outputLength = this.convolution.outputLength;
        this.fsm.resetState();
        this.originalBitString = "";
        for (var i = 0; i < this.recievedCodeBitTupelCounter; i++) {
            var timeStep = i;
            var startPos = timeStep * outputLength;
            var endPos = (timeStep + 1) * outputLength

            // Diese Bitsequenz enthält n Bits (Anzahl der Codebits pro Kodierung)
            var bitSequence = this.bitBuffer.slice(startPos, endPos)

            // Hier wird die fehlerfreie BitSequence mithilfe der bit isFlipped Variable ermittelt 
            var correctBitNumberSequenceArray = [];
            bitSequence.forEach((bit) => {
                if (bit.isFlipped) {
                    correctBitNumberSequenceArray.push(Math.abs(bit.value - 1));
                } else {
                    correctBitNumberSequenceArray.push(bit.value);
                }
            });

            // Hier wird die urprüngliche Eingabe auf Basis der ursprünglichen Ausgabe des Faltungscode mit einer FSM ermittelt
            var inputBitValue = this.fsm.transitionByOutput(correctBitNumberSequenceArray);

            if (inputBitValue === undefined) {
                this.originalBitString += " ";
            } else {
                // Die dekodierte Bitkette wird als String an in die originaleBitString angefügt
                this.originalBitString += inputBitValue;
            }
        }
    }

    /**
     * Vergleicht DecodedBitString mit OriginalBitString
     * @returns {Array<Bit>} Gibt den Array mit Bits zurück
     */
    getDecodedBitArray() {
        var bitArray = [];

        var originalBitString = this.originalBitString;
        var decodedBitString = this.decodedBitString;

        var lengthWithoutTailbits = this.length - this.convolution.constraintLength + 1;
        for (var i = 0; i < lengthWithoutTailbits; i++) {
            var startPos = i * this.convolution.outputLength;
            var endPos = (i + 1) * this.convolution.outputLength;

            var bitSequence = this.bitBuffer.slice(startPos, endPos)

            var decodedBitValue = decodedBitString[i];
            var originalBitValue = originalBitString[i]

            var bitValue = parseInt(decodedBitValue);
            var isFlipped = (decodedBitValue !== originalBitValue);
            var isInfoBit = bitSequence[0].isInfoBit;
            var bit;
            if (isNaN(bitValue)) {
                // 
                bit = new Bit(0, true, false);
            } else {
                bit = new Bit(bitValue, isFlipped, isInfoBit)

            }

            bitArray.unshift(bit);
        }
        return bitArray;
    }

    /**
     * 
     * @param {String} svgElementID The id of the element which should display the trellis diagram svg *NEVER USED*
     * @param {*} outputElementID The id of the element in which the outputBuffer content is shown *NEVER USED*
     */
    toHTML(svgElementName, outputElementName) {
        var svg = document.getElementById("trellisDiagram");

        if (this.trellis === undefined) {
            this.trellis = new Trellis(this.fsm, this.length, svg);
        }

        // Update Trellis Nodes
        //this.trellis.nodes = this.nodes;
        this.trellis.branchMetricsList = this.branchMetricsList;
        this.trellis.statesMetricsList = this.statesMetricsList;
        this.trellis.survivalPaths = this.survivalPaths;
        this.trellis.survivedPaths = this.survivedPaths;
        this.trellis.toHTML()

        // Wir fügen noch zwei leere Bits an, diese repräsentieren die Tailbits
        var decodedBits = this.getDecodedBitArray().reverse().concat([new EmptyBit(), new EmptyBit()]);

        this.trellis.updateRecievedBitText(this.bitBuffer);
        this.trellis.updateDecodedBitText(decodedBits);

        var trellisOutputCanal = document.getElementById("trellisOutputCanal");
        trellisOutputCanal.innerHTML = "";
        trellisOutputCanal.appendChild(convertBitArrayToSpan(this.outputBuffer));
    }

}