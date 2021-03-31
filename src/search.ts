import needle, { NeedleOptions } from 'needle';
import { decode } from 'html-entities';
import {
  CallbackDuckbarPayload,
  DuckbarImageResult,
  CallbackNextSearch,
  CallbackSearchResult,
  DuckbarVideoResult,
  DuckbarRelatedSearch,
  DuckbarNewsResult
} from './callbackTypes';
import { getVQD, queryString } from './util';

/** The safe search values when searching DuckDuckGo. */
export enum SafeSearchType {
  STRICT = 0,
  MODERATE = -1,
  OFF = -2
}

/** The type of times of the search results in DuckDuckGo. */
export enum SearchTimeType {
  ALL = 'a',
  DAY = 'd',
  WEEK = 'w',
  MONTH = 'm',
  YEAR = 'y'
}

export interface SearchOptions {
  /** The safe search type of the search. */
  safeSearch?: SafeSearchType;
  /** The time of the searches, can be a SearchTimeType or a date range ("2021-03-16..2021-03-30") */
  time?: SearchTimeType | string;
  /** The locale(?) of the search. Defaults to "en-us". */
  locale?: string;
  /** The region of the search. Defaults to "wt-wt" or all regions. */
  region?: string;
  /** The market region(?) of the search. Defaults to "US". */
  marketRegion?: string;
  /** The number to offset the results to. */
  offset?: number;
  /**
   * The string that acts like a key to a search.
   * Set this if you made a search with the same query.
   */
  vqd?: string;
}

const defaultSearchOptions: SearchOptions = {
  safeSearch: SafeSearchType.OFF,
  time: SearchTimeType.ALL,
  locale: 'en-us',
  region: 'wt-wt',
  offset: 0,
  marketRegion: 'us'
};

const SEARCH_REGEX = /DDG\.pageLayout\.load\('d',(\[.+\])\);DDG\.duckbar\.load\('images'/;
const IMAGES_REGEX = /;DDG\.duckbar\.load\('images', ({"ads":.+"vqd":{".+":"\d-\d+-\d+"}})\);DDG\.duckbar\.load\('news/;
const NEWS_REGEX = /;DDG\.duckbar\.load\('news', ({"ads":.+"vqd":{".+":"\d-\d+-\d+"}})\);DDG\.duckbar\.load\('videos/;
const VIDEOS_REGEX = /;DDG\.duckbar\.load\('videos', ({"ads":.+"vqd":{".+":"\d-\d+-\d+"}})\);DDG\.duckbar\.loadModule\('related_searches/;
const RELATED_SEARCHES_REGEX = /DDG\.duckbar\.loadModule\('related_searches', ({"ads":.+"vqd":{".+":"\d-\d+-\d+"}})\);DDG\.duckbar\.load\('products/;

export interface SearchNoResults {
  noResults: true;
  vqd: string;
}

export interface SearchResults {
  noResults: false;
  vqd: string;
  results: SearchResult[];
  images?: DuckbarImageResult[];
  news?: DuckbarNewsResult[];
  videos?: VideoResult[];
  related?: RelatedResult[];
}

export interface SearchResult {
  hostname: string;
  url: string;
  title: string;
  description: string;
  rawDescription: string;
  icon: string;
  bang?: SearchResultBang;
}

export interface SearchResultBang {
  prefix: string;
  title: string;
  domain: string;
}

export interface VideoResult {
  url: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  published: string;
  publishedOn: string;
  viewCount?: number;
}

export interface RelatedResult {
  text: string;
  raw: string;
}

export async function search(query: string, options?: SearchOptions, needleOptions?: NeedleOptions) {
  if (!query) throw new Error('Query cannot be empty!');
  if (!options) options = defaultSearchOptions;
  else options = sanityCheck(options);

  let vqd = options.vqd!;
  if (!vqd) vqd = await getVQD(query, 'web', needleOptions);

  const queryObject: Record<string, string> = {
    q: query,
    l: options.locale!,
    kl: options.region || 'wt-wt',
    s: String(options.offset),
    dl: 'en',
    ct: 'US',
    ss_mkt: options.marketRegion!,
    df: options.time! as string,
    vqd,
    ex: String(options.safeSearch),
    sp: '1',
    bpa: '1',
    cdrexp: 'b',
    biaexp: 'b',
    msvrtexp: 'b'
  };

  const response = await needle(
    'get',
    `https://duckduckgo.com/d.js?${queryString(queryObject)}`,
    needleOptions
  );

  if ((response.body as string).includes('DDG.deep.is506')) throw new Error('A server error occurred!');

  const searchResults = JSON.parse(SEARCH_REGEX.exec(response.body)![1].replace(/\t/g, '    ')) as (
    | CallbackSearchResult
    | CallbackNextSearch
  )[];

  // check for no results
  if (searchResults.length === 1 && !('n' in searchResults[1])) {
    const onlyResult = searchResults[1] as CallbackSearchResult;
    if ((!onlyResult.da && onlyResult.t === 'EOF') || !onlyResult.a || onlyResult.d === 'google.com search')
      return {
        noResults: true,
        vqd: options.vqd!
      };
  }

  const results: SearchResults = {
    noResults: false,
    vqd: options.vqd!,
    results: []
  };

  // Populate search results
  for (const search of searchResults) {
    if ('n' in search) continue;
    let bang: SearchResultBang | undefined;
    if (search.b) {
      const [prefix, title, domain] = search.b.split('    ');
      bang = { prefix, title, domain };
    }
    results.results.push({
      title: search.t,
      description: decode(search.a),
      rawDescription: search.a,
      hostname: search.i,
      icon: `https://external-content.duckduckgo.com/ip3/${search.i}.ico`,
      url: search.u,
      bang
    });
  }

  // Images
  const imagesMatch = IMAGES_REGEX.exec(response.body);
  if (imagesMatch) {
    const imagesResult = JSON.parse(
      imagesMatch[1].replace(/\t/g, '    ')
    ) as CallbackDuckbarPayload<DuckbarImageResult>;
    results.images = imagesResult.results;
  }

  // News
  const newsMatch = NEWS_REGEX.exec(response.body);
  if (newsMatch) {
    const newsResult = JSON.parse(
      newsMatch[1].replace(/\t/g, '    ')
    ) as CallbackDuckbarPayload<DuckbarNewsResult>;
    results.news = newsResult.results;
  }

  // Videos
  const videosMatch = VIDEOS_REGEX.exec(response.body);
  if (videosMatch) {
    const videoResult = JSON.parse(
      videosMatch[1].replace(/\t/g, '    ')
    ) as CallbackDuckbarPayload<DuckbarVideoResult>;
    results.videos = [];
    for (const video of videoResult.results) {
      results.videos.push({
        url: video.content,
        title: video.title,
        description: video.description,
        image: video.images.large,
        duration: video.duration,
        publishedOn: video.publisher,
        published: video.published,
        viewCount: video.statistics.viewCount
      });
    }
  }

  // Related Searches
  const relatedMatch = RELATED_SEARCHES_REGEX.exec(response.body);
  if (relatedMatch) {
    const relatedResult = JSON.parse(
      relatedMatch[1].replace(/\t/g, '    ')
    ) as CallbackDuckbarPayload<DuckbarRelatedSearch>;
    results.related = [];
    for (const related of relatedResult.results) {
      results.related.push({
        text: related.text,
        raw: related.display_text
      });
    }
  }

  // TODO: Products

  return results;
}

function sanityCheck(options: SearchOptions) {
  options = Object.assign({}, defaultSearchOptions, options);

  if (!(options.safeSearch! in SafeSearchType))
    throw new TypeError(`${options.safeSearch} is an invalid safe search type!`);

  if (typeof options.safeSearch! === 'string')
    // @ts-ignore
    options.safeSearch = SafeSearchType[options.safeSearch!];

  if (typeof options.offset !== 'number') throw new TypeError(`Search offset is not a number!`);

  if (options.offset! < 0) throw new RangeError('Search offset cannot be below zero!');

  if (
    !(options.time! in SearchTimeType) &&
    !/\d{4}-\d{2}-\d{2}..\d{4}-\d{2}-\d{2}/.test(options.time as string)
  )
    throw new TypeError(`${options.time} is an invalid search time!`);

  if (!options.locale || typeof options.locale! !== 'string')
    throw new TypeError('Search locale must be a string!');

  if (!options.region || typeof options.region! !== 'string')
    throw new TypeError('Search region must be a string!');

  if (!options.marketRegion || typeof options.marketRegion! !== 'string')
    throw new TypeError('Search market region must be a string!');

  if (options.vqd && !/\d-\d+-\d+/.test(options.vqd)) throw new Error(`${options.time} is an invalid VQD!`);

  return options;
}
