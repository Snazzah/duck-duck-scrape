import nock, { DataMatcherMap } from 'nock';

import { DDG_HOST, DDG_LINKS_HOST } from './constants';

export const makeVQDNock = (query: string, noVqd = false) =>
  nock(DDG_HOST)
    .get('/')
    .query({ q: query, ia: 'web' })
    .replyWithFile(200, `test/__util__/pages/${noVqd ? 'no-' : ''}vqd.html`);

export const makeAutocompleteNock = (query: string, file = 'search/autocomplete.json') =>
  nock(DDG_HOST).get('/ac/').query({ q: query, kl: 'wt-wt' }).replyWithFile(200, `test/__util__/data/search/${file}`);

export const makeSearchNock = (query: DataMatcherMap, file = 'search/default.js') =>
  nock(DDG_LINKS_HOST).get('/d.js').query(query).replyWithFile(200, `test/__util__/data/search/${file}`);

export const makeSearchErrorNock = (path: string, query: DataMatcherMap) =>
  nock(DDG_HOST).get(path).query(query).reply(403, 'If this error persists, please let us know: ops@duckduckgo.com');

export const makeSearchImagesNock = (query: DataMatcherMap, file = 'images/default.json') =>
  nock(DDG_HOST).get('/i.js').query(query).replyWithFile(200, `test/__util__/data/search/${file}`);
