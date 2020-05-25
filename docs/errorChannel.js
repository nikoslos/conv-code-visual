class ErrorCanal extends BufferBitRegister {
    /**
     * 
     * @param {value} length 
     * @param {Array<>} errors Contains a list of possible errors see interface
     */
    constructor(length, errors) {
        super(length);

        // probability that a burst ends
        this.transitionProbabilityToGoodState = 0.05;
        this.transitionProbabilityToGoodState = errors["transProb_BadToGood"];

        // probability that a burst starts
        this.transitionProbabilityToBadState = 0.01;
        this.transitionProbabilityToBadState = errors["transProb_GoodToBad"];

        // single error probability
        this.errorProbabilityGoodState = 0.05;
        this.errorProbabilityGoodState = errors["errorProb_Good"];

        // burst error probability
        this.errorProbabilityBadState = 0.5;
        this.errorProbabilityBadState = errors["errorProb_Bad"];

        this.burstState = false;

    }

    /**
     * 
     * @param {number} probability Number between 0 and 1 including 0 and 1
     * @returns {boolean} 
     */
    randomEvent(probability) {
        var randomNumber = Math.random();
        if (randomNumber < probability) {
            return true;
        }
        return false;
    }

    onShiftBitIn() {
        // Get the last bit from the inputBuffer
        var bit = this.inputBuffer.pop();

        var produceError = false;
        var transitionState = false;
        if (this.burstState) {
            // BAD STATE
            var transProbToGoodState = this.transitionProbabilityToGoodState;
            var errorProbBadState = this.errorProbabilityBadState;
            produceError = this.randomEvent(errorProbBadState);
            transitionState = this.randomEvent(transProbToGoodState);
        } else {
            // GOOD STATE
            var transProbToBadState = this.transitionProbabilityToBadState;
            var errorProbGoodState = this.errorProbabilityGoodState;
            produceError = this.randomEvent(errorProbGoodState);
            transitionState = this.randomEvent(transProbToBadState);

        }
        if (produceError) {
            bit.value = Math.abs(1 - bit.value);
        }
        if (transitionState) {
            this.burstState = !this.burstState;
        }

        // shift bit in the bitBuffer
        this.bitBuffer.unshift(bit)

        // shift last bit of bitBuffer into the outputBuffer
        this.outputBuffer.unshift(this.bitBuffer.pop());
    }
}