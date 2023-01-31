#!/usr/bin/env node

// importing necessary modules
import minimist from "minimist";
import fetch from "node-fetch";
import moment from "moment-timezone";

const argv = minimist(process.argv.slice(2)); // finding the arguments from command line

if (argv['h'] != null) { // creating the help command
    console.log(`
        Usage: galosh.js [options] -[n|s] LATITUDE -[e|w] LONGITUDE -z TIME_ZONE
            -h            Show this help message and exit.
            -n, -s        Latitude: N positive; S negative.
            -e, -w        Longitude: E positive; W negative.
            -z            Time zone: uses tz.guess() from moment-timezone by default.
            -d 0-6        Day to retrieve weather: 0 is today; defaults to 1.
            -j            Echo pretty JSON from open-meteo API and exit.`
    );
    process.exit(0);
}

let timezone = moment.tz.guess(); // getting the timezone
if (argv['z'] != null) {            // check if timezone is already inputted
    timezone = argv["z"];
}

// Checking that the latitude is input only once
if (argv['n'] != null && argv['s'] != null) {
    console.log(`Latitude can only be input once.`);
    process.exit(0);
}

// Checking that the longitude is input only once
if (argv['e'] != null && argv['w'] != null) {
    console.log(`Longitude can only be input once.`);
    process.exit(0);
}

let latitude, longitude; // Assigning latitude and longitude below

if (argv['n'] != null) { latitude = argv['n']; }

if (argv['s'] != null) { latitude = -argv['s']; }

if (argv['e'] != null) { longitude = argv['e']; }

if (argv['w'] != null) { longitude = -argv['w']; }

if (!(longitude && latitude)) {
    console.log(`Latitude must be in range`)
    process.exit(0);
}

if (Math.abs(latitude) > 90) { // Latitude must be valid
    console.log(`Latitude must be a valid number.`)
    process.exit(0);
}

if (Math.abs(longitude) > 180) { // Longitude must be valid
    console.log(`Longitude must be a valid number.`)
    process.exit(0);
}

let day;
if (argv['d'] != null) {
    day = argv['d'];
} else {
    day = 1;
}

// Getting the url with info
const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=" + latitude + "&longitude=" + longitude + "&daily=precipitation_hours&current_weather=true&timezone=" + timezone);

const data = await response.json();

if(argv['j'] != null) {
    console.log(data);
    process.exit(0);
}

if (day == 0) {
  console.log("It will rain for " + data["daily"]["precipitation_hours"][day] + " hours today.")
} else if (day > 1) {
  console.log("It will rain for " + data["daily"]["precipitation_hours"][day] + " hours in " + day + " days.")
} else {
  console.log("It will rain for " + data["daily"]["precipitation_hours"][day] + " hours tomorrow.")
}