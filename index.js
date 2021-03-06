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

/*******************************************************************************
 *                                                                             *
 *          Configuration settings - need to be customised to requirements     *
 *                                                                             *
 *******************************************************************************/

// How often we check the sensor samples (milliseconds)
var SENSOR_SAMPLE_RATE = 860;

var WINDVANE_AIN = 'P9_33';

// This number was determined by running the BeagleBone for a while and measuring
// the WINVANE_AIN voltage.  The average value was taken over time.  Then scaled
// by V_ave / 0.4,  where 0.4 is the windvane voltage at rest.
var WINDVANE_SCALER = 3.6653243848;

// Required for the compass to determine true north (from the magnetic
// declination).  The latitude / longitude values can be approximate.
var DEFAULT_LATITUDE = -8.84;   // FIXME: Lat long are around the wrong way
var DEFAULT_LONGITUDE = 41.68;

/*
 * Output config settings - we will pick these up later.
 */
var logger = require('./logger');
var os = require('os');
var header = {
    timestamp: new Date().getTime(),
    timesinceBoot: os.uptime(),
    fields: ['time', 'trueNorth', 'windspeed']
};

logger.info('\nStarting BeagleBone-Windvane:');
logger.info('--- CONFIG START ---');
logger.info('HEADER:' + JSON.stringify(header));
logger.info('--- CONFIG END ---');

/*******************************************************************************
 *                                                                             *
 *                           Load necessary libraries                          *
 *                                                                             *
 *******************************************************************************/

/* Set this for octalbonescript such that it does load capes automatically */
process.env.AUTO_LOAD_CAPE = 0;
var obs = require('octalbonescript');
obs.loadCape('cape-universaln');
obs.loadCape('BB-ADC');

var i2c = require('i2c-bus');
var async = require('async');

// geomagnetism - for lat-long values.
var geomagnetism = require('geomagnetism');
var geo = geomagnetism.model().point([DEFAULT_LONGITUDE, DEFAULT_LATITUDE]);
var declination = geo.decl;

// i2c-1 needs to be enabled at boot time.
var Compass = require('compass-hmc5883l');
var compass = new Compass(2, {
    i2c: i2c,
    sampleRate: '30',
    scale: '0.88',
    declination: declination,
    calibration: {
offset: { x: 34.31, y: -48.90999999999997, z: -59.495000000000005 },
  scale:
   { x: 1.4515060240963853,
     y: 1.4620752427184467,
     z: 1.5946393117140967 }
    }
});

var Anemometer = require('./Anemometer');
var anemometer = new Anemometer(obs, WINDVANE_AIN, WINDVANE_SCALER, 10, 10);

var headingFineTuner = require('./OffsetMap');

/*******************************************************************************
 *                                                                             *
 *                           Sensor collection code                            *
 *                                                                             *
 *******************************************************************************/

/**
 * This will asyncronously retreive the sensor data (gyro, accel and compass).
 * GPS data is not included since it is retreived only every second.
 */
function collectData() {

    async.parallel({
        heading: function (callback) {
            compass.getHeadingDegrees('x', 'z', callback);
        },
        speed: anemometer.getWindSpeed.bind(anemometer)
    }, function asyncResult(err, values) {

        if (err) {
            logger.error('asyncResult():', err);
        } else {
            values.timestamp = new Date().getTime();
            var tunedHeading = headingFineTuner(wrapDegrees(values.heading + 180));
            logger.debug(values.heading.toFixed(2) + '-->' + tunedHeading.toFixed(2));
            values.heading = tunedHeading;
            logger.info('STATUS:' + JSON.stringify(values));
            comms.status(values);
        }

        setTimeout(collectData, SENSOR_SAMPLE_RATE);

    });
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

/*******************************************************************************
 *                                                                             *
 *                           Sensor collection code                            *
 *                                                                             *
 *******************************************************************************/

var Communication = require('./Communication');
var comms = new Communication(collectData, logger);
