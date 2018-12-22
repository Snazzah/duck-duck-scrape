# This project is abandoned. If anyone wants to take over, please file an issue.

# duck-duck-scrape
A DuckDuckGo scraper NPM module

**Note: This isn't endorsed by DuckDuckGo in any way.**

[![NPM](https://nodei.co/npm/duck-duck-scrape.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/duck-duck-scrape/)

# Installation
`npm install --save duck-duck-scrape`

# Setup
```javascript
const DuckDuckScrape = require("duck-duck-scrape");
const ddg = new DuckDuckScrape();
```

# Quickstart
```javascript 
const DuckDuckScrape = require("duck-duck-scrape");
const ddg = new DuckDuckScrape();
let search = ddg.search("test", 1, "en-us"); 

search.then((data) => {
  console.log(data)
});
```
# Documentation
https://suushii.github.io/duck-duck-scrape/index.html


# Attribution

Original code by Snazzah

Packaged by suushii
