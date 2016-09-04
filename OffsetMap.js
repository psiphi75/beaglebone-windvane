/*********************************************************************
 *                                                                   *
 *   Copyright 2016 Simon M. Werner                                  *
 *                                                                   *
 *   Licensed to the Apache Software Foundation (ASF) under one      *
 *   or more contributor license agreements.  See the NOTICE file    *
 *   distributed with this work for additional information           *
 *   regarding copyright ownership.  The ASF licenses this file      *
 *   to you under the Apache License, Version 2.0 (the               *
 *   "License"); you may not use this file except in compliance      *
 *   with the License.  You may obtain a copy of the License at      *
 *                                                                   *
 *      http://www.apache.org/licenses/LICENSE-2.0                   *
 *                                                                   *
 *   Unless required by applicable law or agreed to in writing,      *
 *   software distributed under the License is distributed on an     *
 *   "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY          *
 *   KIND, either express or implied.  See the License for the       *
 *   specific language governing permissions and limitations         *
 *   under the License.                                              *
 *                                                                   *
 *********************************************************************/

'use strict';

module.exports = function findTuneCalibration(val) {

    if (typeof val !== 'number' || isNaN(val)) {
        return 0;
    }

    return findValue(val);
};

function findValue(input) {

    input = wrapDegrees(input);

    var osPair1 = offsetMap[0];
    var in1 = osPair1[1];
    for (var i = 1; i < offsetMap.length; i += 1) {
        var osPair2 = offsetMap[i];
        var in2 = osPair2[1];
        if (in1 <= input && input <= in2) {
            var fraction = (in1 - input) / (in1 - in2);
            var out1 = osPair1[0];
            var out2 = osPair2[0];
            if (out2 < out1) out1 -= 360;
            var portion = (out2 - out1) * fraction;
            var output = osPair1[0] + portion;
            return Math.round(wrapDegrees(output) * 10) / 10;
        }
        osPair1 = osPair2;
        in1 = in2;
    }
    console.log('Did not find the value: ', input);
    return NaN;
}

function wrapDegrees(deg) {
    while (deg > 180) {
        deg -= 360;
    }
    while (deg < -180) {
        deg += 360;
    }
    return deg;
}


/**
 * Finer grain calibration.
 *
 * [output, input]
 */
// var offsetMap = [
//     [-190, -180],
//     [-180, -174],
//     [-157.5, -156],
//     [-135, -138],
//     [-112.5, -111],
//     [-90, -77],
//     [-67.5, -35],
//     [-45, 7],
//     [-22.5, 40],
//     [0, 60],
//     [22.5, 80],
//     [45, 95],
//     [67.5, 112],
//     [90, 127],
//     [112.5, 140],
//     [135, 155],
//     [157.5, 170],
//     [170, 180],
// ];
var offsetMap = [
    [-160, -180],
    [-135, -165],
    [-112.5, -146],
    [-90, -116],
    [-67.5, -81],
    [-45, -36],
    [-22.5, 3],
    [0, 29],
    [22.5, 52],
    [45, 71],
    [67.5, 86],
    [90, 99],
    [112.5, 114],
    [135, 128],
    [157.5, 143],
    [-180, 161],
    [-157.5, 179],
    [-160, 180],
];

// Order matters, we need input in ascending order (-180 to 180)
offsetMap.sort(function(a, b) {
    return a[1] < b[1] ? -1 : 1;
});
