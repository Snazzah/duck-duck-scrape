import 'mocha';

import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { searchImages } from '../../src/search/images';
import { SafeSearchType } from '../../src/util';
import { SEARCH_QUERY_VQD } from '../__util__/constants';
import { makeSearchErrorNock, makeSearchImagesNock, makeVQDNock } from '../__util__/nock';

chai.use(chaiAsPromised);
const expect = chai.expect;

const DEFAULT_QUERY = {
  l: 'en-us',
  o: 'json',
  q: 'minecraft',
  vqd: SEARCH_QUERY_VQD,
  p: '-1',
  f: ',,,,',
  s: 0
};

describe('search/images', () => {
  describe('searchImages()', () => {
    it('should return fetch VQD when not defined', async () => {
      const vqdScope = makeVQDNock('minecraft');
      const scope = makeSearchImagesNock(DEFAULT_QUERY);

      await expect(searchImages('minecraft')).to.eventually.include({ vqd: SEARCH_QUERY_VQD });

      vqdScope.done();
      scope.done();
    });

    it('should return results', async () => {
      const scope = makeSearchImagesNock(DEFAULT_QUERY);

      await expect(searchImages('minecraft', { vqd: SEARCH_QUERY_VQD })).to.eventually.have.nested.include({
        noResults: false,
        vqd: SEARCH_QUERY_VQD,
        'results[0].height': 933,
        'results[0].image': 'https://www.gamepur.com/files/images/2019-11/minecraft-earth-how-to-craft-and-smelt.jpg',
        'results[0].source': 'Bing',
        'results[0].thumbnail': 'https://tse2.explicit.bing.net/th?id=OIP.Gs1jkAe-9iVFH4-sNHSQoQHaFs&pid=Api',
        'results[0].title': 'Minecraft Earth - How to Craft and Smelt',
        'results[0].url': 'https://www.gamepur.com/guide/44494-minecraft-earth-how-craft-smelt.html',
        'results[0].width': 1214
      });
      scope.done();
    });

    it('should return results in strict safe search', async () => {
      const scope = makeSearchImagesNock({ ...DEFAULT_QUERY, p: '1' }, 'images/strict.json');

      await expect(searchImages('minecraft', { vqd: SEARCH_QUERY_VQD, safeSearch: SafeSearchType.STRICT })).to.eventually.have.nested.include({
        noResults: false,
        vqd: SEARCH_QUERY_VQD,
        'results[1].height': 720,
        'results[1].image':
          'https://cdn1.vox-cdn.com/thumbor/zfUQE6vrHeQ-nffQApdxNEgZKEI=/0x0:1280x720/1280x720/cdn0.vox-cdn.com/uploads/chorus_image/image/43551360/minecraft_ps4_edition.0.0.jpg',
        'results[1].source': 'Bing',
        'results[1].thumbnail': 'https://tse1.mm.bing.net/th?id=OIP.Rh9hzf_1xkmn1gM__VqlyAHaEK&pid=Api',
        'results[1].title': 'Microsoft officially owns Minecraft and developer Mojang ...',
        'results[1].url': 'http://www.polygon.com/2014/11/6/7167349/microsoft-owns-minecraft-mojang-acquisition-closes',
        'results[1].width': 1280
      });
      scope.done();
    });

    it('should return no results', async () => {
      const scope = makeSearchImagesNock(DEFAULT_QUERY, 'images/noResults.json');

      await expect(searchImages('minecraft', { vqd: SEARCH_QUERY_VQD })).to.eventually.deep.equal({
        noResults: true,
        vqd: SEARCH_QUERY_VQD,
        results: []
      });
      scope.done();
    });

    it('should throw on empty queries', async () => {
      await expect(searchImages('')).to.eventually.be.rejectedWith(Error, 'Query cannot be empty!');
    });

    it('should throw on invalid options', async () => {
      // @ts-expect-error
      await expect(searchImages('a', { safeSearch: 'zzz' }), 'invalid safe search was not caught').to.eventually.be.rejectedWith(
        TypeError,
        'zzz is an invalid safe search type!'
      );
      // @ts-expect-error
      await expect(searchImages('a', { offset: 'a' }), 'invalid offset was not caught').to.eventually.be.rejectedWith(
        TypeError,
        'Search offset is not a number!'
      );
      await expect(searchImages('a', { offset: -10 }), 'negative offset was not caught').to.eventually.be.rejectedWith(
        RangeError,
        'Search offset cannot be below zero!'
      );
      // @ts-expect-error
      await expect(searchImages('a', { locale: 1 }), 'invalid lcoale was not caught').to.eventually.be.rejectedWith(
        TypeError,
        'Search locale must be a string!'
      );
      // @ts-expect-error
      await expect(searchImages('a', { size: 'zzz' }), 'invalid image size was not caught').to.eventually.be.rejectedWith(
        TypeError,
        'zzz is an invalid image size filter!'
      );
      // @ts-expect-error
      await expect(searchImages('a', { type: 'zzz' }), 'invalid image type was not caught').to.eventually.be.rejectedWith(
        TypeError,
        'zzz is an invalid image type filter!'
      );
      // @ts-expect-error
      await expect(searchImages('a', { layout: 'zzz' }), 'invalid image layout was not caught').to.eventually.be.rejectedWith(
        TypeError,
        'zzz is an invalid image layout filter!'
      );
      // @ts-expect-error
      await expect(searchImages('a', { color: 'zzz' }), 'invalid color was not caught').to.eventually.be.rejectedWith(
        TypeError,
        'zzz is an invalid color filter!'
      );
      // @ts-expect-error
      await expect(searchImages('a', { license: 'zzz' }), 'invalid license was not caught').to.eventually.be.rejectedWith(
        TypeError,
        'zzz is an invalid license filter!'
      );
      await expect(searchImages('node', { vqd: 'zzz' }), 'invalid vqd was not caught').to.eventually.be.rejectedWith(Error, 'zzz is an invalid VQD!');
    });

    it('should throw on server errors', async () => {
      const scope = makeSearchErrorNock('/i.js', DEFAULT_QUERY);

      await expect(searchImages('minecraft', { vqd: SEARCH_QUERY_VQD })).to.eventually.be.rejectedWith(Error, 'A server error occurred!');
      scope.done();
    });
  });
});
