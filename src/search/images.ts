import { decode } from 'html-entities';
import needle, { NeedleOptions } from 'needle';
import { DuckbarResponse, DuckbarImageResult } from '../types';
import { getVQD, queryString } from '../util';
import { SafeSearchType } from '../util';

export enum ImageSize {
  ALL = '',
  SMALL = 'Small',
  MEDIUM = 'Medium',
  LARGE = 'Large',
  WALLPAPER = 'Wallpaper'
}

export enum ImageType {
  ALL = '',
  PHOTOGRAPH = 'photo',
  CLIPART = 'clipart',
  GIF = 'gif',
  TRANSPARENT = 'transparent'
}

export enum ImageLayout {
  ALL = '',
  SQUARE = 'Square',
  TALL = 'Tall',
  WIDE = 'Wide'
}

export enum ImageColor {
  ALL = '',
  COLOR = 'color',
  BLACK_AND_WHITE = 'Monochrome',
  RED = 'Red',
  ORANGE = 'Orange',
  YELLOW = 'Yellow',
  GREEN = 'Green',
  BLUE = 'Blue',
  PINK = 'Pink',
  BROWN = 'Brown',
  BLACK = 'Black',
  GRAY = 'Gray',
  GREY = 'Gray',
  TEAL = 'Teal',
  WHITE = 'White'
}

export interface ImageSearchOptions {
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
  color?: ImageColor;
  layout?: ImageLayout;
  size?: ImageSize;
  type?: ImageType;
}

const defaultOptions: ImageSearchOptions = {
  safeSearch: SafeSearchType.OFF,
  locale: 'en-us',
  offset: 0
};

export interface ImageSearchResults {
  noResults: boolean;
  vqd: string;
  results: DuckbarImageResult[];
}

/**
 * Search images.
 * @category Search
 * @param query The query to search with
 * @param options The options of the search
 * @param needleOptions The options of the HTTP request
 * @returns Search results
 */
export async function searchImages(
  query: string,
  options?: ImageSearchOptions,
  needleOptions?: NeedleOptions
): Promise<ImageSearchResults> {
  if (!query) throw new Error('Query cannot be empty!');
  if (!options) options = defaultOptions;
  else options = sanityCheck(options);

  let vqd = options.vqd!;
  if (!vqd) vqd = await getVQD(query, 'web', needleOptions);

  const filters = [
    options.size ? `size:${options.size}` : '',
    options.type ? `type:${options.type}` : '',
    options.layout ? `layout:${options.layout}` : '',
    options.color ? `color:${options.color}` : ''
  ];

  const queryObject: Record<string, string> = {
    l: options.locale!,
    o: 'json',
    q: query,
    vqd,
    p: options.safeSearch === 0 ? '1' : '-1',
    f: filters.toString(),
    s: String(options.offset || 0)
  };

  const response = await needle(
    'get',
    `https://duckduckgo.com/i.js?${queryString(queryObject)}`,
    needleOptions
  );

  if (response.statusCode === 403) throw new Error('A server error occurred!');

  const imagesResult = JSON.parse(response.body.toString()) as DuckbarResponse<DuckbarImageResult>;

  return {
    noResults: !!imagesResult.results.length,
    vqd,
    results: imagesResult.results.map((image) => ({
      ...image,
      title: decode(image.title)
    }))
  };
}

function sanityCheck(options: ImageSearchOptions) {
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

  if (options.size && !Object.values(ImageSize).includes(options.size))
    throw new TypeError(`${options.size} is an invalid image size filter!`);

  if (options.type && !Object.values(ImageType).includes(options.type))
    throw new TypeError(`${options.type} is an invalid image type filter!`);

  if (options.layout && !Object.values(ImageLayout).includes(options.layout))
    throw new TypeError(`${options.layout} is an invalid image layout filter!`);

  if (options.color && !Object.values(ImageColor).includes(options.color))
    throw new TypeError(`${options.color} is an invalid color filter!`);

  if (options.vqd && !/\d-\d+-\d+/.test(options.vqd)) throw new Error(`${options.vqd} is an invalid VQD!`);

  return options;
}
