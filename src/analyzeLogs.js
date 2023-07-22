"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
///Import necessary libraries
var fs = require("fs");
// Function to read and parse the API prod logs from .log file
var readAndParseLogs = function (filePath) {
    var rawData = fs.readFileSync(filePath, 'utf8');
    var logs = rawData.split('\n').map(function (logEntry) {
        var timestampMatch = logEntry.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2} \+\d{2}:\d{2}/);
        var statusCodeMatch = logEntry.match(/HTTP\/1\.1" (\d{3})/);
        var endpointMatch = logEntry.match(/ ([^ ]+) HTTP\/1\.1"/);
        //const endpointMatch = logEntry.match(/ ([^ ?]+) HTTP\/1\.1"/)
        ;
        var timestamp = timestampMatch ? timestampMatch[0] : '';
        var statusCode = statusCodeMatch ? parseInt(statusCodeMatch[1], 10) : 0;
        var endpoint = endpointMatch ? endpointMatch[1] : '';
        return { timestamp: timestamp, statusCode: statusCode, endpoint: endpoint };
    });
    return logs;
};
// Function to count endpoint calls
var countEndpointCalls = function (logs) {
    var endpointCounts = {};
    for (var _i = 0, logs_1 = logs; _i < logs_1.length; _i++) {
        var log = logs_1[_i];
        var endpoint = log.endpoint;
        endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
    }
    return endpointCounts;
};
// Function to count API calls per minute
var countAPICallsPerMinute = function (logs) {
    var apiCallsPerMinute = {};
    for (var _i = 0, logs_2 = logs; _i < logs_2.length; _i++) {
        var log = logs_2[_i];
        var timestamp = new Date(log.timestamp);
        var minuteKey = "".concat(timestamp.getHours(), ":").concat(timestamp.getMinutes());
        apiCallsPerMinute[minuteKey] = (apiCallsPerMinute[minuteKey] || 0) + 1;
    }
    return apiCallsPerMinute;
};
// Function to count API calls per status code
var countAPICallsPerStatus = function (logs) {
    var apiCallsPerStatus = {};
    for (var _i = 0, logs_3 = logs; _i < logs_3.length; _i++) {
        var log = logs_3[_i];
        var statusCode = log.statusCode;
        var statusText = statusCode === 200 ? 'OK' : statusCode === 404 ? 'Not found' : statusCode === 304 ? 'Not changed' : 'Server Error';
        apiCallsPerStatus[statusText] = (apiCallsPerStatus[statusText] || 0) + 1;
    }
    return apiCallsPerStatus;
};
// Main function to execute and display the results in a formatted table
var main = function () {
    var logFilePath = 'prod-api-prod-out.log'; // Logs data
    var logs = readAndParseLogs(logFilePath);
    var endpointCounts = countEndpointCalls(logs);
    var apiCallsPerMinute = countAPICallsPerMinute(logs);
    var apiCallsPerStatus = countAPICallsPerStatus(logs);
    // Display endpoint counts
    console.log('Endpoint Call Counts:');
    console.table(endpointCounts);
    // Display API calls per minute
    console.log('\nAPI Calls Per Minute:');
    console.table(apiCallsPerMinute);
    // Display API calls per status code
    console.log('\nAPI Calls Per Status Code:');
    //Count the no of count against each status code
    function Result(statusCode, count) {
        this.statusCode = statusCode;
        this.count = count;
    }
    var result = {};
    result["Server Error"] = new Result(500, apiCallsPerStatus["Server Error"]);
    result["Not found"] = new Result(404, apiCallsPerStatus["Not found"]);
    result["OK"] = new Result(200, apiCallsPerStatus["OK"]);
    result["Not changed"] = new Result(304, apiCallsPerStatus["Not changed"]);
    console.table(result);
};
main();
