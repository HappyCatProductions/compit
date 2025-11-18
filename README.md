![Happy Cat Productions](./HCP_logo_banner.png)

```
  ____                     ___ _   _ 
 / ___|___  _ __ ___  _ __|_ _| |_| |
| |   / _ \| '_ ` _ \| '_ \| || __| |
| |__| (_) | | | | | | |_) | || |_|_|
 \____\___/|_| |_| |_| .__/___|\__(_)
                     |_|             
                     
by Happy Cat Productions
```             
Compit: Invoke your Hedera Staking Rewards daily for Compound Interest! 

This is a node/js CLI tool that will allow you to collect daily staking rewards, for one or more Hedera Accounts, based upon an Hour and Minute of your choosing.

## Features

- Use one Source Account to trigger one or more Target Accounts.
- Choose which Hour and Mintue of the day you wish to trigger your Staking Rewards (default is Midnight).
- Outputs each transaction Status, Transaction ID and an https://hashscan.io URL of the transaction.
- Each transaction sends the minimal amount possible: 1 tinybar (1 HBAR = 100,000,000 tinybars). This means that if you are staking your Source Account then those rewards will keep this service running indefinitely (even if the reward percentage is extrmemly low).  
- Graceful exists (if you're OCD like me).

## Installation

Clone the repository:

```bash
git clone https://github.com/HappyCatProductions/compit.git
```

Change your directory to the project root:

```bash
cd <your>/<path>/<to>/compit
```

Install CompIt:

```bash
npm install
```

## Running CompIt

Note: First configure your `.env` file with your own values (see below) before running.

```bash
node index.js
```

## Configuration

MANDATORY: You need to create a new `.env` file in the project root then update its values.

First, copy the `.env.template` file to `.env`:

```bash
cp .env.template .env
```

This will create a new, local `.env` file that should now look like this:

```.env
# Source and target accounts
SOURCE_ACCOUNT=0.0.123456
SOURCE_PK=<Your Source Account Private Key>
TARGET_ACCOUNTS=0.1.234567,8.9.101112
```

Replace SOURCE_ACOUNT value with your own Source Account ID using the above format.

Replace SOURCE_PK with your private key for the Source Account. This is the random looking list of characters and *not* your seed phrase (although I'm sure you can generate your PK from your seed phrase; search online if you need to do this).

Replace TARGET_ACCOUNTS with a comma separated list of Hedera Account IDs that you wish to trigger your rewards for. If you have one Target Account then simply remove the second entry and any trailing commas.

---

OPTIONAL: Replace the values within the `run.env` file in the project root if you wish to customize the hour and minute to trigger your rewards:

```run.env
# RUN STATUS
# 1 = Run
# 0 = Shut down / Exit
RUN_STATUS=1

# CompIt Timings
COMPIT_HOUR=0
COMPIT_MINUTE=0

# How often to query the exchange in milliseconds 
PING_CYCLE=5000
```

The file run.env is *not* secret and is meant for you to freely change during runtime.

Change ```RUN_STATUS=1``` to ```RUN_STATUS=0``` to gracefully exit out of the program.

Change ```COMPIT_HOUR``` and ```COMPIT_MINUTE``` to the hour and minute you would like to trigger your rewards. Examples: 1:08am local time would be ```COMPIT_HOUR=1``` and ```COMPIT_MINUTE=8```.  4:23pm would be ```COMPIT_HOUR=16``` and ```COMPIT_MINUTE=23```. Default is midnight local time. 

Change ```PING_CYCLE``` to the frequency you would like to check for rewards trigger in milliseconds. Don't set to over 1 minute otherwise risk not triggering your rewards. This also determines how long before any changes to ```run.env``` take effect. Default is every 5 seconds.

## Directory Structure

```text
compit/
├─ .env                     // Your secret file containing Source Account, Source PK and Target Account(s)        
├─ constants.js         
├─ HCP_logo_banner.png   
├─ index.js                 // Program entry point
├─ ioUtils.js               // *.env read utilities
├─ LICENSE
├─ main.js                  // Main program logic
├─ package.json
├─ README.md                // This file
└─ run.env                  // Variables to change runtime behavior (optional)
```

## Contributing

This project is open source for transparency and reuse. At this time, I am not actively maintaining the codebase or reviewing pull requests.

If you would like to modify or enhance the project, feel free to fork it and maintain your own version.

## License

This project is licensed under the MIT License — see the **LICENSE** file for details.

## Support

At this time, I am not providing any support.
