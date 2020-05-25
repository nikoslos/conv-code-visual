"use strict";

/**
 * @description {}
 * @param {number} value
 * @returns {boolean} 
 */
function isZeroOrOne(value) {
    if (value === 1 || value === 0) {
        return true;
    } else false;
}

class Bit {

    /**
     * @param {number} value The value of the bit (0 or 1) not "0" or "1" (no string)
     * @param {boolean} flipped Is the bit shifted
     * @param {boolean} isInfoBit Will the bit be affected by errors
     */
    constructor(value, flipped = false, isInfoBit = true) {
        if (isZeroOrOne(value)) {
            this._value = value;
            this._flipped = flipped;
            this._infoBit = isInfoBit;
        } else {

            this._value = 0;
            this._flipped = false;
            this._infoBit = false;
            console.log(value, "is not a correct input!");
        }
    }

    /**
     * @returns {Bit}
     */
    get isFlipped() {
        return this._flipped;
    }

    /**
     * @returns {Bit} true if bit is input by user
     */
    get isInfoBit() {
        return this._infoBit;
    }

    /**
     * @returns {Bit} Value of bit.
     */
    get value() {
        return this._value;
    }

    /**
     * sets new value only If new value differs from current value.
     * Then shifted will be set to true.
     * @param {number} newValue 
     */
    set value(value) {
        if (this._value !== value) {
            this._value = value;
            this._flipped = !this._flipped;
        }
    }

    /**
     * @returns {HTMLSpanElement}
     */
    get HTML() {
        var span = document.createElement('span');

        span.textContent = this.value;
        if (this.isInfoBit) {
            if (!this._flipped) {
                span.setAttribute('class', "infoBit");
            } else {
                span.setAttribute('class', "flippedInfoBit");
            }
        } else {
            if (!this._flipped) {
                span.setAttribute('class', "fillBit");
            } else {
                span.setAttribute('class', "flippedFillBit");
            }
        }
        return span;
    }

    /**
     * @returns {HTMLElement}
     */
    get SVG() {
        var span = document.createElementNS(svgNS, 'tspan');
        span.textContent = this.value;
        if (this.isInfoBit) {
            if (!this._flipped) {
                span.setAttribute('class', "infoBit");
            } else {
                span.setAttribute('class', "flippedInfoBit");
            }
        } else {
            if (!this._flipped) {
                span.setAttribute('class', "fillBit");
            } else {
                span.setAttribute('class', "flippedFillBit");
            }
        }
        return span;
    }
}

class OneBit extends Bit {
    constructor() {
        super(1, false, true);
    }
}

class ZeroBit extends Bit {
    constructor() {
        super(0, false, true);
    }
}

/**
 * This bit is used to represent bits that aren't input by users. 
 * It is used for bits that fill the simulator before and after the user specified bits.
 */
class EmptyBit extends Bit {
    constructor() {
        super(0, false, false);
    }
}

/**
 * This function only converts '0' and '1' every other character will return false
 * @param {String} character 
 * @param {*} infoBit 
 */

function convertBitCharacterToBit(character, infoBit) {
    if (infoBit) {
        if (character === '1') {
            return new OneBit();
        } else if (character === '0') {
            return new ZeroBit();
        } else {
            return false;
        }
    }
    return new EmptyBit();
}

/**
 * 
 * @param {String} string 
 * @param {boolean} infoBit Does this Bit contain any information
 * @returns {Array<Bit>} Array of Bits
 */

function convertBitStringToBitArray(string, infoBit = true) {
    var bits = [];
    var l = string.length;
    for (var i = 0; i < l; i++) {
        var bit = convertBitCharacterToBit(string[i], infoBit);
        if (bit === false)
            continue;
        bits.push(bit)
    }
    return bits;
}

/**
 * For usage in Html
 * @param {Array<Bit>} bits 
 * @param {boolean} useSpacing Adds a gap after n - spacingOffset bits
 * @param {number} spacingOffset 
 * @returns {HTMLElement}
 */

function convertBitArrayToSpan(bits, useSpacing = false, spacingOffset = 0) {
    //console.log(spacingOffset);
    var span = document.createElement('span');
    bits.forEach((bit, index) => {
        span.appendChild(bit.HTML);
        if (useSpacing && (index + 1 - spacingOffset) % convolutionOutputLength === 0) {
            span.append(" ");
        }
    });
    return span;
}

/**
 * For usage in Svg
 * @param {Array<Bit>} bits An array of bits
 * @param {boolean} useSpacing This option will add an gap after every n-th bit. Default is false.
 * @param {Number} spacingOffset How many bits is the gap offset usually lower than n.
 * @returns {HTMLElement}
 */

function convertBitArrayToTspan(bits, useSpacing = false, spacingOffset = 0) {
    var tspan = document.createElementNS(svgNS, 'tspan');
    bits.forEach((bit, index) => {
        tspan.appendChild(bit.SVG);
        if (useSpacing && (index + 1 + spacingOffset) % convolutionOutputLength === 0) {
            tspan.append(" ");
        }
    });
    return tspan;
}