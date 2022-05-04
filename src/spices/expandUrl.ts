import needle, { NeedleOptions } from 'needle';

import { parseSpiceBody, SPICE_BASE } from '../util';

/**
 * The result from the expandUrl spice.
 */
export interface ExpandUrlResult {
  requested_url: string;
  success: boolean;
  resolved_url: string;
  usage_count: number;
  remaining_calls: number;
  error?: string;
}

/**
 * Expand a shortened link.
 * Data provided by Unshorten.me.
 * @category Spice
 * @see https://unshorten.me/
 * @param url The URL to unshorten
 * @param needleOptions The options for the HTTP request
 * @since v2.2.0
 * @returns The expandUrl result
 */
export async function expandUrl(url: string, needleOptions?: NeedleOptions): Promise<ExpandUrlResult> {
  if (!url) throw new Error('URL cannot be empty!');

  const response = await needle('get', `${SPICE_BASE}/expand_url/${encodeURIComponent(url)}`, needleOptions);
  const result = parseSpiceBody(response.body) as ExpandUrlResult;

  return result;
}
