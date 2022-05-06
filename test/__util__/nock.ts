import nock, { DataMatcherMap } from 'nock';

import { DDG_HOST, DDG_LINKS_HOST } from './constants';

export const makeVQDNock = (query: string, noVqd = false) =>
  nock(DDG_HOST)
    .get('/')
    .query({ q: query, ia: 'web' })
    .replyWithFile(200, `test/__util__/pages/${noVqd ? 'no-' : ''}vqd.html`);

export const makeSearchNock = (query: DataMatcherMap, file = 'search/default.js') =>
  nock(DDG_LINKS_HOST).get('/d.js').query(query).replyWithFile(200, `test/__util__/data/search/${file}`);

export const makeSearchImagesNock = (query: DataMatcherMap, file = 'search/default.js') =>
  nock(DDG_HOST).get('/i.js').query(query).replyWithFile(200, `test/__util__/data/search/${file}`);
