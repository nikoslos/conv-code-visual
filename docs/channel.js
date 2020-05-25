"use strict";

/**
 *   Implementation of the core module for my convolutional code simulation project 
 */
class BitRegister {
    /**
     * 
     * @param {String} bitInputString Takes a string with zero and ones, 
     * @param {boolean} isInfoBit Determines wether this register is initialized with bits that are input by users or ZeroBits.
     * @param {number} maxIndex After this BitRegister was synchronized, an index counter will start. The maxIndex sets the maximal value of that index. If the index reaches maxIndex it will be reset to 0.
     */
    constructor(bitInputString, isInfoBit = false, maxIndex = 0) {
        this.bitLength = bitInputString.length;
        this.inputBuffer = [];
        this.bitBuffer = convertBitStringToBitArray(bitInputString, isInfoBit);
        this.outputBuffer = [];
        this.synchronized = false;
        this.maxIndex = maxIndex;
        this.index = 0;
    }

    /**
     * Diese Funktion schiebt ein Bit in den inputBuffer. Diese Funktion funktioniert erst, wenn ein Bit mit isInfoBit true
     * eingeschoben wurde. Dieses sorgt dafür, dass jeder Kanal synchronisiert wird. 
     * Nachdem ein Bit in den inputBuffer geschoben wurde wird die onShiftBitIn Fuktion aufgerufen, diese kann von den erbenden Klassen überschrieben werden.
     * 
     * @param {Bit} bit A single bit if bit is not of type Bit nothing will happen 
     */
    shiftBitIn(bit) {
        /**
         * Es sollen nur Bits in den Kanal eingeschoben werden
         */
        if (bit instanceof Bit) {
            if (!this.synchronized && bit.isInfoBit) {
                this.synchronized = true;
            }
            if (this.synchronized) {
                /**
                 * Index Counter
                 */
                this.index++;
                if (this.index > this.maxIndex) {
                    this.index = 0;
                }
                this.inputBuffer.unshift(bit);
                this.onShiftBitIn();
            }
        }
    }

    /**
     * This function will be executed when a bit gets shifted into the inputBuffer
     */
    onShiftBitIn() {
        // Move one bit from the input buffer to the bit buffer
        this.bitBuffer.unshift(this.inputBuffer.pop());

        // Move one bit from the bit buffer to the output buffer
        this.outputBuffer.unshift(this.bitBuffer.pop());
    }

    /**
     * @returns {Bit} 
     */
    shiftBitOut() {
        return this.outputBuffer.pop();
    }

    /**
     * Gibt zurück wieviele Elemente noch im OutputBuffer sind
     */
    get outputBufferSize() {
        return this.outputBuffer.length;
    }


    /**
     * @returns {number}
     */
    get inputBufferSize() {
        return this.inputBuffer.length;
    }

    /**
     * Stellt den Inhalt des Moduls in einem HTMLelement, mit der elementID dar.
     * @param {*} elementID 
     * @param {boolean} useInputSpacing Is there a gap after every n Bits when displaying the inputBuffer 
     * @param {boolean} useSpacing Is there a gap after every n Bits when displaying the bitBuffer 
     * @param {boolean} useOutputSpacing Is there a gap after every n Bits when displaying the outputBuffer 
     */
    toHTML(elementID, useInputSpacing = true, useSpacing = true, useOutputSpacing = true) {
        var div = document.getElementById(elementID);
        div.innerHTML = "";

        /**
         * Stelle Input Buffer dar
         */
        if (this.inputBuffer.length > 0) {
            var inputBufferSpan = convertBitArrayToSpan(this.inputBuffer, useInputSpacing);
            div.appendChild(inputBufferSpan);
            div.append(" | ");
        }

        /**
         * Stelle bitBuffer dar
         */
        var bufferSpan = convertBitArrayToSpan(this.bitBuffer, useSpacing, this.index);
        div.appendChild(bufferSpan)

        /**
         * Stelle outputBuffer dar
         */
        if (this.outputBuffer.length > 0) {
            var outputBufferSpan = convertBitArrayToSpan(this.outputBuffer, useOutputSpacing);
            div.append(" | ");
            div.appendChild(outputBufferSpan);
        }
    }
}

/**
 * 
 */

class BufferBitRegister extends BitRegister {
    constructor(length, maxIndex = convolutionOutputLength - 1) {
        super("0".repeat(length), false, maxIndex);
    }
}

/**
 * Wird verwendet um vom Nutzer eingegebene Bits ein und auszuschieben.
 * Der InfoBitRegister nimmt nur Bits auf, bei denen bit.infoBit === true gilt.
 */

class InfoBitRegister extends BitRegister {
    /**
     * 
     * @param {string} bitString 
     */
    constructor(bitString) {
        super(bitString, true);
    }

    onShiftBitIn() {
        // Only let bits in that are userBit
        var inputBit = this.inputBuffer.pop();
        if (inputBit.isInfoBit === true) {
            this.bitBuffer.unshift(inputBit);
        }
    }

    shiftBitOut() {
        var outputBit = this.bitBuffer.pop();
        if (outputBit instanceof Bit) {
            return outputBit;
        }
        return new EmptyBit();
    }

    /**
     * @returns {Boolean}
     */
    isEmpty() {
        if (this.outputBuffer.length === 0 && this.bitBuffer.length === 0) {
            return true;
        } else {
            return false;
        }
    }

}

/**
 * Wird verwendet um vom Nutzer eingegebene Bits in einen String umzuwandeln und
 * um einen vom Nutzer eingegebenen String in Bits umzuwandeln
 */

class UserStringRegister extends BitRegister {
    constructor(string = "") {
        super('', true);
        this.string = string;
    }

    /**
     * Es sollen nur Infobits eingeschoben werden
     * @param {Bit} bit 
     */
    shiftBitIn(bit) {
        if (bit instanceof Bit && bit.isInfoBit) {
            super.shiftBitIn(bit);
        }
    }
    /**
    * Wenn 16 Bit eingeschoben wurden, wandle diese wieder in ein Zeichen um
    * Diese 16 Bit ergeben sich, da wir UTF-16 zur Zeichenkodierung verwenden.
    * Bei diesem werden 16 Bit verwendet um ein Zeichen zu kodieren.
    */
    onShiftBitIn() {


        if (this.inputBuffer.length === 16) {
            var bitString = "";
            this.inputBuffer.forEach((bit) => {
                bitString += bit.value;
            });
            var number = binary_string_to_number(bitString);
            this.string = String.fromCharCode(number) + this.string;
            this.inputBuffer = [];
        }
    }

    /**
     * Wenn kein Bit im outputBuffer ist, wird das letzte Zeichen des strings in Bits umgewandelt 
     * und in den outputBuffer geschrieben.
     * Ein Bit wird ausgegeben.
     */
    shiftBitOut() {
        if (this.outputBuffer.length === 0) {
            var lastChar = this.string.slice(-1);
            this.string = this.string.slice(0, -1);
            /**
             * Wenn kein Zeichen mehr im String vorhanden ist wird ein leeres Bit ausgegeben.
             */
            if (lastChar.length === 0) {
                return new EmptyBit();
            }
            var lastCharNumber = lastChar.charCodeAt(0)
            var binaryString = number_to_binary_string(lastCharNumber, 16);
            this.outputBuffer = convertBitStringToBitArray(binaryString, true);
        }
        return this.outputBuffer.pop();
    }
    /**
     * @returns {Boolean}
     */
    isEmpty() {
        if (this.outputBuffer.length === 0 && this.string.length === 0) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @param {string} elementID ID des Elementes, in das dass Modul geschrieben werden soll.
     */
    toHTML(elementID) {
        var div = document.getElementById(elementID);
        div.innerHTML = "";

        /**
         * Display content of inputBuffer
         */
        var inputBufferSpan = convertBitArrayToSpan(this.inputBuffer, false);
        div.appendChild(inputBufferSpan)

        /**
         * Display string
         */
        div.appendChild(document.createElement("br"))
        div.append(this.string);
        div.appendChild(document.createElement("br"))

        /**
         * Display content of outputBuffer
         */
        var outputBufferSpan = convertBitArrayToSpan(this.outputBuffer, false);
        div.appendChild(outputBufferSpan)
    }
}