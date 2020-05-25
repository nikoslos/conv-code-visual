/**
 * SVG Namespace variable 
 * 
 * http://www.w3.org/2000/svg
 */
var svgNS = "http://www.w3.org/2000/svg";

/**
 * 
 * @param {String} binary_string wie "101010011"
 * @returns {number}
 */
function binary_string_to_number(binary_string) {
    return parseInt(binary_string.split('').reverse().join(''), 2);
}


/**
 * Converts number to binary and returns string with binary number, for example 5 as input returns "101"
 * @param {number} number This decimal number will be turned to binary
 * @param {number} fixedLength Adds extra zeros at the end of the array, so that the returning array has fixedLength elements, will cause error if fixedLength is too small
 */

function number_to_binary_string(number, fixedLength = 0) {
    // Convert number to binary
    var base2 = (number).toString(2);

    if (fixedLength < base2.length) {
        console.warn("Waring occurred in number_to_binary_string for number", number, ". fixedLength is smaller than base2 of the number. (", fixedLength, "<", base2.length, "). fixedLength will be set to", base2.length);
        fixedLength = base2.length
    }

    // Make all strings the same length
    base2 = '0'.repeat(fixedLength - base2.length) + base2;

    // Reverse the order and return
    return base2.split("").reverse().join("");
}

/**
 * Converts a string with numbers into an number array like, for example "001" returns [0,0,1]
 * @param {string} number_string String that only contains numbers
 */
function number_string_to_number_array(number_string) {
    return number_string.split("").map(function (num) {
        return parseInt(num, 10);
    });
}

/**
 * Converts number to binary and returns array with each binary number, for example 5 turns to [1,0,1]
 * @param {number} number This decimal number will be turned to binary
 * @param {number} fixedLength Adds extra zeros at the end of the array, so that the returning array has fixedLength elements, will cause error if fixedLength is too small
 */

function number_to_binary_number_array(number, fixedLength) {
    var binary_string = number_to_binary_string(number, fixedLength);
    return number_string_to_number_array(binary_string)
}

// Compare Arrays from 
// https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript

// Warn if overriding existing method
if (Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l = this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        } else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {
    enumerable: false
});