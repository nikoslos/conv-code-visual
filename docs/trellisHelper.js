
"use strict";

/**
 * This class contains functions that return SVGElements, that can be used in a svg graphics
 * These are used to actually draw the trellis and update its labels
 */

class TrellisHelper {
    constructor() {
        /**
        * Konstanten des Trellis-Diagramm 
        */

        this.offsetLeft = 40;
        this.offsetRight = 40;
        this.offsetTop = 20;
        this.distanceX = 100;
        this.distanceY = 50;

        // Distance between bottom of the trellis diagramm and the decoded Bit Text
        this.distanceTrellisRecievedText = 70;
        this.distanceRecievedDecodedText = 30;

        this.nodeWidth = 20;
        this.nodeHeight = 25;
    }

    /**
     * The label displayed at the beginning of the trellis is used to display the state label
     * @param {number} stateIndex 
     * @param {string} text 
     */
    stateLabelTextSVG(stateIndex, text) {
        var x = 0;
        var y = stateIndex * this.distanceY + this.offsetTop + this.nodeHeight / 2;

        var textElement = document.createElementNS(svgNS, "text");
        textElement.setAttribute("x", x);
        textElement.setAttribute("y", y);
        textElement.append(text);
        return textElement;
    }

    /**
     * Kreis mit Pfadlänge und der Beschriftung der Übergänge
     * @param {number} stateIndex 
     * @param {number} timeIndex
     * @param {boolean} useLabel should a label be used, is used for the states of the last stateTimeIndex
     * @returns {HTMLElement}
     */
    nodeWithLabel(stateIndex = 0, timeIndex = 0, useLabel = true) {
        var gElement = document.createElementNS(svgNS, "g");
        var rectElement = document.createElementNS(svgNS, "rect");
        var pathMetricElement = document.createElementNS(svgNS, "text");

        var offsetLeft = this.offsetLeft;
        var offsetTop = this.offsetTop;
        var distanceX = this.distanceX;
        var distanceY = this.distanceY;

        var nodeWidth = this.nodeWidth;
        var nodeHeight = this.nodeHeight;


        var x = offsetLeft + timeIndex * distanceX;
        var y = offsetTop + stateIndex * distanceY;


        rectElement.setAttribute("x", x);
        rectElement.setAttribute("y", y);
        rectElement.setAttribute("width", nodeWidth);
        rectElement.setAttribute("height", nodeHeight);
        rectElement.setAttribute("fill-opacity", 0);
        rectElement.setAttribute("stroke", "black")


        var circleElement = document.createElementNS(svgNS, "circle");
        circleElement.setAttribute("cx", x + nodeWidth / 2);
        circleElement.setAttribute("cy", y + nodeHeight / 2);
        circleElement.setAttribute("r", nodeWidth / 2);
        circleElement.setAttribute("fill-opacity", 0);
        circleElement.setAttribute("stroke", "grey");


        pathMetricElement.setAttribute("x", x + nodeWidth / 2);
        pathMetricElement.setAttribute("y", y + nodeHeight / 2);
        pathMetricElement.setAttribute("text-anchor", "middle");
        pathMetricElement.setAttribute("dominant-baseline", "middle");
        pathMetricElement.setAttribute("id", "node_ti" + timeIndex + "si" + stateIndex);
        pathMetricElement.append("");

        gElement.appendChild(circleElement);
        gElement.appendChild(pathMetricElement);


        if (useLabel) {
            var transitionLabel0 = document.createElementNS(svgNS, "text");
            var transitionLabel1 = document.createElementNS(svgNS, "text");
            var transitionOutputLabel0 = document.createElementNS(svgNS, "text");
            var transitionOutputLabel1 = document.createElementNS(svgNS, "text");


            transitionLabel0.setAttribute("x", x + nodeWidth);
            transitionLabel0.setAttribute("y", y + nodeHeight * 0.2);
            transitionLabel0.setAttribute("text-anchor", "left");
            transitionLabel0.setAttribute("dominant-baseline", "middle");
            transitionLabel0.id = "transitionLabel_0_" + stateIndex + "_t_" + timeIndex;
            transitionLabel0.classList.add("transitionLabel");
            transitionLabel0.append("");

            transitionOutputLabel0.setAttribute("x", x + nodeWidth);
            transitionOutputLabel0.setAttribute("y", y + nodeHeight * 0.2);
            transitionOutputLabel0.setAttribute("text-anchor", "left");
            transitionOutputLabel0.setAttribute("dominant-baseline", "middle");
            transitionOutputLabel0.classList.add("transitionOutputLabel");
            transitionOutputLabel0.id = "transitionOutputLabel_0_" + stateIndex + "_t_" + timeIndex;

            transitionLabel1.setAttribute("x", x + nodeWidth);
            transitionLabel1.setAttribute("y", y + nodeHeight * 0.8);
            transitionLabel1.setAttribute("text-anchor", "left");
            transitionLabel1.setAttribute("dominant-baseline", "middle");
            transitionLabel1.id = "transitionLabel_1_" + stateIndex + "_t_" + timeIndex;
            transitionLabel1.classList.add("transitionLabel");
            transitionLabel1.append("");

            transitionOutputLabel1.setAttribute("x", x + nodeWidth);
            transitionOutputLabel1.setAttribute("y", y + nodeHeight * 0.8);
            transitionOutputLabel1.setAttribute("text-anchor", "left");
            transitionOutputLabel1.setAttribute("dominant-baseline", "middle");
            transitionOutputLabel1.classList.add("transitionOutputLabel")
            transitionOutputLabel1.id = "transitionOutputLabel_1_" + stateIndex + "_t_" + timeIndex;



            gElement.appendChild(transitionLabel0);
            gElement.appendChild(transitionLabel1);
            gElement.appendChild(transitionOutputLabel0);
            gElement.appendChild(transitionOutputLabel1);

        }
        return gElement;
    }

    /**
     * 
     * @param {SVGElement} svg 
     * @param {value} inputCharacter 
     * @param {number} stateIndex 
     * @param {number} timeIndex 
     * @param {string} value 
     */
    updateTransitionLabel(svg, inputCharacter, stateIndex, timeIndex, value) {
        var id = "";
        if (inputCharacter === 0) {
            id = "transitionLabel_0_" + stateIndex + "_t_" + timeIndex;
        } else {
            id = "transitionLabel_1_" + stateIndex + "_t_" + timeIndex;
        }

        var transitionLabel = svg.getElementById(id)

        transitionLabel.childNodes.forEach((childNode) => {
            childNode.remove();
        });
        transitionLabel.append(value);
    }

    updateTransitionOutputLabel(svg, inputCharacter, stateIndex, timeIndex, value) {
        var id = "";
        if (inputCharacter === 0) {
            id = "transitionOutputLabel_0_" + stateIndex + "_t_" + timeIndex;
        } else {
            id = "transitionOutputLabel_1_" + stateIndex + "_t_" + timeIndex;
        }
        var transitionOutputLabel = svg.getElementById(id)

        transitionOutputLabel.childNodes.forEach((childNode) => {
            childNode.remove();
        });
        transitionOutputLabel.append(value);
    }

    /**
     * 
     * @param {SVGElement} svg 
     * @param {number} stateIndex 
     * @param {number} timeIndex 
     * @param {string} value new label, is path metric
     */
    updateStateLabel(svg, stateIndex, timeIndex, value) {
        var id = "node_ti" + timeIndex + "si" + stateIndex;
        var nodeLabel = svg.getElementById(id)

        nodeLabel.childNodes.forEach((childNode) => {
            childNode.remove();
        });
        nodeLabel.append(value);

    }

    /**
     * Shows transition labels and hides transition output labels
     * @param {SVGElement} svg 
     */
    showTransitionLabels(svg) {
        var transitionOutputLabels = svg.getElementsByClassName("transitionOutputLabel");
        var transitionLabels = svg.getElementsByClassName("transitionLabel");
        for (var i = 0; i < transitionLabels.length; i++) {
            transitionLabels[i].style.display = "block";
        }

        for (var i = 0; i < transitionOutputLabels.length; i++) {
            transitionOutputLabels[i].style.display = "none";
        }
    }

    /**
     * Hides transition labels and shows transition output labels
     * @param {SVGElement} svg 
     */
    showTransitionOutputLabels(svg) {
        var transitionOutputLabels = svg.getElementsByClassName("transitionOutputLabel");
        var transitionLabels = svg.getElementsByClassName("transitionLabel");
        for (var i = 0; i < transitionLabels.length; i++) {
            transitionLabels[i].style.display = "none";
        }

        for (var i = 0; i < transitionOutputLabels.length; i++) {
            transitionOutputLabels[i].style.display = "block";
        }
    }

    /**
     * 
     * @param {number} currentStateIndex
     * @param {number} nextStateIndex
     * @param {number} inputCharacter 
     * @param {number} timeIndex
     * @returns {HTMLElement}
     */
    transitionLineSVG(currentStateIndex, nextStateIndex, inputCharacter, timeIndex) {
        var offsetLeft = this.offsetLeft;
        var offsetTop = this.offsetTop;
        var distanceX = this.distanceX;
        var distanceY = this.distanceY;

        var width = this.nodeWidth;
        var height = this.nodeHeight;


        var x1 = offsetLeft + timeIndex * distanceX + width;
        var y1 = offsetTop + currentStateIndex * distanceY + height * 0.5;

        var x2 = offsetTop + (timeIndex + 1) * distanceX + width;
        var y2 = offsetTop + nextStateIndex * distanceY + height * 0.5;


        var transitionLine = document.createElementNS(svgNS, "line");

        var id = "transitionLine_cs_" + currentStateIndex + "_ns_" + nextStateIndex + "_ti_" + timeIndex;

        transitionLine.setAttribute("x1", x1);
        transitionLine.setAttribute("y1", y1);
        transitionLine.setAttribute("x2", x2);
        transitionLine.setAttribute("y2", y2);

        // Wenn der Übergang eine Eins beschreibt, soll die Linie gestrichelt dargestellt weren.
        if (inputCharacter === 1) {
            transitionLine.setAttribute("stroke-dasharray", "3");
        }
        transitionLine.setAttribute("stroke", "grey")
        transitionLine.setAttribute("id", id);
        return transitionLine;
    }

    /**
     * 
     * @param {SVGElement} svg
     * @param {number} currentStateIndex 
     * @param {number} nextStateIndex 
     */
    changeClassOfTransitionLine(svg, currentStateIndex, nextStateIndex, timeIndex, className) {
        var id = "transitionLine_cs_" + currentStateIndex + "_ns_" + nextStateIndex + "_ti_" + timeIndex;
        var transitionLine = svg.getElementById(id);
        if (transitionLine === null) {
            console.log(id, transitionLine);
        }
        transitionLine.setAttribute("class", className);

    }

    /**
     * This function generates a svg element with the labels for some elements of the trellis
     * @param {FiniteStateMachine}
     * @returns {SVGElement}
     */
    labelSVG(fsm) {
        var x = 0;
        var y = this.offsetTop + (this.distanceY) * 3;

        var gElement = document.createElementNS(svgNS, "g")

        var tspanKIndex = document.createElementNS(svgNS, "tspan");
        tspanKIndex.setAttribute("font-size", "60%");
        tspanKIndex.setAttribute("dy", "4");
        tspanKIndex.append("k")

        var labelTransmittedBitsElement = document.createElementNS(svgNS, "text");
        labelTransmittedBitsElement.setAttribute('x', x);
        labelTransmittedBitsElement.setAttribute('y', y + this.distanceTrellisRecievedText);
        labelTransmittedBitsElement.setAttribute('height', 30);
        labelTransmittedBitsElement.setAttribute('width', this.distanceX);

        labelTransmittedBitsElement.append("y");
        labelTransmittedBitsElement.appendChild(tspanKIndex);

        tspanKIndex = document.createElementNS(svgNS, "tspan");
        tspanKIndex.setAttribute("font-size", "60%");
        tspanKIndex.setAttribute("dy", "4");
        tspanKIndex.append("k")

        var labelDecodedBitsElement = document.createElementNS(svgNS, "text");
        labelDecodedBitsElement.setAttribute('x', x);
        labelDecodedBitsElement.setAttribute('y', y + this.distanceRecievedDecodedText + this.distanceTrellisRecievedText)
        labelDecodedBitsElement.setAttribute('height', 30);
        labelDecodedBitsElement.setAttribute('width', this.distanceX);

        labelDecodedBitsElement.append("x");
        labelDecodedBitsElement.appendChild(tspanKIndex);

        gElement.appendChild(labelTransmittedBitsElement);
        gElement.appendChild(labelDecodedBitsElement);

        return gElement;
    }

    /**
     * 
     * @param {number} i 
     * @param {Array<Bit>} bits 
     * @returns {HTMLElement}
     */

    transmittedBitTextSVG(i, bits) {
        var x = this.offsetLeft + (this.distanceX) * (i + 0.25);
        var y = this.offsetTop + (this.distanceY) * 3 + this.distanceTrellisRecievedText;

        var id = 'transmittedBitText' + i
        var textElement = document.createElementNS(svgNS, "text");
        textElement.setAttribute('x', x);
        textElement.setAttribute('y', y);
        textElement.setAttribute('height', 30);
        textElement.setAttribute('width', this.distanceX)
        textElement.setAttribute('id', id);

        var bitTextTspan = convertBitArrayToTspan(bits);

        textElement.appendChild(bitTextTspan);

        return textElement;
    }
    /**
     * 
     * @param {SVGElement} svg 
     * @param {number} i 
     * @param {Array<Bit>} bits 
     */
    updateTransmittedBitTextSVG(svg, i, bits) {
        var id = 'transmittedBitText' + i;
        var textElement = svg.getElementById(id);
        textElement.getElementsByTagName('tspan')[0].remove();
        var bitTextTspan = convertBitArrayToTspan(bits);
        textElement.appendChild(bitTextTspan);
    }

    /**
     * 
     * @param {number} i 
     * @param {Bit} bit
     * @returns {HTMLElement}
     */

    decodedBitTextSVG(i, bit) {
        var x = this.offsetLeft + (this.distanceX) * (i + 0.25)
        var y = this.offsetTop + (this.distanceY) * 3 + this.distanceTrellisRecievedText + this.distanceRecievedDecodedText;


        var id = 'decodedBitText' + i
        var textElement = document.createElementNS(svgNS, "text");
        textElement.setAttribute('x', x);
        textElement.setAttribute('y', y);
        textElement.setAttribute('height', 30);
        textElement.setAttribute('width', this.distanceX)
        textElement.setAttribute('id', id);

        textElement.appendChild(bit.SVG);

        return textElement;
    }

    /**
     * 
     * @param {SVGElement} svg 
     * @param {number} timeIndex 
     * @param {Bit} bit 
     */
    updateDecodedBitTextSVG(svg, timeIndex, bit) {
        var id = 'decodedBitText' + timeIndex;
        var textElement = svg.getElementById(id);
        var childNodes = textElement.childNodes;

        for (var i = 0; i < childNodes.length; i++) {
            childNodes[i].remove();
        }
        textElement.appendChild(bit.SVG);
    }
}

