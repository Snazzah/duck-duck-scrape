# duck-duck-scrape
A DuckDuckGo scraper NPM module
Note: This isn't endorsed by DuckDuckGo in any way.

# Installation
`npm install --save duck-duck-scrape`

# Setup
```javascript
const DuckDuckScrape = require("duck-duck-scrape");
const ddg = new DuckDuckScrape();
```
# Safe Search
```
 1 = Safe
-1 = Moderate
-2 = Off

For non-search functions safe search is a boolean
```
# Functions

```javascript
  //Search 
  ddg.search(query<String>, safe<Integer>, locale<locale string>) // returns a Promise
  
  //Autocomplete
  ddg.query(query<String>) // returns a Promise
  
  //Image Search (unstable, not sure why)
  ddg.image(query<String>, safe<Boolean>, locale<locale string>) //Returns a Promise
  
  //Video Search
  ddg.video(query<String>, safe<Boolean>, locale<locale string>) //Returns a Promise
```
