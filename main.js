const utils = require("common-node/gUtils");
const ioUtils = require('./ioUtils');
const {BUILD_VERSION} = require('./constants'); 
const {
    AccountId,
    PrivateKey,
    Client,
    TransferTransaction,
    Hbar
} = require("@hashgraph/sdk"); // v2.64.5

const runInfo = {};
let m_spinner_ctr = 0;

//[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
function main(){
	// Initialize global variables from ini file and kick this puppy off
	initVariables();
	checkIfTimeToCompIt();
    processSpinner();
}
exports.main = main;

//[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
function initVariables(){
	ioUtils.initVariables(runInfo);

	// To be done after we set the ioUtils.initVariables DEBUG flag above from our .env (otherwise, you know... it won't get logged)
	utils.debug("main.js initGlobalVariables");

	utils.log("Begin CompIt! Build: " + BUILD_VERSION);
}

//[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
function checkIfTimeToCompIt(){
    utils.debug("main.js checkIfTimeToCompIt --------------------------------");

    // Set our timestamp for this cycle -- do it first thing to maximize cycle-time accuracy
	runInfo.currentProcessTime = new Date();

	// Read in our run config file to pull api values and project run status in real-time
	ioUtils.initRunVariables(runInfo);

	// All the promises have resolved
	try {
		// Check for to see if now is the time to trigger our rewards
        if (ifNowIsTheTime())
            compIt();

		// Call checkIfTimeToCompIt again.  When it's time...
		callCheckIfTimeToCompItAgain();
	} catch(error) {
		utils.debug("main.js checkIfTimeToCompIt: Promise.all.catch");
		utils.error(error.message);

		// Call checkIfTimeToCompIt again.  When it's time...
		callCheckIfTimeToCompItAgain();
	}
}

//[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
function callCheckIfTimeToCompItAgain(){
	utils.debug("main.js callCheckIfTimeToCompItAgain");

	// If we're still in run mode (runStatus = 1) then let's do another pass on the next pingCycle...
	if (runInfo.runStatus > 0) {
        // Calls the method checkIfTimeToCompIt again after the specified pingCycle time 
        setTimeout(checkIfTimeToCompIt, runInfo.pingCycle);
    } else {
        utils.log("End CompIt. Build: " + BUILD_VERSION);
        process.exit();
    }
}

//[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
function ifNowIsTheTime() {
    utils.debug("main.js ifNowIsTheTime");

    const currentTime = new Date();
    let itsGoTime = currentTime.getHours() === runInfo.compItHour && currentTime.getMinutes() === runInfo.compItMinute;

    // If we've passed out hour/minute "go time" values then reset our processed flag for the next round
    if (!itsGoTime)
        runInfo.weHaveCompedIt = false;
    else if (!runInfo.weHaveCompedIt)
        return true;
    
    return false;
}

//[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
async function compIt(){
	utils.debug("main.js compIt");

    runInfo.weHaveCompedIt = true;

    let client;
    try {
        // Set client environment (Mainnet)
        client = Client.forMainnet();

        // Get a handle to our Hedera source Account
        let sourceAccount = null;
        try {
            sourceAccount = AccountId.fromString(process.env.SOURCE_ACCOUNT);
        } catch (error) {
            utils.error("Invalid Source Account ID. Make sure the SOURCE_ACCOUNT value within your .env file is a valid Hedera Account ID. See README.md for more info.");
            runInfo.runStatus = 0; // Gracefully exit CompIt
            return;
        }

        // Now load up the PK so we can sign a send transaction
        let sourcePK;
        try {
            sourcePK = PrivateKey.fromStringED25519(process.env.SOURCE_PK);
        } catch (error) {
            sourcePK = null;
        }

        // If the ED25519 format failed to parse the PK, try the ECDSA format
        if (sourcePK == null) {
            try {
                sourcePK = PrivateKey.fromStringECDSA(process.env.SOURCE_PK);
            } catch (error) {
                sourcePK = null;
            }
        }
        
        // If sourcePK is still null then both formats failed to parse the PK. Abandon ship! 
        if (sourcePK == null) {
            utils.error("Invalid Source Private Key (PK). Make sure the SOURCE_PK value within your .env file is a valid PK format. See README.md for more info.");
            runInfo.runStatus = 0; // Gracefully exit CompIt
            return;
        }

        // Set the operator with the account ID and private key
        client.setOperator(sourceAccount, sourcePK);

        // Create a transaction to move funds from source into each target account
        const txTransfer= new TransferTransaction();

        // Loop through all of our target accounts and send 'em a teeny, tiny hbar to trigger the staking reward
        let numAccounts = 0;
        const oneTinybar = Hbar.fromTinybars(1);
        const accounts = process.env.TARGET_ACCOUNTS.split(",");
        for (const account of accounts) {
            const scrubbedAccount = account.trim() !== "" ? account.trim() : null;
            if (scrubbedAccount == null) continue;
            numAccounts++;
            txTransfer.addHbarTransfer(account.trim(), oneTinybar);
        }

        // Load our recieving account IDs 
        const totalWithdrawlTinybar = Hbar.fromTinybars(numAccounts).negated();

        // Create a transaction to move funds from source into each target account
        txTransfer.addHbarTransfer(sourceAccount, totalWithdrawlTinybar);

        // Submit the transaction to a Hedera network
        const txTransferResponse = await txTransfer.execute(client);

        // Request the receipt of the transaction
        const receiptTransferTx = await txTransferResponse.getReceipt(client);

        // Get the transaction consensus status
        const statusTransferTx= receiptTransferTx.status;

        // Get the Transaction ID
        const txIdTransfer = txTransferResponse.transactionId.toString();

        // Output the results
        utils.log("-------------------------------- Transfer HBAR ------------------------------ ");
        utils.log(`Receipt status   : ${statusTransferTx.toString()}`);
        utils.log(`Transaction ID   : ${txIdTransfer}`);
        utils.log(`Hashscan URL     : https://hashscan.io/mainnet/transaction/${txIdTransfer}`);
    } catch (error) {
        utils.error(error.message);
    } finally {
        if (client) client.close();
    }
}

//[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
function processSpinner() {
    const spinner = ['|', '/', '-', '\\'];
    const index = m_spinner_ctr % spinner.length;
    m_spinner_ctr++;
    process.stdout.write(`\r   - -- --- -~~-<==>~-~==>>O] ${spinner[index]} `);
    setTimeout(processSpinner, 500);
}

