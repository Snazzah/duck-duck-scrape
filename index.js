const sf = require('snekfetch')
const cheerio = require('cheerio')
const qs = require('querystring')
const M = require('mustache')
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 OPR/51.0.2830.34'

module.exports = class DDGScraper {
    constructor() {
        [{
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
        return s.replace(/\+/g, '%2B').replace(/ /g, '+')
    }

    _jsRegex(name) {
        return new RegExp(`^${name}\\(\\n?((?:.|\\n)+)\\n?\\);?`)
    }

    async search(query, safeSearch = -2, locale = 'us-en') {
        const response = await sf.get(`https://duckduckgo.com/html/?q=${this._format(query)}&kr=${locale}&kp=${safeSearch}`)
        const $ = cheerio.load(response.text)
        let results = Array.from($('.results_links_deep:not(.result--ad) .result__body')).map(result => ({
            title: $('.result__a', result).text(),
            description: $('.result__snippet', result).text(),
            rawDescription: $('.result__snippet', result).html().replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&apos;/g, "'").replace(/&quot;/g, '"'),
            url: qs.parse($('.result__a', result).attr('href').slice(3)).uddg,
            icon: `https://favicon.yandex.net/favicon/${qs.parse($('.result__a', result).attr('href').slice(3)).uddg.split('/')[2]}`
        }))
        if ($('.no-results')[0]) return null
        return results
    }

    async autocomplete(query) {
        const response = await sf.get('https://duckduckgo.com/ac/').query({
            callback: 'autocompleteCallback',
            q: this._format(query)
        })
        return JSON.parse(response.text.replace(/autocompleteCallback\((.+)\);/, "$1"))
    }

    async image(query, safe = false, locale = 'us-en') {
        const safeSearch = safe ? 1 : -1
        const response = await sf.get(`https://duckduckgo.com/i.js?l=${locale}&o=json&q=${query.replace(/\+/g, '%2B')}&f=,,,&p=${safeSearch}`)
        return JSON.parse(response.body).results
    }

    async video(query, safe = false, locale = 'us-en') {
        const safeSearch = safe ? 1 : -1
        const response = await sf.get(`https://duckduckgo.com/v.js?l=${locale}&o=json&strict=1&q=${query.replace(/\+/g, '%2B')}&f=,,,&p=${safeSearch}`)
        return JSON.parse(response.body).results
    }

    async amazon(query, safe = false) {
        const safeSearch = safe ? 1 : -1
        const response = await sf.get(`https://duckduckgo.com/m.js?q=${this._format(query)}&t=D&l=wt-wt&cb=ddg_spice_amazon&k=${this._format(query)}&p=${safeSearch}`)
        return JSON.parse(response.text.replace(this._jsRegex('ddg_spice_amazon'), "$1"))
    }

    async twitter(handle) {
        const response = await sf.get(`https://duckduckgo.com/tw.js?callback=ddg_spice_twitter&current=1&user=${handle}`)
        return JSON.parse(response.text.replace(this._jsRegex('ddg_spice_twitter'), "$1"))
    }
}