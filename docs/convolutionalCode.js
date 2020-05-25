"use strict";

class ConvolutionalEncoder extends BitRegister {
    /**
     * @param {Convolution} convolution The convolution thats used to populate the state machine
     * @param {number} blockLength Defines how many bits the coder recieves, before it sends tail bits, 0 if continous data stream is needed
     */
    constructor(convolution, blockLength = 0) {
        super('0'.repeat(convolution.constraintLength));
        this.convolution = convolution;
        this.fsm = new FiniteStateMachine(convolution.func, convolution.constraintLength - convolution.inputLength);

        // How many bits will be encoded without tailbits
        this.blockLength = blockLength;
        // How many bits of one block have already been encoded
        this.blockCounter = 0;
        this.tailBitCounter = 0;

        // How many tailbits have to be sent, 
        // we need to fill all cells of the finite state machine with zeros
        this.maxTailbits = convolution.constraintLength - 1;
        this.tailMode = false;
    }

    onShiftBitIn() {
        // The convolutional code encodes $\nu$ (maxTailbits) tailbits after encoding a block
        if (this.isInTailBitMode) {
            if (this.tailBitCounter >= this.maxTailbits - 1) {
                this.tailMode = false;
                this.blockCounter = 0;
                this.tailBitCounter = 0;
            } else {
                this.tailBitCounter++;
            }
        } else if (this.blockCounter >= this.blockLength - 1) {
            this.tailMode = true;
        } else {
            this.blockCounter++;
        }
        this.bitBuffer.unshift(this.inputBuffer.pop());
        // Das letzte Element fällt aus dem Faltungskodierer
        this.bitBuffer.pop();

        // Die Ausgabe ergibt sich aus 
        this.outputBuffer = this.convolute().concat(this.outputBuffer);
    }

    /**
     * @returns {Bit}
     */
    shiftBitOut() {

        if (this.outputBuffer.length === 0) {
            // Es sollen immer Bits, die korrekt kodiert wurden vom Faltungskodierer ausgegeben werden ,
            // also Bits die von der shiftBitBuffer Funktion in den outputBuffer geschrieben wurden 
            super.shiftBitIn(new EmptyBit());
        }
        return this.outputBuffer.pop();
    }

    /**
     * Erzeuge ein output, auf Basis des aktuellen Zustand in der Zustandsmaschine und dem Input (das erste Bit im bitBuffer)
     * @returns {Array<Bit>}
     */
    convolute() {
        var inputBit = this.bitBuffer[0];

        var output = this.fsm.transition(inputBit.value);
        var isInfoBit = inputBit.isInfoBit;

        var outputBits = Array(output.length);

        // Wenn ein bereits gekipptes Bit hier kodiert wird,
        // würde es hier die Information verlieren, dass es gekippt ist.
        for (var i = 0; i < output.length; i++) {
            outputBits[i] = new Bit(output[i], false, isInfoBit);
        }
        return outputBits.reverse();
    }

    toHTML(elementID) {
        super.toHTML(elementID, false, false, true);
    }

    get isInTailBitMode() {
        return this.tailMode;
    }
}