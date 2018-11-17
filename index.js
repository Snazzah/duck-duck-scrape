const sf = require('snekfetch')
const cheerio = require('cheerio')
const qs = require('querystring')
const M = require('mustache')

/**
 * @typedef {integer} safeSearchInt - 1 is safe, -1 is moderate, and -2 is off
 */

/**
 * A result given from searching.
 * @see DDG#search
 * @typedef {Object} SearchResult
 * @property {string} [title] The title of the search result
 * @property {string} [description] The description from the result.
 * The description can be changed by DuckDuckGo depending on your search query.
 * @property {string} [rawDescription] Same as description but includes HTML elements.
 * @property {string} [description] The description from the result.
 * @property {number} [url] The URL of the search result
 */

/**
 * Creates a DuckDuckDo scraper.
 * @class 
 */
module.exports = class DDG {
  constructor() {
    [
      {
        name: 'stocks',
        url: 'stocks/{{{a.0}}}'
        // stock
      },
      {
        name: 'time',
        url: 'time/{{{a.0}}}'
        // query
      },
      {
        name: 'currency',
        url: 'currency/{{{a.2}}}/{{{a.0}}}/{{{a.1}}}',
        // from, to, amount
        defaults: [undefined, undefined, 1]
      },
      {
        name: 'forecast',
        url: 'forecast/{{{a.0}}}/{{{a.1}}}',
        // query, locale
        defaults: [undefined, 'en'],
        jsRegex: '.+ddg_spice_forecast\\(\\n?((?:.|\\n)+)\\n?\\);?'
      },
      {
        name: 'pronunciation',
        url: 'dictionary/pronunciation/{{{a.0}}}'
        // word
      },
      {
        name: 'pronunciation',
        js: 'dictionary_pronunciation',
        url: 'dictionary/pronunciation/{{{a.0}}}'
        // word
      },
      {
        name: 'hyphenation',
        js: 'dictionary_hyphenation',
        url: 'dictionary/hyphenation/{{{a.0}}}'
        // word
      },
      {
        name: 'dictionaryAudio',
        js: 'dictionary_audio',
        url: 'dictionary/audio/{{{a.0}}}'
        // word
      },
      {
        name: 'definition',
        js: 'dictionary_definition',
        url: 'dictionary/definition/{{{a.0}}}'
        // word
      }
    ].map(this._defineSpice.bind(this))
  }

  _defineSpice(spice) {
    Object.defineProperty(this.constructor.prototype, spice.name, {
      enumerable: false,
      writable: true,
      value: async (...args) => {
        let a = []
        if (spice.defaults) Object.assign(a, spice.defaults, args);
        else a = args;
        const response = await sf.get(`https://duckduckgo.com/js/spice/${M.render(spice.url, {
          a, euc: () => (t, r) => encodeURIComponent(r(t))
        })}`)
        return JSON.parse(response.text.replace(spice.jsRegex ? new RegExp(spice.jsRegex) : this._jsRegex('ddg_spice_' + (spice.js || spice.name)), "$1"))
      }
    })
  }

  _format(s) {
    return encodeURIComponent(s).replace(/\+/g, '%2B').replace(/%20/g, '+')
  }

  _jsRegex(name) {
    return new RegExp(`^${name}\\(\\n?((?:.|\\n)+)\\n?\\);?`)
  }

  _cleanUp(s) {
    return s.replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&apos;/g, "'").replace(/&quot;/g, '"')
  }

  /**
   * 
   * @function search
   * @async
   * @param {string} query - The query string 
   * @param {safeSearchInt} safeSearch - Level of SafeSearch.
   * @param {string} locale - The locale to search in
   * @returns {Promise<Array<SearchResult>>} - The results of your query
   */
  async search(query, safeSearch = -2, locale = 'us-en') {
    const response = await sf.get(`https://duckduckgo.com/html/?q=${this._format(query)}&kr=${locale}&kp=${safeSearch}`)
    const $ = cheerio.load(response.text)
    let results = Array.from($('.results_links_deep:not(.result--ad) .result__body')).map(result => ({
      title: $('.result__a', result).text(),
      description: $('.result__snippet', result).text(),
      rawDescription: this._cleanUp($('.result__snippet', result).html()),
      url: qs.parse($('.result__a', result).attr('href').slice(3)).uddg,
      icon: `https://icons.duckduckgo.com/ip3/${qs.parse($('.result__a', result).attr('href').slice(3)).uddg.split('/')[2]}.ico`
    }))
    if ($('.no-results')[0]) return null
    return results
  }

  /**
   * Autocompletes a string
   * @function autocomplete
   * @param {string} query - The query to search with
   * @async
   * @returns {Promise<Array<Object>>} - The results that autocomplete your query
   */
  async autocomplete(query) {
    const response = await sf.get(`https://duckduckgo.com/ac/?callback=&q=${this._format(query)}`)
    return JSON.parse(response.text)
  }

  /**
   * Searches for an image
   * @function image
   * @param {string} query - The query to search with
   * @param {boolean} safe - Whether Safe Search is on or not
   * @param {string} locale - The locale you want to search in
   * @async
   * @returns {Promise<Array<Object>>} - Image results
   */
  async image(query, safe = false, locale = 'us-en') {
    const safeSearch = safe ? 1 : -1
    const response = await sf.get(`https://duckduckgo.com/i.js?l=${locale}&o=json&q=${query.replace(/\+/g, '%2B')}&f=,,,&p=${safeSearch}`)
    return JSON.parse(response.body).results
  }

  /**
   * Searches for a video
   * @function video
   * @param {string} query - The query to search with
   * @param {boolean} safe - Whether Safe Search is on or not
   * @param {string} locale - The locale you want to search in
   * @async
   * @returns {Promise<Array<Object>>} - Video results
   */
  async video(query, safe = false, locale = 'us-en') {
    const safeSearch = safe ? 1 : -1
    const response = await sf.get(`https://duckduckgo.com/v.js?l=${locale}&o=json&strict=1&q=${query.replace(/\+/g, '%2B')}&f=,,,&p=${safeSearch}`)
    return JSON.parse(response.body).results
  }

  /**
   * Searches Amazon.
   * @function amazon
   * @param {string} query - The query to search with
   * @param {boolean} safe - Whether Safe Search is on or not
   * @async
   * @returns {Promise<Array<Object>>} - Product results
   */
  async amazon(query, safe = false) {
    const safeSearch = safe ? 1 : -1
    const response = await sf.get(`https://duckduckgo.com/m.js?q=${this._format(query)}&t=D&l=wt-wt&cb=ddg_spice_amazon&k=${this._format(query)}&p=${safeSearch}`)
    return JSON.parse(response.text.replace(this._jsRegex('ddg_spice_amazon'), "$1"))
  }

  /**
   * Gets someone's latest Twitter information
   * @function twitter
   * @param {string} handle - The Twitter handle to search for
   * @async
   * @returns {Promise<Object>} - The result from the twitter account
   */
  async twitter(handle) {
    const response = await sf.get(`https://duckduckgo.com/tw.js?callback=ddg_spice_twitter&current=1&user=${handle}`)
    return JSON.parse(response.text.replace(this._jsRegex('ddg_spice_twitter'), "$1"))
  }
}
