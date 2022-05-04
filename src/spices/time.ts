import needle, { NeedleOptions } from 'needle';

import { parseSpiceBody, SPICE_BASE } from '../util';

export interface TimeDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export interface TimeChanges {
  newdst: number;
  newzone: null;
  newoffset: number;
  /** ISO date string */
  utctime: string;
  /** ISO date string */
  oldlocaltime: string;
  /** ISO date string */
  newlocaltime: string;
  verbose: {
    utctime: {
      datetime: TimeDateTime;
    };
    oldlocaltime: {
      datetime: TimeDateTime;
    };
    newlocaltime: {
      datetime: TimeDateTime;
    };
  };
}

export interface TimeLocation {
  id: string;
  geo: {
    name: string;
    state: string;
    country: {
      id: string;
      name: string;
    };
    latitude: number;
    longitude: number;
  };
  matches: string;
  score: number;
  time: {
    iso: string;
    datetime: {
      year: number;
      month: number;
      day: number;
      hour: number;
      minute: number;
      second: number;
    };
    timezone: {
      offset: string;
      zoneabb: string;
      zonename: string;
      zoneoffset: number;
      zonedst: number;
      zonetotaloffset: number;
    };
  };
  timechanges: TimeChanges[];
  astronomy: {
    objects: [
      {
        name: 'sun';
        events: [
          {
            type: 'rise';
            hour: number;
            minute: number;
          },
          {
            type: 'set';
            hour: number;
            minute: number;
          }
        ];
      }
    ];
  };
}

/**
 * The result from the time spice.
 * @see https://services.timeanddate.com/api/doc/current/srv-timeservice.html
 */
export interface TimeResult {
  version: 1;
  info: string;
  locations?: TimeLocation[];
}

/**
 * Search the time of locations with a query.
 * Data provided by TimeAndDate.com.
 * @category Spice
 * @see https://www.timeanddate.com/
 * @param query The query to search with
 * @param needleOptions The options of the HTTP request
 * @returns The time result
 */
export async function time(query: string, needleOptions?: NeedleOptions): Promise<TimeResult> {
  if (!query) throw new Error('Query cannot be empty!');

  const response = await needle('get', `${SPICE_BASE}/time/${query}`, needleOptions);
  return parseSpiceBody(response.body) as TimeResult;
}
