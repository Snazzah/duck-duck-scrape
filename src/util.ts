import needle, { NeedleOptions } from 'needle';

const VQD_REGEX = /vqd='(\d+-\d+-\d+)'/;

/** The safe search values when searching DuckDuckGo. */
export enum SafeSearchType {
  STRICT = 0,
  MODERATE = -1,
  OFF = -2
}

export function queryString(query: Record<string, string>) {
  return new URLSearchParams(query).toString();
}

export async function getVQD(query: string, ia = 'web', options?: NeedleOptions) {
  try {
    const response = await needle('get', `https://duckduckgo.com/?${queryString({ q: query, ia })}`, options);
    return VQD_REGEX.exec(response.body)![1];
  } catch (e) {
    throw new Error(`Failed to get the VQD for query "${query}".`);
  }
}
