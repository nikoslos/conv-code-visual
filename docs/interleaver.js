"use strict";

// Reference 
// Convolutional interleaver
class ConvolutionalInterleaver extends BitRegister {
    constructor(rowsLength = 10, stepLength = 1) {
        super("", false);

        this.rowsLength = rowsLength;
        this.rows = new Array(rowsLength);

        this.currentRowNumber = 0;

        /**
         * generate the shift register structure of the interleaver
         */
        for (var i = 0; i < rowsLength; i++) {
            this.rows[i] = convertBitStringToBitArray('0'.repeat(i * stepLength), false);
        }
    }

    /**
     * Schiebe ein Bit in den aktuell ausgewählten Schieberegister und schiebe das letzte wieder raus
     * 
     */
    onShiftBitIn() {
        var currentRow = this.rows[this.currentRowNumber];
        currentRow.unshift(this.inputBuffer.pop());
        this.outputBuffer.unshift(currentRow.pop());

        this.currentRowNumber++;
        if (this.currentRowNumber >= this.rowsLength) {
            this.currentRowNumber = 0;
        }
    }

    toHTML(elementID) {
        var div = document.getElementById(elementID);
        div.innerHTML = "";
        this.rows.forEach((row) => {
            var rowDiv = document.createElement("div");
            var rowSpan = convertBitArrayToSpan(row, false);
            rowDiv.appendChild(rowSpan);
            div.appendChild(rowDiv);
        });
    }
}

class ConvolutionalDeinterleaver extends ConvolutionalInterleaver {
    constructor(rowCount = 10, delay = 1) {
        super(rowCount, delay)
        this.rows.reverse();
    }
}