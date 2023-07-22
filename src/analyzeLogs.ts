///Import necessary libraries
import * as fs from 'fs';


interface LogEntry {
    timestamp: string;
    endpoint: string;
    statusCode: number;
  }
  
  // Function to read and parse the API prod logs from .log file
  const readAndParseLogs = (filePath: string): LogEntry[] => {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const logs: LogEntry[] = rawData.split('\n').map((logEntry) => {
      const timestampMatch = logEntry.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2} \+\d{2}:\d{2}/);
      const statusCodeMatch = logEntry.match(/HTTP\/1\.1" (\d{3})/);
      const endpointMatch = logEntry.match(/ ([^ ]+) HTTP\/1\.1"/);
      //const endpointMatch = logEntry.match(/ ([^ ?]+) HTTP\/1\.1"/)
      ;

  
      const timestamp = timestampMatch ? timestampMatch[0] : '';
      const statusCode = statusCodeMatch ? parseInt(statusCodeMatch[1], 10) : 0;
      const endpoint = endpointMatch ? endpointMatch[1] : '';
  
      return { timestamp, statusCode, endpoint };
    });
  
    return logs;
  };

// Function to count endpoint calls
const countEndpointCalls = (logs: LogEntry[]) => {
  const endpointCounts: { [endpoint: string]: number } = {};
  for (const log of logs) {
    const { endpoint } = log;
    endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
  }
  return endpointCounts;
};

// Function to count API calls per minute
const countAPICallsPerMinute = (logs: LogEntry[]) => {
  const apiCallsPerMinute: { [minute: string]: number } = {};
  for (const log of logs) {
    const timestamp = new Date(log.timestamp);
    const minuteKey = `${timestamp.getHours()}:${timestamp.getMinutes()}`;
    apiCallsPerMinute[minuteKey] = (apiCallsPerMinute[minuteKey] || 0) + 1;
  }
  return apiCallsPerMinute;
};

// Function to count API calls per status code
const countAPICallsPerStatus = (logs: LogEntry[]) => {
  const apiCallsPerStatus: { [status: string]: number } = {};
  for (const log of logs) {
    const { statusCode } = log;
    const statusText = statusCode === 200 ? 'OK' : statusCode === 404 ? 'Not found' : statusCode === 304 ? 'Not changed' : 'Server Error';
    apiCallsPerStatus[statusText] = (apiCallsPerStatus[statusText] || 0) + 1;
  }
  return apiCallsPerStatus;
};

// Main function to execute and display the results in a formatted table
const main = () => {
  const logFilePath = 'prod-api-prod-out.log';  // Logs data
  const logs = readAndParseLogs(logFilePath);

  const endpointCounts = countEndpointCalls(logs);
  const apiCallsPerMinute = countAPICallsPerMinute(logs);
  const apiCallsPerStatus = countAPICallsPerStatus(logs);

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
    const result = {};

    result["Server Error"] = new Result(500, apiCallsPerStatus["Server Error"]);
    result["Not found"] = new Result(404, apiCallsPerStatus["Not found"]);
    result["OK"] = new Result(200, apiCallsPerStatus["OK"]);
    result["Not changed"] = new Result(304, apiCallsPerStatus["Not changed"]);
    console.table(result);
};

main();
