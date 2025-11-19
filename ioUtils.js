const dotenv = require('dotenv');
const utils = require('common-node/gUtils');

//[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
function initVariables(runInfo)
{
	utils.debug("ioUtils.js initVariables");

    // Setup our process.run variable to store app state vars and set default values
    runInfo.pingCycle = 5000;
    runInfo.runStatus = 1;
    runInfo.logLevel = 2;
    runInfo.compItHour = 0;
    runInfo.compItMinute = 0;
    runInfo.weHaveCompedIt = false;
    runInfo.currentProcessTime = new Date();
    runInfo.prevHour = runInfo.currentProcessTime.getHours();
    runInfo.prevMinute = runInfo.currentProcessTime.getMinutes();
    
    // Load our .env file into process.env to access the Source and Target Account(s) meta data
    dotenv.config({ path: './.env', quiet: true });
    utils.setDebugMode(process.env.DEBUG_MODE === "true");
}
exports.initVariables = initVariables;

//[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
function initRunVariables(runInfo)
{
	// Read in our run.env file to pull values and project run status.  Do it 
	// every cycle to allow the ability to change the runStatus in realtime and exit gracefully, etc...
    dotenv.config({ path: './run.env', override: true, quiet: true });
    
    // Ping cycle in milliseconds
    const parsedPingCycle = parseInt(process.env.PING_CYCLE);
    runInfo.pingCycle = Number.isInteger(parsedPingCycle) ? parsedPingCycle : 5000;
    
    // Run status: 0 = Exit, 1 = Run
    const parsedRunStatus = parseInt(process.env.RUN_STATUS);
    runInfo.runStatus = Number.isInteger(parsedRunStatus) ? parsedRunStatus : 1;

    // Log level: 0 = None, 1 = Status only, 2 = Verbose
    const parsedLogLevel = parseInt(process.env.LOG_LEVEL);
    runInfo.logLevel = Number.isInteger(parsedLogLevel) ? parsedLogLevel : 2;

    // CompIt Hour and Minute
    const parsedCompItHour = parseInt(process.env.COMPIT_HOUR);
    runInfo.compItHour = Number.isInteger(parsedCompItHour) ? parsedCompItHour : 0;
    const parsedCompItMinute = parseInt(process.env.COMPIT_MINUTE);
    runInfo.compItMinute = Number.isInteger(parsedCompItMinute) ? parsedCompItMinute : 0;
}
exports.initRunVariables = initRunVariables;
