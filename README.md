# duck-duck-scrape
A DuckDuckGo scraper NPM module

**Note: This isn't endorsed by DuckDuckGo in any way.**

[![NPM](https://nodei.co/npm/duck-duck-scrape.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/duck-duck-scrape/)

# Installation
`npm install --save duck-duck-scrape`

# Quickstart
```javascript
const DuckDuckScrape = require("duck-duck-scrape");
const ddg = new DuckDuckScrape();
let search = ddg.search("test", 1, "en-us");

search.then((data) => {
  console.log(data)
});
```


# Attribution

Original code and v2 Rewrite by Snazzah
Packaged by suushii
