import { decode } from 'html-entities';
import needle, { NeedleOptions } from 'needle';

import { DuckbarImageResult, DuckbarResponse } from '../types';
import { ensureJSON, getVQD, queryString, SafeSearchType } from '../util';

/** The types of image sizes. */
export enum ImageSize {
  /** Any size. */
  ALL = '',
  /** Small size, less than 200x200. */
  SMALL = 'Small',
  /** Medium size, approx. between 200x200 and 500x500. */
  MEDIUM = 'Medium',
  /** Large size, approx. between 500x500 and 2000x2000. */
  LARGE = 'Large',
  /** Wallpaper size, larger than 1200x1200. */
  WALLPAPER = 'Wallpaper'
}

/** The types of images. */
export enum ImageType {
  /** Any images. */
  ALL = '',
  /** Any regular photos. */
  PHOTOGRAPH = 'photo',
  /** Clipart. */
  CLIPART = 'clipart',
  /** Animated GIFs. */
  GIF = 'gif',
  /** Transparent photos. */
  TRANSPARENT = 'transparent'
}

/** The types of image layouts. */
export enum ImageLayout {
  /** Any size of images. */
  ALL = '',
  /** Square images. Images may not be exactly square. */
  SQUARE = 'Square',
  /** Tall images. More height than width. */
  TALL = 'Tall',
  /** Wide images. More width than height. */
  WIDE = 'Wide'
}

/** The types of image colors. */
export enum ImageColor {
  /** Any image. */
  ALL = '',
  /** Any image with color. */
  COLOR = 'color',
  /** Any monochome images. */
  BLACK_AND_WHITE = 'Monochrome',
  /** Mostly red images. */
  RED = 'Red',
  /** Mostly orange images. */
  ORANGE = 'Orange',
  /** Mostly yellow images. */
  YELLOW = 'Yellow',
  /** Mostly green images. */
  GREEN = 'Green',
  /** Mostly blue images. */
  BLUE = 'Blue',
  /** Mostly pink images. */
  PINK = 'Pink',
  /** Mostly brown images. */
  BROWN = 'Brown',
  /** Mostly black images. */
  BLACK = 'Black',
  /** Mostly gray images. */
  GRAY = 'Gray',
  /** Alias for `GRAY`. */
  GREY = 'Gray',
  /** Mostly teal images. */
  TEAL = 'Teal',
  /** Mostly white images. */
  WHITE = 'White'
}

/** The types of image licenses. */
export enum ImageLicense {
  /** Any image license. */
  ALL = '',
  /** All Creative Commons. */
  CREATIVE_COMMONS = 'Any',
  /** Public Domain images. */
  PUBLIC_DOMAIN = 'Public',
  /** Free to share and use. */
  SHARE = 'Share',
  /** Free to share and use commercially. */
  SHARE_COMMERCIALLY = 'ShareCommercially',
  /** Free to modify, share, and use. */
  MODIFY = 'Modify',
  /** Free to modify, share, and use commercially. */
  MODIFY_COMMERCIALLY = 'ModifyCommercially'
}

/** The options for {@link searchImages}. */
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
  /** The color filter of the images. */
  color?: ImageColor;
  /** The layout of the images to search. */
  layout?: ImageLayout;
  /** The size filter of the images to search. */
  size?: ImageSize;
  /** The type of the images to search. */
  type?: ImageType;
  /** The license of the images to search. */
  license?: ImageLicense;
}

const defaultOptions: ImageSearchOptions = {
  safeSearch: SafeSearchType.OFF,
  locale: 'en-us',
  offset: 0
};

/** The search results from {@link searchImages}. */
export interface ImageSearchResults {
  /** Whether there were no results found. */
  noResults: boolean;
  /** The VQD of the search query. */
  vqd: string;
  /** The image results of the search. */
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
export async function searchImages(query: string, options?: ImageSearchOptions, needleOptions?: NeedleOptions): Promise<ImageSearchResults> {
  if (!query) throw new Error('Query cannot be empty!');
  if (!options) options = defaultOptions;
  else options = sanityCheck(options);

  let vqd = options.vqd!;
  if (!vqd) vqd = await getVQD(query, 'web', needleOptions);

  /* istanbul ignore next */
  const filters = [
    options.size ? `size:${options.size}` : '',
    options.type ? `type:${options.type}` : '',
    options.layout ? `layout:${options.layout}` : '',
    options.color ? `color:${options.color}` : '',
    options.license ? `license:${options.license}` : ''
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

  const response = await needle('get', `https://duckduckgo.com/i.js?${queryString(queryObject)}`, needleOptions);

  if (response.statusCode === 403) throw new Error('A server error occurred!');

  const imagesResult = ensureJSON(response.body) as DuckbarResponse<DuckbarImageResult>;

  return {
    noResults: !imagesResult.results.length,
    vqd,
    results: imagesResult.results.map((image) => ({
      ...image,
      title: decode(image.title)
    }))
  };
}

function sanityCheck(options: ImageSearchOptions) {
  options = Object.assign({}, defaultOptions, options);

  if (!(options.safeSearch! in SafeSearchType)) throw new TypeError(`${options.safeSearch} is an invalid safe search type!`);

  /* istanbul ignore next */
  if (typeof options.safeSearch! === 'string') options.safeSearch = SafeSearchType[options.safeSearch!] as any as SafeSearchType;

  if (typeof options.offset !== 'number') throw new TypeError(`Search offset is not a number!`);

  if (options.offset! < 0) throw new RangeError('Search offset cannot be below zero!');

  if (!options.locale || typeof options.locale! !== 'string') throw new TypeError('Search locale must be a string!');

  if (options.size && !Object.values(ImageSize).includes(options.size)) throw new TypeError(`${options.size} is an invalid image size filter!`);

  if (options.type && !Object.values(ImageType).includes(options.type)) throw new TypeError(`${options.type} is an invalid image type filter!`);

  if (options.layout && !Object.values(ImageLayout).includes(options.layout))
    throw new TypeError(`${options.layout} is an invalid image layout filter!`);

  if (options.color && !Object.values(ImageColor).includes(options.color)) throw new TypeError(`${options.color} is an invalid color filter!`);

  if (options.license && !Object.values(ImageLicense).includes(options.license))
    throw new TypeError(`${options.license} is an invalid license filter!`);

  if (options.vqd && !/\d-\d+-\d+/.test(options.vqd)) throw new Error(`${options.vqd} is an invalid VQD!`);

  return options;
}
