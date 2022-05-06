import 'mocha';

import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import nock from 'nock';

import { ensureJSON, getVQD, parseSpiceBody, queryString } from '../src/util';
import { DDG_HOST, SEARCH_QUERY_VQD } from './__util__/constants';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('util', () => {
  describe('queryString()', () => {
    it('should convert object to query string', () => {
      expect(queryString({ a: '1', b: '2', c: '3' })).to.equal('a=1&b=2&c=3');
    });
  });

  describe('getVQD()', () => {
    it('should get a VQD', async () => {
      const scope = nock(DDG_HOST).get('/').query({ q: 'node', ia: 'web' }).replyWithFile(200, 'test/__util__/pages/vqd.html');

      await expect(getVQD('node')).to.eventually.equal(SEARCH_QUERY_VQD);
      scope.done();
    });

    it('should error if no VQD was found', async () => {
      const scope = nock(DDG_HOST).get('/').query({ q: 'node', ia: 'web' }).replyWithFile(200, 'test/__util__/pages/no-vqd.html');

      await expect(getVQD('node')).to.eventually.be.rejectedWith(Error, 'Failed to get the VQD for query "node".');
      scope.done();
    });
  });

  describe('ensureJSON()', () => {
    it('should parse JSON in buffers', () => {
      expect(ensureJSON(Buffer.from('{"done":true}'))).to.deep.equal({ done: true });
    });

    it('should parse JSON in strings', () => {
      expect(ensureJSON('{"done":true}')).to.deep.equal({ done: true });
    });

    it('should passthrough JSON', () => {
      expect(ensureJSON({ done: true })).to.deep.equal({ done: true });
    });
  });

  describe('parseSpiceBody()', () => {
    it('should parse spice body', () => {
      const body = 'ddg_spice_test(\n{"done":true});\n';
      expect(parseSpiceBody(body)).to.deep.equal({ done: true });
    });
  });
});
