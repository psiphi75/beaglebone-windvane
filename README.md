# BeagleBone WindVane

This project documents how to construct a wind vane using a [BeagleBone Green](http://www.seeed.cc/beaglebone_green/) or [Black](https://beagleboard.org/black), a [3-axis digital compass](http://www.seeedstudio.com/depot/Grove-3Axis-Digital-Compass-p-759.html) and an [anemometer](https://nicegear.co.nz/sensors/anemometer-wind-speed-sensor/).  It's entirely written in JavaScript.

## Installation

```sh
git clone https://github.com/psiphi75/beaglebone-windvane
cd beaglebone-windvane
npm install .
```

## Running the code

```sh
node index.js
```

All the constants are described in index.js.


## Building the device

I use the [HMC5883L compass](http://www.seeedstudio.com/depot/Grove-3Axis-Digital-Compass-p-759.html), as available from SeeedStudio.  It comes with Grove connector, so connects directly with the BeagleBone Green, however, you can also connect this to the BeagleBone Black.

The anemometer has a range from 0.4 (at rest) to 2V (high wind) and presumably it's linear in between.  The maximum the BeagleBone Black/Green can handle for an input voltage is 1.8V.  This means that you will need to create a [voltage divider](https://en.wikipedia.org/wiki/Voltage_divider) to reduce the voltage.  I used two 1 k-Ohm resistors.  Below is a schematic of the connected anemometer.  One issue I found with this anemometer is that it can take a short while (one or two seconds) to register an increase in wind speed, and a very long time (around 7 to 10 seconds) to register a decrease in wind speed.

Connections to BeagleBone:
 - Blue Wire: AIN4 (P9_33)
 - Black Wire: GND_ADC (P9_34)

![schematic](/res/BeagleBone-Anemometer.png?raw=true "Anemometer Schematic")
