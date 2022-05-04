import { decode } from 'html-entities';
import needle, { NeedleOptions } from 'needle';

import { DuckbarResponse, DuckbarVideoResult } from '../types';
import { ensureJSON, getVQD, queryString, SafeSearchType, SearchTimeType } from '../util';

/** The types of video definition. */
export enum VideoDefinition {
  /** Any definition. */
  ANY = '',
  /** High definition. */
  HIGH = 'high',
  /** Standard definition. */
  STANDARD = 'standard'
}

/** The types of video duration. */
export enum VideoDuration {
  /** Any video duration. */
  ANY = '',
  /** Short videos, shorter than ~5 minutes. */
  SHORT = 'short',
  /** Medium length videos, between 5 and 20 minutes. */
  MEDIUM = 'medium',
  /** Long videos, longer than 20 minutes. */
  LONG = 'long'
}

/** The types of video licenses. */
export enum VideoLicense {
  /** Any video license. */
  ANY = '',
  /** Creative Commons license. */
  CREATIVE_COMMONS = 'creativeCommon',
  /** YouTube Standard license. */
  YOUTUBE = 'youtube'
}

/** The options for {@link searchVideos}. */
export interface VideoSearchOptions {
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
  /** The time range of the videos. */
  time?: SearchTimeType;
  definition?: VideoDefinition;
  duration?: VideoDuration;
  license?: VideoLicense;
}

const defaultOptions: VideoSearchOptions = {
  safeSearch: SafeSearchType.OFF,
  locale: 'en-us',
  offset: 0
};

/** The video results from {@link searchVideos}. */
export interface VideoSearchResults {
  /** Whether there were no results found. */
  noResults: boolean;
  /** The VQD of the search query. */
  vqd: string;
  /** The video results of the search. */
  results: VideoResult[];
}

/** A video search result. */
export interface VideoResult {
  /** The URL of the video. */
  url: string;
  /** The title of the video. */
  title: string;
  /** The description of the video. */
  description: string;
  /** The image URL of the video. */
  image: string;
  /** The duration of the video. (i.e. "9:20") */
  duration: string;
  /** The ISO timestamp of when the video was published. */
  published: string;
  /** Where the video was publised on. (i.e. "YouTube") */
  publishedOn: string;
  /** The name of who uploaded the video. */
  publisher: string;
  /** The view count of the video. */
  viewCount?: number;
}

/**
 * Search videos.
 * @category Search
 * @param query The query to search with
 * @param options The options of the search
 * @param needleOptions The options of the HTTP request
 * @returns Search results
 */
export async function searchVideos(query: string, options?: VideoSearchOptions, needleOptions?: NeedleOptions): Promise<VideoSearchResults> {
  if (!query) throw new Error('Query cannot be empty!');
  if (!options) options = defaultOptions;
  else options = sanityCheck(options);

  let vqd = options.vqd!;
  if (!vqd) vqd = await getVQD(query, 'web', needleOptions);

  const filters = [
    options.time && options.time !== 'a' ? `publishedAfter:${options.time}` : '',
    options.definition ? `videoDefinition:${options.definition}` : '',
    options.duration ? `videoDuration:${options.duration}` : '',
    options.license ? `videoLicense:${options.license}` : ''
  ];

  const queryObject: Record<string, string> = {
    l: options.locale!,
    o: 'json',
    q: query,
    vqd,
    p: options.safeSearch === 0 ? '1' : String(options.safeSearch),
    f: filters.toString(),
    s: String(options.offset || 0)
  };

  const response = await needle('get', `https://duckduckgo.com/v.js?${queryString(queryObject)}`, needleOptions);

  if (response.statusCode === 403) throw new Error('A server error occurred!');

  const videosResult = ensureJSON(response.body) as DuckbarResponse<DuckbarVideoResult>;

  return {
    noResults: !videosResult.results.length,
    vqd,
    results: videosResult.results.map((video) => ({
      url: video.content,
      title: decode(video.title),
      description: decode(video.description),
      image: video.images.large || video.images.medium || video.images.small || video.images.motion,
      duration: video.duration,
      publishedOn: video.publisher,
      published: video.published,
      publisher: video.uploader,
      viewCount: video.statistics.viewCount || undefined
    }))
  };
}

function sanityCheck(options: VideoSearchOptions) {
  options = Object.assign({}, defaultOptions, options);

  if (!(options.safeSearch! in SafeSearchType)) throw new TypeError(`${options.safeSearch} is an invalid safe search type!`);

  if (typeof options.safeSearch! === 'string')
    // @ts-ignore
    options.safeSearch = SafeSearchType[options.safeSearch!];

  if (typeof options.offset !== 'number') throw new TypeError(`Search offset is not a number!`);

  if (options.offset! < 0) throw new RangeError('Search offset cannot be below zero!');

  if (!options.locale || typeof options.locale! !== 'string') throw new TypeError('Search locale must be a string!');

  if (options.time && !Object.values(SearchTimeType).includes(options.time)) throw new TypeError(`${options.time} is an invalid time filter!`);

  if (options.definition && !Object.values(VideoDefinition).includes(options.definition))
    throw new TypeError(`${options.definition} is an invalid video definition!`);

  if (options.duration && !Object.values(VideoDuration).includes(options.duration))
    throw new TypeError(`${options.duration} is an invalid video duration!`);

  if (options.license && !Object.values(VideoLicense).includes(options.license))
    throw new TypeError(`${options.license} is an invalid video license!`);

  if (options.vqd && !/\d-\d+-\d+/.test(options.vqd)) throw new Error(`${options.vqd} is an invalid VQD!`);

  return options;
}
