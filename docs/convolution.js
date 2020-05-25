/**
 * Informationen über den Faltungskodierer
 */
class Convolution {
    /**
     * 
     * @param {convolutionFunction} func Convolution function, takes as parameter input an number array with inputLength and returns an number array with outputLength, the numbers should be binary 
     * @param {number} inputLength length of the input array 
     * @param {number} outputLength length of the output array
     * @param {number} constraintLength 
     */
    constructor(func, inputLength, outputLength, constraintLength) {
        this.func = func;
        this.inputLength = inputLength;
        this.outputLength = outputLength;
        this.constraintLength = constraintLength;
    }
}
/**
 * @callback convolutionFunction
 * @param {Array<number>} input Zahl muss eins oder null sein
 * @returns {Array<number>} Zahl muss eins oder null sein
 */

/**
 * c1 = in0 ^ in1 ^ in2
 * 
 * c2 = in0 ^ in2
 */
class Convolution1 extends Convolution {
    constructor() {
        super(function (input) {
            var c1 = input[0] ^ input[1] ^ input[2]
            var c2 = input[0] ^ input[2]
            return [c1, c2]
        }, 1, 2, 3);
    }
}

// Aus Übung
/**
 * c1 = in0 ^ in1 ^ in2
 * 
 * c2 = in1 ^ in2
 * 
 * c3 = in0 ^ in2
 */
class Convolution2 extends Convolution {
    constructor() {
        super(function (input) {
            var c1 = input[0] ^ input[1] ^ input[2]
            var c2 = input[1] ^ input[2]
            var c3 = input[0] ^ input[2]
            return [c1, c2, c3]
        }, 1, 3, 3);
    }
}

// Aus Faltungscodes.pdf
// Ein katastrophaler Faltungscode
// Dieser erzeugt im Übergang 11 -> 11 : 00 

/**
 * c1 = in0 ^ in2
 * 
 * c2 = in1 ^ in2
 */
class Convolution3 extends Convolution {
    constructor() {
        super(function (input) {
            var c1 = input[0] ^ input[2]
            var c2 = input[1] ^ input[2]
            return [c1, c2]
        }, 1, 2, 3);
    }
}