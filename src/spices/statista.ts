import needle, { NeedleOptions } from 'needle';

import { parseSpiceBody, SPICE_BASE } from '../util';

/** A teaser image to a Statista statistic. */
export interface StatistaStatisticTeaserImage {
  width: number;
  src: string;
}

/** A Statista statistic. */
export interface StatistaStatistic {
  /** The title of the statistic */
  title: string;
  /** The ID of the statistic */
  identifier: number;
  /** The link to the statistic */
  Link: string;
  creator: any;
  /** The subject of the statistic */
  subject: string;
  /** The description of the statistic */
  description: string;
  FirstCharacteristic: any;
  FirstValue: any;
  /** Whether viewing this statistic requires a premium subscription */
  Premium: 1 | 0;
  /** A date string (ex. "19.02.2021") */
  date: string;
  ImageUrl: any;
  /** The teaser images of this statistic */
  teaserImageUrls: StatistaStatisticTeaserImage[];
  Note: any;
}

/**
 * The result from the statista spice.
 */
export interface StatistaResult {
  status: string;
  type: 'statistic';
  numberOfRecords: number;
  q: string;
  data: StatistaStatistic[];
}

/**
 * Search statistics.
 * Data provided by Statista.
 * @category Spice
 * @see https://www.statista.com/
 * @param query The query to search with
 * @param needleOptions The options for the HTTP request
 * @since v2.2.0
 * @returns The statista result
 */
export async function statista(query: string, needleOptions?: NeedleOptions): Promise<StatistaResult> {
  const response = await needle('get', `${SPICE_BASE}/statista/${encodeURIComponent(query)}`, needleOptions);
  const result = parseSpiceBody(response.body) as StatistaResult;

  return result;
}
