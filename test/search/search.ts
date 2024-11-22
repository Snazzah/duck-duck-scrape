import 'mocha';

import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { autocomplete, search } from '../../src/search/search';
import { SafeSearchType } from '../../src/util';
import { SEARCH_QUERY_VQD } from '../__util__/constants';
import { makeAutocompleteNock, makeSearchNock, makeVQDNock } from '../__util__/nock';

chai.use(chaiAsPromised);
const expect = chai.expect;

const DEFAULT_QUERY = {
  q: 'node',
  t: 'D',
  l: 'en-us',
  kl: 'wt-wt',
  s: '0',
  dl: 'en',
  ct: 'US',
  bing_market: 'en-US',
  df: 'a',
  vqd: SEARCH_QUERY_VQD,
  ex: '-2',
  sp: '1',
  bpa: '1',
  biaexp: 'b',
  msvrtexp: 'b',
  nadse: 'b',
  eclsexp: 'b',
  tjsexp: 'b'
};

const STRICT_QUERY = {
  q: 'node',
  l: 'en-us',
  p: '1',
  kl: 'wt-wt',
  s: '0',
  dl: 'en',
  ct: 'US',
  bing_market: 'en-US',
  df: 'a',
  vqd: SEARCH_QUERY_VQD,
  sp: '1',
  bpa: '1',
  biaexp: 'b',
  msvrtexp: 'b',
  videxp: 'a',
  nadse: 'b',
  eclsexp: 'a',
  stiaexp: 'a',
  tjsexp: 'b',
  related: 'b',
  msnexp: 'a'
};

describe('search/search', () => {
  describe('search()', () => {
    it('should return fetch VQD when not defined', async () => {
      const vqdScope = makeVQDNock('node');
      const scope = makeSearchNock(DEFAULT_QUERY);

      await expect(search('node')).to.eventually.include({ vqd: SEARCH_QUERY_VQD });

      vqdScope.done();
      scope.done();
    });

    it('should return results', async () => {
      const scope = makeSearchNock(DEFAULT_QUERY);

      await expect(search('node', { vqd: SEARCH_QUERY_VQD })).to.eventually.have.nested.include({
        noResults: false,
        vqd: SEARCH_QUERY_VQD,
        'results[0].title': 'Node.js',
        'results[0].description': "<b>Node</b>.js. <b>Node</b>.js® is a JavaScript runtime built on Chrome's V8 JavaScript engine.",
        'results[0].hostname': 'nodejs.org',
        'results[0].icon': 'https://external-content.duckduckgo.com/ip3/nodejs.org.ico',
        'results[0].url': 'https://nodejs.org/',
        'results[0].bang.prefix': 'node',
        'related[0].text': 'node js 10 download for windows 10'
      });
      scope.done();
    });

    it('should return results in strict safe search', async () => {
      const scope = makeSearchNock(STRICT_QUERY, 'search/strict.js');

      await expect(search('node', { vqd: SEARCH_QUERY_VQD, safeSearch: SafeSearchType.STRICT })).to.eventually.have.nested.include({
        noResults: false,
        vqd: SEARCH_QUERY_VQD,
        'results[0].title': 'Node.js',
        'results[0].description': "<b>Node</b>.js. <b>Node</b>.js® is a JavaScript runtime built on Chrome's V8 JavaScript engine.",
        'results[0].hostname': 'nodejs.org',
        'results[0].icon': 'https://external-content.duckduckgo.com/ip3/nodejs.org.ico',
        'results[0].url': 'https://nodejs.org/',
        'results[0].bang.prefix': 'node'
      });
      scope.done();
    });

    it('should return no results', async () => {
      const scope = makeSearchNock(DEFAULT_QUERY, 'search/noResults.js');

      await expect(search('node', { vqd: SEARCH_QUERY_VQD })).to.eventually.deep.equal({
        noResults: true,
        vqd: SEARCH_QUERY_VQD,
        results: []
      });
      scope.done();
    });

    it('should return news results', async () => {
      const scope = makeSearchNock(DEFAULT_QUERY, 'search/news.js');

      await expect(search('node', { vqd: SEARCH_QUERY_VQD })).to.eventually.have.nested.include({
        noResults: false,
        vqd: SEARCH_QUERY_VQD,
        'news[0].excerpt':
          'Out of many, the most preferred and highly adopted platform that many real-time application development companies are using is <b>Node</b>.js. Globally, around 98% of fortune 500 companies build real-time applications using <b>Node</b>.js to develop and maintain highly ...',
        'news[0].title': "Node.js is The Most Preferred Real-time Applications Development Platform - Here's Why?",
        'news[0].relativeTime': '3 days ago',
        'news[0].syndicate': 'Bing',
        'news[0].isOld': false
      });
      scope.done();
    });

    it('should return video results', async () => {
      const scope = makeSearchNock(DEFAULT_QUERY, 'search/videos.js');

      await expect(search('node', { vqd: SEARCH_QUERY_VQD })).to.eventually.have.nested.include({
        noResults: false,
        vqd: SEARCH_QUERY_VQD,
        'videos[0].title': 'Node.js Tutorial | Node.js Tutorial For Beginners | Learn Node.js | NodeJS Tutorial | Simplilearn',
        'videos[0].duration': '3:59:44',
        'videos[0].publishedOn': 'YouTube',
        'videos[0].viewCount': 15424
      });
      scope.done();
    });

    it('should throw on empty queries', async () => {
      await expect(search('')).to.eventually.be.rejectedWith(Error, 'Query cannot be empty!');
    });

    it('should throw on invalid options', async () => {
      // @ts-expect-error
      await expect(search('node', { safeSearch: 'zzz' }), 'invalid safe search was not caught').to.eventually.be.rejectedWith(
        TypeError,
        'zzz is an invalid safe search type!'
      );
      // @ts-expect-error
      await expect(search('node', { offset: 'a' }), 'invalid offset was not caught').to.eventually.be.rejectedWith(
        TypeError,
        'Search offset is not a number!'
      );
      await expect(search('node', { offset: -10 }), 'negative offset was not caught').to.eventually.be.rejectedWith(
        RangeError,
        'Search offset cannot be below zero!'
      );
      await expect(search('node', { time: 'zzz' }), 'invalid time was not caught').to.eventually.be.rejectedWith(
        TypeError,
        'zzz is an invalid search time!'
      );
      // @ts-expect-error
      await expect(search('node', { locale: 1 }), 'invalid locale was not caught').to.eventually.be.rejectedWith(
        TypeError,
        'Search locale must be a string!'
      );
      // @ts-expect-error
      await expect(search('node', { region: 1 }), 'invalid region was not caught').to.eventually.be.rejectedWith(
        TypeError,
        'Search region must be a string!'
      );
      // @ts-expect-error
      await expect(search('node', { marketRegion: 1 }), 'invalid market region was not caught').to.eventually.be.rejectedWith(
        TypeError,
        'Search market region must be a string!'
      );
      await expect(search('node', { vqd: 'zzz' }), 'invalid vqd was not caught').to.eventually.be.rejectedWith(Error, 'zzz is an invalid VQD!');
    });

    it('should throw on server errors', async () => {
      const scope = makeSearchNock(DEFAULT_QUERY, '506.js');

      await expect(search('node', { vqd: SEARCH_QUERY_VQD })).to.eventually.be.rejectedWith(Error, 'A server error occurred!');
      scope.done();
    });

    it('should throw on server anomalies', async () => {
      const scope = makeSearchNock(DEFAULT_QUERY, 'anomalyDetectionBlock.js');

      await expect(search('node', { vqd: SEARCH_QUERY_VQD })).to.eventually.be.rejectedWith(
        Error,
        'DDG detected an anomaly in the request, you are likely making requests too quickly.'
      );
      scope.done();
    });
  });

  describe('autocomplete()', () => {
    it('should return results', async () => {
      const scope = makeAutocompleteNock('node');

      await expect(autocomplete('node')).to.eventually.deep.equal([
        { phrase: 'node.js' },
        { phrase: 'node js install' },
        { phrase: 'nodes of ranvier' },
        { phrase: 'node lib' },
        { phrase: 'node unblocker' },
        { phrase: 'node red' },
        { phrase: 'nodecraft' },
        { phrase: 'nodemon' }
      ]);
      scope.done();
    });

    it('should throw on empty queries', async () => {
      await expect(autocomplete('')).to.eventually.be.rejectedWith(Error, 'Query cannot be empty!');
    });
  });
});
