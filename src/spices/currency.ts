import needle, { NeedleOptions } from 'needle';

import { parseSpiceBody, SPICE_BASE } from '../util';

/** A conversion of currency. */
export interface CurrencyConversion {
  /** A timestamp of the last rate this conversion is based on. (i.e. 2021-04-18 16:00 GMT) */
  'rate-utc-timestamp': string;
  /** The amount of currency that will be converted. */
  'from-amount': string;
  /** The symbol of the currency being converted. (i.e. BRL) */
  'from-currency-symbol': string;
  /** The name of the currency being converted. (i.e. Brazil Reais) */
  'from-currency-name': string;
  /** The amount of currency converted. */
  'converted-amount': string;
  /** The symbol of the currency thats being converted into. (i.e. EUR) */
  'to-currency-symbol': string;
  /** The name of the currency thats being converted into. (i.e. Euro) */
  'to-currency-name': string;
  /** The rate of conversion in a string (i.e. 1 BRL = 0.149354 EUR) */
  'conversion-rate': string;
  /** The inverse rate of conversion in a string (i.e. 1 EUR = 6.69551 BRL) */
  'conversion-inverse': string;
}

/** An expanded conversion of currency. */
export interface CurrencyExpandedConversion extends CurrencyConversion {
  /** The frequency of the rate. */
  'rate-frequency': string;
}

/**
 * The result from the currency spice.
 */
export interface CurrencyResult {
  headers: {
    encoding: 'utf-8';
    language: string;
    'legal-warning': string;
    'help-notice': string;
    'utc-timestamp': string;
    status: '0' | '4' | '5';
    'output-format': 'json';
    description: string;
  };
  conversion: CurrencyExpandedConversion;
  topConversions: CurrencyConversion[];
}

/**
 * Get the currency conversion between two currencies.
 * Data provided by XE.
 * @category Spice
 * @see https://www.xe.com/
 * @param from The currency to convert from
 * @param to The currency to convert to
 * @param amount The amount of currency to convert
 * @param needleOptions The options for the HTTP request
 * @returns The currency result
 */
export async function currency(from: string, to: string, amount = 1, needleOptions?: NeedleOptions): Promise<CurrencyResult> {
  if (!from) throw new Error('Currency `from` cannot be empty!');
  if (!to) throw new Error('Currency `to` cannot be empty!');

  const response = await needle('get', `${SPICE_BASE}/currency/${amount}/${from}/${to}`, needleOptions);
  const result = parseSpiceBody(response.body) as CurrencyResult;
  if (result.headers.status !== '0') throw new Error(result.headers.description);

  return result;
}
