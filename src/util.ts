import needle, { NeedleOptions } from 'needle';

/** @internal */
export const SPICE_BASE = 'https://duckduckgo.com/js/spice';
/** @internal */
export const VQD_REGEX = /vqd=['"](\d+-\d+(?:-\d+)?)['"]/;
/** @internal */
export const COMMON_HEADERS: Record<string, string> = {
  'sec-ch-ua': '"Not=A?Brand";v="8", "Chromium";v="129"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'sec-fetch-user': '?1',
  'sec-gpc': '1',
  'upgrade-insecure-requests': '1',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
};

/** The safe search values when searching DuckDuckGo. */
export enum SafeSearchType {
  /** Strict filtering, no NSFW content. */
  STRICT = 0,
  /** Moderate filtering. */
  MODERATE = -1,
  /** No filtering. */
  OFF = -2
}

/** The type of time ranges of the search results in DuckDuckGo. */
export enum SearchTimeType {
  /** From any time. */
  ALL = 'a',
  /** From the past day. */
  DAY = 'd',
  /** From the past week. */
  WEEK = 'w',
  /** From the past month. */
  MONTH = 'm',
  /** From the past year. */
  YEAR = 'y'
}

export function queryString(query: Record<string, string>) {
  return new URLSearchParams(query).toString();
}

/**
 * Get the VQD of a search query.
 * @param query The query to search
 * @param ia The type(?) of search
 * @param options The options of the HTTP request
 * @returns The VQD
 */
export async function getVQD(query: string, ia = 'web', options?: NeedleOptions) {
  try {
    const response = await needle('get', `https://duckduckgo.com/?${queryString({ q: query, ia })}`, options);
    return VQD_REGEX.exec(response.body)![1];
  } catch (e) {
    throw new Error(`Failed to get the VQD for query "${query}".`);
  }
}

export function ensureJSON(body: any) {
  if (body instanceof Buffer) return JSON.parse(body.toString());
  else if (typeof body === 'string') return JSON.parse(body);
  return body;
}

export function parseSpiceBody(body: any, regex = /^ddg_spice_[\w]+\(\n?((?:.|\n)+)\n?\);?/) {
  return JSON.parse(regex.exec(body.toString())![1]);
}
