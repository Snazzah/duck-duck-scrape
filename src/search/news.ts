import { decode } from 'html-entities';
import needle, { NeedleOptions } from 'needle';
import { DuckbarNewsResult, DuckbarResponse } from '../types';
import { ensureJSON, getVQD, queryString, SearchTimeType } from '../util';
import { SafeSearchType } from '../util';

export interface NewsSearchOptions {
  /** The safe search type of the search. */
  safeSearch?: SafeSearchType;
  /** The locale(?) of the search. Defaults to "en-us". */
  locale?: string;
  /** The number to offset the results to. */
  offset?: number;
  /**
   * The string that acts like a key to a search.
   * Set this if you made a search with the same query.
   */
  vqd?: string;
  /** The time range of the articles. */
  time?: SearchTimeType;
}

const defaultOptions: NewsSearchOptions = {
  safeSearch: SafeSearchType.OFF,
  locale: 'en-us',
  offset: 0
};

export interface NewsSearchResults {
  noResults: boolean;
  vqd: string;
  results: DuckbarNewsResult[];
}

/**
 * Search news articles.
 * @category Search
 * @param query The query to search with
 * @param options The options of the search
 * @param needleOptions The options of the HTTP request
 * @returns Search results
 */
export async function searchNews(
  query: string,
  options?: NewsSearchOptions,
  needleOptions?: NeedleOptions
): Promise<NewsSearchResults> {
  if (!query) throw new Error('Query cannot be empty!');
  if (!options) options = defaultOptions;
  else options = sanityCheck(options);

  let vqd = options.vqd!;
  if (!vqd) vqd = await getVQD(query, 'web', needleOptions);

  const queryObject: Record<string, string> = {
    l: options.locale!,
    o: 'json',
    noamp: '1',
    q: query,
    vqd,
    p: options.safeSearch === 0 ? '1' : String(options.safeSearch),
    df: options.time || '',
    s: String(options.offset || 0)
  };

  const response = await needle(
    'get',
    `https://duckduckgo.com/news.js?${queryString(queryObject)}`,
    needleOptions
  );

  if (response.statusCode === 403) throw new Error('A server error occurred!');

  const newsResult = ensureJSON(response.body) as DuckbarResponse<DuckbarNewsResult>;

  return {
    noResults: !!newsResult.results.length,
    vqd,
    results: newsResult.results.map((article) => {
      article.title = decode(article.title);
      article.excerpt = decode(article.excerpt);
      return article;
    })
  };
}

function sanityCheck(options: NewsSearchOptions) {
  options = Object.assign({}, defaultOptions, options);

  if (!(options.safeSearch! in SafeSearchType))
    throw new TypeError(`${options.safeSearch} is an invalid safe search type!`);

  if (typeof options.safeSearch! === 'string')
    // @ts-ignore
    options.safeSearch = SafeSearchType[options.safeSearch!];

  if (typeof options.offset !== 'number') throw new TypeError(`Search offset is not a number!`);

  if (options.offset! < 0) throw new RangeError('Search offset cannot be below zero!');

  if (!options.locale || typeof options.locale! !== 'string')
    throw new TypeError('Search locale must be a string!');

  if (options.time && Object.values(SearchTimeType).includes(options.time))
    throw new TypeError(`${options.time} is an invalid time filter!`);

  if (options.vqd && !/\d-\d+-\d+/.test(options.vqd)) throw new Error(`${options.vqd} is an invalid VQD!`);

  return options;
}
