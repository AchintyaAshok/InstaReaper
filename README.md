# InstaReaper
Your one-stop shop for getting near instantaneous notifications when your Instacart Market has delivery options available.

1. install nide from https://nodejs.org/en/

2. Get a Git account

3. Clone the Git for the source code


## Setup
Setup your Node environment & run while in this project:
```bash
npm install
```

## Reap Instacart
You will have to do a little investigation to get started.

### Find Your Market
First, go to Instacart & inspect the URL. Ex. https://www.instacart.com/store/fairway-market/storefront

The portion between /store/ & /storefront (or whatever the suffix of the URL may be) is your chosen "market". In the case of this URL, the market is "fairway-market".

Note down his value.

### Find Your Cookies
Second, open up your browser inspector and refresh the page. Inspect any of the XHR requests made to the instagram api & note down the cookies sent in the request. Copy the entire string of cookies (there will be multiple cookies ';' delimited) & paste it in src/cookies.js as a single line. 

Save the file.

### Run The Reaper
Follow the instructions that the script posts.
```bash
node src/reap.js
```

