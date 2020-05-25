/**
 * This Trellis Class is used to display the trellis only
 * It is not used for decoding but only for visual purpose
 */

class Trellis {
    /**
     * 
     * @param {FiniteStateMachine} fsm 
     * @param {number} length 
     */
    constructor(fsm, length, svg) {
        this.state_count = fsm.states.length;

        // How many segments the trellis has
        this.length = length;
        this.currentState = fsm.states
        this.fsm = fsm;
        this.svg = svg;

        this.trellisHelper = new TrellisHelper();
        this.generateTrellisGraph();
        this.branchMetricsList = [];
        this.statesMetricsList = [];
    }

    /**
     * 
     * @param {HTMLElement} svg 
     */
    generateGrid() {
        var svg = this.svg;
        var state_transitions = this.fsm.state_transitions;

        for (var i = 0; i < this.length; i++) {
            state_transitions.forEach((transition) => {
                var currentStateIndex = transition.current_state_index;
                var nextStateIndex = transition.next_state_index;
                var transitionInputCharacter = transition.input_character;
                svg.appendChild(this.trellisHelper.transitionLineSVG(currentStateIndex, nextStateIndex, transitionInputCharacter, i));
            });
        }

        var stateCount = this.fsm.states.length;

        /**
         * Hier werden alle Knoten im SVG eingezeichnet 
         */
        for (var i = 0; i <= this.length; i++) {
            for (var j = 0; j < stateCount; j++) {
                var timeIndex = i;
                var stateIndex = j;
                if (i === this.length) {
                    svg.appendChild(this.trellisHelper.nodeWithLabel(stateIndex, timeIndex, false));
                } else {
                    svg.appendChild(this.trellisHelper.nodeWithLabel(stateIndex, timeIndex, true));

                    // set the text of the output labels, these represent the output bits of one state transition
                    this.fsm.state_transitions.forEach((transition, transitionIndex) => {
                        if (transition.current_state_index === stateIndex) {
                            var inputCharacter = transition.input_character;
                            var transitionOutputLabel = transition.output;
                            this.trellisHelper.updateTransitionOutputLabel(svg, inputCharacter, stateIndex, timeIndex, transitionOutputLabel)
                        }
                    });
                }
            }
        }
    }

    generateTrellisGraph() {
        var svg = this.svg;
        var length = this.length;
        var svgWidth = this.trellisHelper.marginX * 2 + this.trellisHelper.distanceX * this.length + this.trellisHelper.marginXRight + 300;
        var svgHeight = this.trellisHelper.marginY * 6 + this.trellisHelper.distanceY * 4;
        var trellisHelper = this.trellisHelper;

        var fsm = this.fsm
        var states = fsm.states;
        var statesLength = states.length;


        svgWidth = trellisHelper.offsetLeft + trellisHelper.distanceX * length + trellisHelper.offsetRight;
        svgHeight = trellisHelper.offsetTop + trellisHelper.distanceY * statesLength + trellisHelper.distanceTrellisRecievedText + trellisHelper.distanceRecievedDecodedText;

        svg.innerHTML = "";

        svg.setAttributeNS(null, "width", svgWidth);
        svg.setAttributeNS(null, "height", svgHeight);
        this.generateGrid();

        for (var i = 0; i < statesLength; i++) {
            var stateIndex = i;
            var stateLabel = states[i].join("");

            svg.appendChild(this.trellisHelper.stateLabelTextSVG(stateIndex, stateLabel))
        }

        svg.appendChild(this.trellisHelper.labelSVG(fsm));
        /**
         * Definiere Darstellung 
         */
        for (var i = 0; i < length; i++) {
            svg.appendChild(this.trellisHelper.transmittedBitTextSVG(i, [new EmptyBit(), new EmptyBit(), new EmptyBit()]));
            svg.appendChild(this.trellisHelper.decodedBitTextSVG(i, new EmptyBit()));
        }
    }

    /**
     * 
     * @param {*} bits Recieved Bits
     */

    updateRecievedBitText(bits) {
        var svg = this.svg;
        for (var i = 0; i < this.length; i++) {
            // Die Bits werden in Blöcke mit je n Bits (Anzahl der Codebits pro Kodierung) eingeteilt
            var bitsSection = bits.slice(i * convolutionOutputLength, (i + 1) * convolutionOutputLength);
            this.trellisHelper.updateTransmittedBitTextSVG(svg, i, bitsSection)
        }
    }

    /**
     * 
     * @param {Array<Bit>} bits The decoded Bits 
     */
    updateDecodedBitText(bits) {
        var svg = this.svg;
        for (var i = 0; i < this.length; i++) {
            var decodedBit = bits[i];
            this.trellisHelper.updateDecodedBitTextSVG(svg, i, decodedBit);
        }
    }

    updateBranchLabels() {
        var stateTransitions = this.fsm.state_transitions;

        // Update branch labels for hamming distance 
        // branch time steps
        var branchListLength = this.branchMetricsList.length;
        for (var i = 0; i < branchListLength; i++) {
            var timeIndex = i;
            var branchMetrics = this.branchMetricsList[i];
            var transitionsLength = stateTransitions.length;
            for (var j = 0; j < transitionsLength; j++) {
                // update hamming distance label

                var transitionIndex = j;

                var branchMetricText = ""
                if (branchMetrics === undefined || branchMetrics.length === 0) {
                    // We want to reset the branch metrics labels at this time step 
                    // Because we do not know it yet
                    branchMetricText = ""
                } else {
                    branchMetricText = branchMetrics[transitionIndex]
                }

                var inputCharacter = stateTransitions[transitionIndex].input_character;
                var stateIndex = stateTransitions[transitionIndex].current_state_index;
                this.trellisHelper.updateTransitionLabel(this.svg, inputCharacter, stateIndex, timeIndex, branchMetricText)
            }
        }
    }

    updateNodeLabelsWithPathMetric() {
        // Update state labels with path distance 
        var states = this.fsm.states;

        // state time steps
        var statesMetricsListLength = this.statesMetricsList.length;
        for (var i = 0; i < statesMetricsListLength; i++) {
            var timeIndex = i;
            var statesMetrics = this.statesMetricsList[i];
            var statesLength = states.length;
            for (var j = 0; j < statesLength; j++) {
                // update states label with path metric

                var stateIndex = j;

                var pathMetricText = ""
                if (statesMetrics === undefined || statesMetrics.length === 0) {
                    // We want to reset the branch metrics labels at this time step 
                    // Because we do not know it yet
                    pathMetricText = ""
                } else {
                    pathMetricText = statesMetrics[stateIndex]["pathMetric"]
                    if (pathMetricText === Infinity) {
                        pathMetricText = "∞"
                    }
                    if (pathMetricText === undefined) {
                        pathMetricText = ""
                    }
                }

                this.trellisHelper.updateStateLabel(this.svg, stateIndex, timeIndex, pathMetricText)
            }
        }
    }

    resetBranchClasses() {
        for (var i = 0; i < this.length; i++) {
            var timeIndex = i;
            this.fsm.state_transitions.forEach((transition, transitionIndex) => {
                var stateIndex = transition.current_state_index;
                var nextStateIndex = transition.next_state_index;
                this.trellisHelper.changeClassOfTransitionLine(this.svg, stateIndex, nextStateIndex, timeIndex, "basePath");
            })
        }
    }

    /**
     * 
     * @param {Set<number>} transitionSet 
     * @param {string} classname 
     */
    updateBranchClassesByTransitionSet(transitionSet, timeIndex, lineClass) {
        transitionSet.forEach((transitionIndex) => {
            var transition = this.fsm.state_transitions[transitionIndex];
            var stateIndex = transition.current_state_index;
            var nextStateIndex = transition.next_state_index;
            this.trellisHelper.changeClassOfTransitionLine(this.svg, stateIndex, nextStateIndex, timeIndex, lineClass);
        })

    }

    updateBranchClasses() {
        // We have 3 types of classes
        // Paths that have never been selected
        this.resetBranchClasses();

        var survivalPaths = this.survivalPaths;
        if (survivalPaths === undefined) return
        var survivalPathsLength = survivalPaths.length;
        for (var i = 0; i < survivalPathsLength; i++) {
            var timeIndex = i;

            this.updateBranchClassesByTransitionSet(this.survivedPaths[timeIndex], timeIndex, "selectedPath")
            this.updateBranchClassesByTransitionSet(this.survivalPaths[timeIndex], timeIndex, "survivalPath")
        }
    }

    /**
     * Verstecke alle Übergänge, Zustände und Labels die nicht beachtet werden, weil diese terminiert sind.
     */
    hideTerminatedTransitionsAndStates() {
        var terminationLength = this.fsm.termination_time;
        var terminationStartTimeIndex = this.length - terminationLength;

        var terminatedTransitions = this.fsm.terminatedTransitions;
        var terminatedStates = this.fsm.terminatedStates;

        for (var i = 0; i < terminationLength; i++) {
            var timeIndex = terminationStartTimeIndex + i;
            var terminationIndex = terminationLength - i - 1;

            terminatedTransitions[terminationIndex].forEach((transitionIndex) => {
                var transition = this.fsm.state_transitions[transitionIndex];
                var stateIndex = transition.current_state_index;
                var nextStateIndex = transition.next_state_index;
                var inputCharacter = transition.input_character;
                this.trellisHelper.changeClassOfTransitionLine(this.svg, stateIndex, nextStateIndex, timeIndex, "hiddenPath");
                this.trellisHelper.updateTransitionOutputLabel(this.svg, inputCharacter, stateIndex, timeIndex, "");
                this.trellisHelper.updateTransitionLabel(this.svg, inputCharacter, stateIndex, timeIndex, "");
            });

            terminatedStates[terminationIndex].forEach((stateIndex) => {
                this.trellisHelper.updateStateLabel(this.svg, stateIndex, timeIndex + 1, "");
            });

        }
    }

    toHTML() {
        this.updateBranchLabels();
        this.updateNodeLabelsWithPathMetric();
        this.updateBranchClasses();
        this.hideTerminatedTransitionsAndStates();

        if (isTransitionOutputLabelVisible === true) {
            this.trellisHelper.showTransitionOutputLabels(this.svg)
        } else {
            this.trellisHelper.showTransitionLabels(this.svg)

        }
    }
}