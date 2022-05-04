import needle, { NeedleOptions } from 'needle';

import { parseSpiceBody, SPICE_BASE } from '../util';

/** A security instance. */
export interface StocksSecurity {
  /** Whether the market is the most liquid market for the security. */
  MostLiquidExchange: boolean;
  /** The category of business or industry classification of the security's issuing company. */
  CategoryOrIndustry: string | null;
  /** The Market Identification Code for the exchange. */
  MarketIdentificationCode: string;
  /** The name of the market or exchange on which the security is listed. */
  Market: string;
  /** The name for the security. */
  Name: string;
  /** The VALOR number assigned to a financial instrument. */
  Valoren: string;
  /** The International Securities Identification Number assigned to the security. */
  ISIN: string | null;
  /** The symbol identifier (trading symbol) for the security. */
  Symbol: string;
  /** Committee on Uniform Securities Identification Procedures identifier. Always null. */
  CUSIP: null;
  /** The Central Index Key assigned to a security's issuing company. */
  CIK: string;
}

/**
 * The result from the stocks spice.
 * @see https://www.xignite.com/product/global-stock-quote-data#/DeveloperResources/request/GetGlobalDelayedQuote
 */
export interface StocksResult {
  /** The trading halt status of the security. "true" means that trading in the security is halted as of the quote Time. */
  TradingHalted: boolean;
  /** The lowest price at which the security traded in the last 52 weeks. */
  Low52Weeks: number;
  /** The highest price at which the security traded in the last 52 weeks. */
  High52Weeks: number;
  /** The total quantity offered at the ask price. */
  AskSize: number;
  /** 	The lowest ask price for the security as of the quote's Date and Time. */
  Ask: number;
  /** The total quantity offered at the bid price. */
  BidSize: number;
  /** The highest bid price for the security as of the quote's Date and Time. */
  Bid: number;
  /** The percentage difference between Last and PreviousClose prices. */
  PercentChangeFromPreviousClose: number;
  /** The price difference between Last and PreviousClose prices. */
  ChangeFromPreviousClose: number;
  /**	The price for the security at Market close of the previous trading day. */
  PreviousClose: number;
  /**	The total trading volume of the security for the day. */
  Volume: number;
  /**	The number of shares traded at the last price. */
  LastSize: number;
  /** The price at which the last trade occurred for the security as of the quote's Time. */
  Last: number;
  /** The day's lowest traded price for the security as of the quote's Date and Time. */
  Low: number;
  /** The day's highest traded price for the security as of the quote's Date and Time. */
  High: number;
  /** The closing price for the security as of the quote's Date. */
  Close: number;
  /** The opening price for the security as of the quote's Date. */
  Open: number;
  /** The offset or difference, in hours, from the NASDAQ local time to UTC. */
  UTCOffset: number;
  /** The time it took for the server to complete a request. */
  Delay: number;
  /** The outcome of the call. */
  Outcome: 'Success' | 'SystemError' | 'RequestError' | 'RegistrationError';
  /** The security instance of the quote. */
  Security: StocksSecurity;
  IdentifierType: string;
  Identifier: string;
  /** The Market Identification Code of the Last price. */
  LastMarketIdentificationCode: string;
  /** The Market Identification Code of the Ask. */
  AskMarketIdentificationCode: string;
  /** The Market Identification Code of the Bid. */
  BidMarketIdentificationCode: string;
  /** The currency of the equity. */
  Currency: string;
  /** The time of the Ask in the local time of the exchange (Eastern Time). */
  AskTime: string;
  /** The date of the Ask in the local time of the exchange (Eastern Time). */
  AskDate: string;
  /** The time of the Bid in the local time of the exchange (Eastern Time). */
  BidTime: string;
  /** The date of the Bid in the local time of the exchange (Eastern Time). */
  BidDate: string;
  /** The date for the closing price returned in the PreviousClose parameter. */
  PreviousCloseDate: string;
  /** The time of the last trade, in Eastern Time. */
  Time: string;
  /** The date of the last trade, in Eastern Time. */
  Date: string;
  /** A description of how the call was authenticated. */
  Identity: 'IP' | 'Cookie' | 'Header' | 'Request';
  /** A short message describing the error or an informational message. */
  Message: string;
}

/**
 * Get the stocks of a symbol.
 * Data provided by Xignite.
 * @category Spice
 * @see https://www.xignite.com/
 * @param symbol What symbol to get stats from
 * @param needleOptions The options for the HTTP request
 * @returns The stocks result
 */
export async function stocks(symbol: string, needleOptions?: NeedleOptions): Promise<StocksResult> {
  if (!symbol) throw new Error('Symbol cannot be empty!');

  const response = await needle('get', `${SPICE_BASE}/stocks/${symbol}`, needleOptions);
  const result = parseSpiceBody(response.body) as StocksResult;
  if (result.Outcome !== 'Success') throw new Error(`${result.Outcome}: ${result.Message}`);

  return result;
}
