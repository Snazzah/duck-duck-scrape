import { decode } from 'html-entities';
import needle, { NeedleOptions } from 'needle';

import {
  CallbackDuckbarPayload,
  CallbackNextSearch,
  CallbackSearchResult,
  DuckbarImageResult,
  DuckbarNewsResult,
  DuckbarRelatedSearch,
  DuckbarVideoResult
} from '../types';
import { ensureJSON, getVQD, queryString, SafeSearchType, SearchTimeType } from '../util';
import { NewsResult } from './news';
import { VideoResult } from './videos';

/** The options for {@link search}. */
export interface SearchOptions {
  /** The safe search type of the search. */
  safeSearch?: SafeSearchType;
  /** The time range of the searches, can be a SearchTimeType or a date range ("2021-03-16..2021-03-30") */
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

const defaultOptions: SearchOptions = {
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

/**
 * The search results from {@link search}.
 * `images`, `news`, `videos` and `related` only show up if the query
 * shows elements of these in a webpage search.
 */
export interface SearchResults {
  /** Whether there were no results found. */
  noResults: boolean;
  /** The VQD of the search query. */
  vqd: string;
  /** The web results of the search. */
  results: SearchResult[];
  /** The image results of the search. */
  images?: DuckbarImageResult[];
  /** The news article results of the search. */
  news?: NewsResult[];
  /** The video results of the search. */
  videos?: VideoResult[];
  /** The related searches of the query. */
  related?: RelatedResult[];
}

/** A web search result. */
export interface SearchResult {
  /** The hostname of the website. (i.e. "google.com") */
  hostname: string;
  /** The URL of the result. */
  url: string;
  /** The title of the result. */
  title: string;
  /**
   * The sanitized description of the result.
   * Bold tags will still be present in this string.
   */
  description: string;
  /** The description of the result. */
  rawDescription: string;
  /** The icon of the website. */
  icon: string;
  /** The ddg!bang information of the website, if any. */
  bang?: SearchResultBang;
}

export interface SearchResultBang {
  /** The prefix of the bang. (i.e. "w" for !w) */
  prefix: string;
  /** The title of the bang. */
  title: string;
  /** The domain of the bang. */
  domain: string;
}

export interface RelatedResult {
  text: string;
  raw: string;
}

/**
 * Search something.
 * @category Search
 * @param query The query to search with
 * @param options The options of the search
 * @param needleOptions The options of the HTTP request
 * @returns Search results
 */
export async function search(query: string, options?: SearchOptions, needleOptions?: NeedleOptions): Promise<SearchResults> {
  if (!query) throw new Error('Query cannot be empty!');
  if (!options) options = defaultOptions;
  else options = sanityCheck(options);

  let vqd = options.vqd!;
  if (!vqd) vqd = await getVQD(query, 'web', needleOptions);

  /* istanbul ignore next */
  const queryObject: Record<string, string> = {
    q: query,
    ...(options.safeSearch !== SafeSearchType.STRICT ? { t: 'D' } : {}),
    l: options.locale!,
    ...(options.safeSearch === SafeSearchType.STRICT ? { p: '1' } : {}),
    kl: options.region || 'wt-wt',
    s: String(options.offset),
    dl: 'en',
    ct: 'US',
    ss_mkt: options.marketRegion!,
    df: options.time! as string,
    vqd,
    ...(options.safeSearch !== SafeSearchType.STRICT ? { ex: String(options.safeSearch) } : {}),
    sp: '1',
    bpa: '1',
    biaexp: 'b',
    msvrtexp: 'b',
    ...(options.safeSearch === SafeSearchType.STRICT
      ? {
          videxp: 'a',
          nadse: 'b',
          eclsexp: 'a',
          stiaexp: 'a',
          tjsexp: 'b',
          related: 'b',
          msnexp: 'a'
        }
      : {
          nadse: 'b',
          eclsexp: 'b',
          tjsexp: 'b'
          // cdrexp: 'b'
        })
  };

  const response = await needle('get', `https://links.duckduckgo.com/d.js?${queryString(queryObject)}`, needleOptions);

  if ((response.body as string).includes('DDG.deep.is506')) throw new Error('A server error occurred!');
  if (response.body.toString().includes('DDG.deep.anomalyDetectionBlock'))
    throw new Error('DDG detected an anomaly in the request, you are likely making requests too quickly.');

  const searchResults = JSON.parse(SEARCH_REGEX.exec(response.body)![1].replace(/\t/g, '    ')) as (CallbackSearchResult | CallbackNextSearch)[];

  // check for no results
  if (searchResults.length === 1 && !('n' in searchResults[0])) {
    const onlyResult = searchResults[0] as CallbackSearchResult;
    /* istanbul ignore next */
    if ((!onlyResult.da && onlyResult.t === 'EOF') || !onlyResult.a || onlyResult.d === 'google.com search')
      return {
        noResults: true,
        vqd,
        results: []
      };
  }

  const results: SearchResults = {
    noResults: false,
    vqd,
    results: []
  };

  // Populate search results
  for (const search of searchResults) {
    if ('n' in search) continue;
    let bang: SearchResultBang | undefined;
    if (search.b) {
      const [prefix, title, domain] = search.b.split('\t');
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
    const imagesResult = JSON.parse(imagesMatch[1].replace(/\t/g, '    ')) as CallbackDuckbarPayload<DuckbarImageResult>;
    results.images = imagesResult.results.map((i) => {
      i.title = decode(i.title);
      return i;
    });
  }

  // News
  const newsMatch = NEWS_REGEX.exec(response.body);
  if (newsMatch) {
    const newsResult = JSON.parse(newsMatch[1].replace(/\t/g, '    ')) as CallbackDuckbarPayload<DuckbarNewsResult>;
    results.news = newsResult.results.map((article) => ({
      date: article.date,
      excerpt: decode(article.excerpt),
      image: article.image,
      relativeTime: article.relative_time,
      syndicate: article.syndicate,
      title: decode(article.title),
      url: article.url,
      isOld: !!article.is_old
    })) as NewsResult[];
  }

  // Videos
  const videosMatch = VIDEOS_REGEX.exec(response.body);
  if (videosMatch) {
    const videoResult = JSON.parse(videosMatch[1].replace(/\t/g, '    ')) as CallbackDuckbarPayload<DuckbarVideoResult>;
    results.videos = [];
    /* istanbul ignore next */
    for (const video of videoResult.results) {
      results.videos.push({
        url: video.content,
        title: decode(video.title),
        description: decode(video.description),
        image: video.images.large || video.images.medium || video.images.small || video.images.motion,
        duration: video.duration,
        publishedOn: video.publisher,
        published: video.published,
        publisher: video.uploader,
        viewCount: video.statistics.viewCount || undefined
      });
    }
  }

  // Related Searches
  const relatedMatch = RELATED_SEARCHES_REGEX.exec(response.body);
  if (relatedMatch) {
    const relatedResult = JSON.parse(relatedMatch[1].replace(/\t/g, '    ')) as CallbackDuckbarPayload<DuckbarRelatedSearch>;
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
  options = Object.assign({}, defaultOptions, options);

  if (!(options.safeSearch! in SafeSearchType)) throw new TypeError(`${options.safeSearch} is an invalid safe search type!`);

  /* istanbul ignore next */
  if (typeof options.safeSearch! === 'string') options.safeSearch = SafeSearchType[options.safeSearch!] as any as SafeSearchType;

  if (typeof options.offset !== 'number') throw new TypeError(`Search offset is not a number!`);

  if (options.offset! < 0) throw new RangeError('Search offset cannot be below zero!');

  if (
    options.time &&
    !Object.values(SearchTimeType).includes(options.time as SearchTimeType) &&
    !/\d{4}-\d{2}-\d{2}..\d{4}-\d{2}-\d{2}/.test(options.time as string)
  )
    throw new TypeError(`${options.time} is an invalid search time!`);

  if (!options.locale || typeof options.locale! !== 'string') throw new TypeError('Search locale must be a string!');

  if (!options.region || typeof options.region! !== 'string') throw new TypeError('Search region must be a string!');

  if (!options.marketRegion || typeof options.marketRegion! !== 'string') throw new TypeError('Search market region must be a string!');

  if (options.vqd && !/\d-\d+-\d+/.test(options.vqd)) throw new Error(`${options.vqd} is an invalid VQD!`);

  return options;
}

/** An auto-complete term. */
export interface AutocompleteTerm {
  /** The phrase of the auto-completed term. */
  phrase: string;
}

/** An auto-complete bang. */
export interface AutocompleteBang {
  /** The image of the bang */
  image: string;
  /** The prefix of the bang. */
  phrase: string;
  score: number;
  /** The title of the bang. */
  snippet: string;
}

export type AutocompleteResult = AutocompleteTerm | AutocompleteBang;

/**
 * Get auto-complete terms from a query.
 * @category Search
 * @param query The query to search
 * @param region The region to search as
 * @param needleOptions The options of the HTTP request
 * @returns Autocomplete terms
 */
export async function autocomplete(query: string, region?: string, needleOptions?: NeedleOptions): Promise<AutocompleteResult[]> {
  if (!query) throw new Error('Query cannot be empty!');

  const queryObject: Record<string, string> = {
    q: query,
    kl: region || 'wt-wt'
  };

  const response = await needle('get', `https://duckduckgo.com/ac/?${queryString(queryObject)}`, needleOptions);

  return ensureJSON(response.body);
}
