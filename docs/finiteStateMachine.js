class State_Transition {
    constructor(current_state, current_state_index, input, output, next_state, next_state_index) {
        this.current_state = current_state;
        this.current_state_index = current_state_index;
        this.input_character = input;
        this.output = output;
        this.next_state = next_state;
        this.next_state_index = next_state_index;

    }
}

class FiniteStateMachine {
    /**
     * 
     * @param {function} convolutionFunction 
     * @param {number} bitLength Bestimmt, wieviele Bits ein Zustand hat. 
     * Wenn bitLength=1, dann wären dass 2 Mögliche zustände, bei 2 wären es 4, usw.
     * How many bits does each state have, for 1 the zero state will look like : [0], for 2 like [0,0] for 3 like [0,0,0], etc.
     */
    constructor(convolutionFunction, bitLength) {

        // We use bits as input alphabet
        this.input_alphabet = [
            0,
            1
        ];
        var statesCount = Math.pow(2, bitLength);
        this.states = [];

        // Alle möglichen Zustände für die jeweilige Bitlänge
        for (var i = 0; i < statesCount; i++) {
            this.states.push(number_to_binary_number_array(i, bitLength));
        }
        this.current_state_index = 0;

        this.terminated_states = [];

        this.terminated_transitions = [];

        /**
         * This function is used to calculate the transition from state, given some input
         * 
         * @param {number} stateIndex 
         * @param {Array<number>} input 
         * @returns {State_Transition}
         */
        function get_state_transition(states, stateIndex, input) {
            var state = states[stateIndex];

            // next state is the input character and  and Add input at the beginning and remove last bit from state and add  
            var nextState = [input, ...state.slice(0, state.length - 1)];

            // find index of nextState
            var next_state_index = -1;
            for (var i = 0; i < states.length; i++) {
                if (nextState.equals(states[i])) {
                    next_state_index = i;
                    break;
                }
            }
            // [input,...state], der Zellinhalt der Zustandsmaschine
            var output = convolutionFunction([input, ...state]);
            return new State_Transition(state, stateIndex, input, output, nextState, next_state_index);
        }

        /**
         * Erstellt eine Liste an Übergängen
         * @param {Array} states 
         * @param {number} input_alphabet 
         */
        function add_state_transitions(states, input_alphabet) {
            var state_transitions = [];
            var statesCount = states.length;
            var inputAlphabetLength = input_alphabet.length;

            // Wir probieren alle möglichen Zustands und Eingabe Kombinationen durch
            for (var i = 0; i < statesCount; i++) {
                for (var j = 0; j < inputAlphabetLength; j++) {
                    state_transitions.push(get_state_transition(states, i, input_alphabet[j]))
                }
            }
            return state_transitions;
        }

        this.state_transitions = add_state_transitions(this.states, this.input_alphabet);

        // How many time steps does a termination take
        this.termination_time = bitLength

        this.find_terminated_transitions_and_states();


    }

    // Used to initialize terminated_transitions
    // Used to initialize terminated_states
    find_terminated_transitions_and_states() {
        // Endstate is 00
        var endStateIndex = 0;
        var stateTransitions = this.state_transitions;

        // All states and transitions that will be considered during the termination phase
        // read backwards
        var terminationTransitions = new Array(this.termination_time);
        var terminationStates = new Array(this.termination_time);


        for (var i = 0; i < this.termination_time; i++) {
            terminationTransitions[i] = new Set();
            terminationStates[i] = new Set();
        }

        // Last state is always zero
        terminationStates[0].add(endStateIndex);
        for (var i = 0; i < this.termination_time; i++) {
            terminationStates[i].forEach((stateIndex) => {
                stateTransitions.forEach((transition, transitionIndex) => {
                    if (transition.next_state_index === stateIndex) {
                        if (i < this.termination_time - 1) {
                            terminationStates[i + 1].add(transition.current_state_index)
                        }
                        terminationTransitions[i].add(transitionIndex);
                    }
                });
            });

        }

        // All states and transitions that will not be considered during the termination phase
        var terminatedTransitions = new Array(this.termination_time);
        var terminatedStates = new Array(this.termination_time);

        for (var i = 0; i < this.termination_time; i++) {
            terminatedStates[i] = new Set();
            terminatedTransitions[i] = new Set();

            // Add all states to terminatedStates
            this.states.forEach((state, stateIndex) => {
                terminatedStates[i].add(stateIndex);
            })

            // Add all transitions to terminatedTransitions
            this.state_transitions.forEach((transition, transitionIndex) => {
                terminatedTransitions[i].add(transitionIndex);
            });

            // Remove all states and transitions thta are alread in terminationStates und terminationTransitions
            terminationStates[i].forEach((stateIndex) => {
                terminatedStates[i].delete(stateIndex);
            });

            terminationTransitions[i].forEach((transitionIndex) => {
                terminatedTransitions[i].delete(transitionIndex);
            });
        }

        this.terminationTransitions = terminationTransitions;
        this.terminationStates = terminationStates;
        this.terminatedTransitions = terminatedTransitions;
        this.terminatedStates = terminatedStates;
    }

    /**
     * In den nächsten Zustand überführen mit der Eingabe
     * @returns {Array<number>} Ausgabe Array zum Beispiel [0,1] 
     * @param {number} input_character 
     */
    transition(input_character) {
        var filtered_state_transitions = this.state_transitions.filter((transition) => {
            return (input_character === transition.input_character && this.current_state_index === transition.current_state_index);
        }
        )
        if (filtered_state_transitions.length === 1) {
            this.current_state_index = filtered_state_transitions[0].next_state_index;
            return filtered_state_transitions[0].output;
        } else if (filtered_state_transitions.length > 1) {
            throw ("Transition ambiguous (StateMachine)");
        } else {
            throw ("Transition from state_index " + this.current_state_index + " with an input of " + input_character + " not possible (StateMachine)");
        }
    }

    /**
     * Überführt in den nächsten Zustand anhand der Ausgabe des nächsten Zustandes
     * @param {Array<number>} bitNumberArray 
     * @returns Gibt die Eingabe des Übergangs zurück für, falls nicht vorhanden undefined
     */
    transitionByOutput(bitNumberArray) {
        var filtered_state_transitions = this.state_transitions.filter(
            (transition) => {
                return bitNumberArray.equals(transition.output) && this.current_state_index === transition.current_state_index;
            }
        )
        if (filtered_state_transitions.length === 1) {
            this.current_state_index = filtered_state_transitions[0].next_state_index;
            return filtered_state_transitions[0].input_character;
        }
        return undefined;
    }

    /**
     * @param {number} originStateIndex
     * @param {number} nextStateIndex
     * @returns {number} returns transition index, if transition between origin state and next state exists, otherwise it returns -1
     */
    getTransitionIndexByStateIndexes(originStateIndex, nextStateIndex) {
        var selectedTransitionIndex = -1;
        this.state_transitions.forEach((transition, transitionIndex) => {
            if (transition.current_state_index === originStateIndex && transition.next_state_index === nextStateIndex) {
                selectedTransitionIndex = transitionIndex;
            }
        });
        return selectedTransitionIndex;
    }

    resetState() {
        this.current_state_index = 0;
    }
}